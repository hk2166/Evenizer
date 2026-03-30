import mongoose, { Schema, Document } from "mongoose";
import { EventStatus } from "../models/enum.js";

export interface IEventDocument extends Document {
  title: string;
  description: string;
  location: string;
  date: Date;
  status: EventStatus;
  organizerId: mongoose.Types.ObjectId; // Reference to User
  createdAt: Date;
  updatedAt: Date;
}

const eventSchema = new Schema<IEventDocument>(
  {
    title: {
      type: String,
      required: [true, "Event title is required"],
      trim: true,
      minlength: [3, "Title must be at least 3 characters"],
    },
    description: {
      type: String,
      required: [true, "Description is required"],
      minlength: [10, "Description must be at least 10 characters"],
    },
    location: {
      type: String,
      required: [true, "Location is required"],
    },
    date: {
      type: Date,
      required: [true, "Event date is required"],
      validate: {
        validator: function (value: Date) {
          return value > new Date(); // Event must be in the future
        },
        message: "Event date must be in the future",
      },
    },
    status: {
      type: String,
      enum: Object.values(EventStatus),
      default: EventStatus.DRAFT,
    },
    organizerId: {
      type: Schema.Types.ObjectId,
      ref: "User", // Reference to User collection
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for common queries
eventSchema.index({ status: 1, date: 1 }); // Find published events by date
eventSchema.index({ organizerId: 1 }); // Find events by organizer

export const EventModel = mongoose.model<IEventDocument>("Event", eventSchema);
