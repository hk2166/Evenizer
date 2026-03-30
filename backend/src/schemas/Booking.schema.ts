import mongoose, { Schema, Document } from "mongoose";
import { BookingStatus } from "../models/enum.js";

export interface IBookingDocument extends Document {
  customerId: mongoose.Types.ObjectId; // Reference to User
  eventId: mongoose.Types.ObjectId; // Reference to Event
  ticketCategoryId: mongoose.Types.ObjectId; // Reference to TicketCategory
  quantity: number;
  totalAmount: number;
  status: BookingStatus;
  bookingDate: Date;
  expiresAt?: Date; // For RESERVED status timeout
  createdAt: Date;
  updatedAt: Date;
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
      required: [true, "Quantity is required"],
      min: [1, "Quantity must be at least 1"],
    },
    totalAmount: {
      type: Number,
      required: [true, "Total amount is required"],
      min: [0, "Total amount cannot be negative"],
    },
    status: {
      type: String,
      enum: Object.values(BookingStatus),
      default: BookingStatus.RESERVED,
    },
    bookingDate: {
      type: Date,
      default: Date.now,
    },
    expiresAt: {
      type: Date,
      // Will be set to 15 minutes from booking for RESERVED status
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for common queries
bookingSchema.index({ customerId: 1, status: 1 }); // Customer's bookings
bookingSchema.index({ eventId: 1, status: 1 }); // Event's bookings
bookingSchema.index({ expiresAt: 1 }); // For expiring reserved bookings

export const BookingModel = mongoose.model<IBookingDocument>(
  "Booking",
  bookingSchema
);
