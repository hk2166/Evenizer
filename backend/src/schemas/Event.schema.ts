import mongoose, { Schema, Document } from "mongoose";
import { EventStatus } from "../models/enum.js";

export interface IEventDocument extends Document {
  title: string;
  description: string;
  location: string;
  status: EventStatus;
  date: Date;
  organizerId: mongoose.Types.ObjectId;
  ticketCategories: mongoose.Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

const eventSchema = new Schema<IEventDocument>(
  {
    title: {
      type: String,
      required: [true, "Event title is required"],
      trim: true,
    },
    description: {
      type: String,
      required: [true, "Event description is required"],
      trim: true,
    },
    location: {
      type: String,
      required: [true, "Event location is required"],
      trim: true,
    },
    status: {
      type: String,
      enum: Object.values(EventStatus),
      default: EventStatus.DRAFT,
    },
    date: {
      type: Date,
      required: [true, "Event date is required"],
    },
    organizerId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    ticketCategories: [
      {
        type: Schema.Types.ObjectId,
        ref: "TicketCategory",
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Indexes
eventSchema.index({ organizerId: 1, createdAt: -1 }); // Organizer's events
eventSchema.index({ status: 1, date: 1 }); // Published events by date
eventSchema.index({ date: 1 }); // Events by date

export const EventModel = mongoose.model<IEventDocument>("Event", eventSchema);
