import mongoose, { Schema, Document } from "mongoose";

export interface ITicketCategoryDocument extends Document {
  title: string;
  price: number;
  type: string;
  totalSeats: number;
  availableSeats: number;
  reservedSeats: number;
  eventId: mongoose.Types.ObjectId; // Reference to Event
  createdAt: Date;
  updatedAt: Date;
}

const ticketCategorySchema = new Schema<ITicketCategoryDocument>(
  {
    title: {
      type: String,
      required: [true, "Ticket category title is required"],
      trim: true,
    },
    price: {
      type: Number,
      required: [true, "Price is required"],
      min: [0, "Price cannot be negative"],
    },
    type: {
      type: String,
      required: [true, "Ticket type is required"],
      trim: true,
    },
    totalSeats: {
      type: Number,
      required: [true, "Total seats is required"],
      min: [1, "Must have at least 1 seat"],
    },
    availableSeats: {
      type: Number,
      required: [true, "Available seats is required"],
      min: [0, "Available seats cannot be negative"],
      validate: {
        validator: function(this: ITicketCategoryDocument, value: number) {
          return value <= this.totalSeats;
        },
        message: "Available seats cannot exceed total seats",
      },
    },
    reservedSeats: {
      type: Number,
      required: [true, "Reserved seats is required"],
      default: 0,
      min: [0, "Reserved seats cannot be negative"],
    },
    eventId: {
      type: Schema.Types.ObjectId,
      ref: "Event",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index for querying tickets by event
ticketCategorySchema.index({ eventId: 1, type: 1 });
ticketCategorySchema.index({ availableSeats: 1 }); // Availability queries

export const TicketCategoryModel = mongoose.model<ITicketCategoryDocument>(
  "TicketCategory",
  ticketCategorySchema
);
