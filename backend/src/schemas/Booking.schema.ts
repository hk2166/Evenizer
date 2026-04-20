import mongoose, { Schema, Document } from "mongoose";
import { BookingStatus } from "../models/enum.js";

export interface IBookingDocument extends Document {
  customerId: mongoose.Types.ObjectId;
  eventId: mongoose.Types.ObjectId;
  ticketCategoryId: mongoose.Types.ObjectId;
  quantity: number;
  totalAmount: number;
  status: BookingStatus;
  reservedAt: Date;
  paidAt?: Date;
  confirmedAt?: Date;
  cancelledAt?: Date;
  expiresAt: Date;
  paymentId?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
  
  // State machine methods
  canTransitionTo(newStatus: BookingStatus): boolean;
  transitionTo(newStatus: BookingStatus): void;
  isExpired(): boolean;
}

const bookingSchema = new Schema<IBookingDocument>(
  {
    customerId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    eventId: {
      type: Schema.Types.ObjectId,
      ref: "Event",
      required: true,
    },
    ticketCategoryId: {
      type: Schema.Types.ObjectId,
      ref: "TicketCategory",
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
      min: [1, "Quantity must be at least 1"],
    },
    totalAmount: {
      type: Number,
      required: true,
      min: [0, "Total amount cannot be negative"],
    },
    status: {
      type: String,
      enum: Object.values(BookingStatus),
      default: BookingStatus.RESERVED,
    },
    reservedAt: {
      type: Date,
      required: true,
      default: Date.now,
    },
    paidAt: {
      type: Date,
    },
    confirmedAt: {
      type: Date,
    },
    cancelledAt: {
      type: Date,
    },
    expiresAt: {
      type: Date,
      required: true,
    },
    paymentId: {
      type: Schema.Types.ObjectId,
      ref: "Payment",
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for efficient queries
bookingSchema.index({ customerId: 1, createdAt: -1 }); // Customer booking history
bookingSchema.index({ eventId: 1, status: 1 }); // Event booking queries
bookingSchema.index({ status: 1, expiresAt: 1 }); // Expiration worker queries
bookingSchema.index({ ticketCategoryId: 1 }); // Ticket category lookups

// State machine validation method
bookingSchema.methods.canTransitionTo = function(newStatus: BookingStatus): boolean {
  const validTransitions: Record<BookingStatus, BookingStatus[]> = {
    [BookingStatus.RESERVED]: [BookingStatus.PAID, BookingStatus.EXPIRED, BookingStatus.CANCELLED],
    [BookingStatus.PAID]: [BookingStatus.CONFIRMED, BookingStatus.CANCELLED],
    [BookingStatus.CONFIRMED]: [],
    [BookingStatus.EXPIRED]: [],
    [BookingStatus.CANCELLED]: [],
  };
  
  const currentStatus = this.status as BookingStatus;
  return validTransitions[currentStatus]?.includes(newStatus) ?? false;
};

// State transition method
bookingSchema.methods.transitionTo = function(newStatus: BookingStatus): void {
  if (!this.canTransitionTo(newStatus)) {
    throw new Error(`Invalid transition from ${this.status} to ${newStatus}`);
  }
  
  this.status = newStatus;
  
  // Set timestamps based on new status
  if (newStatus === BookingStatus.PAID) {
    this.paidAt = new Date();
  }
  if (newStatus === BookingStatus.CONFIRMED) {
    this.confirmedAt = new Date();
  }
  if (newStatus === BookingStatus.CANCELLED) {
    this.cancelledAt = new Date();
  }
};

// Check if booking is expired
bookingSchema.methods.isExpired = function(): boolean {
  return this.status === BookingStatus.RESERVED && new Date() > this.expiresAt;
};

export const BookingModel = mongoose.model<IBookingDocument>("Booking", bookingSchema);
