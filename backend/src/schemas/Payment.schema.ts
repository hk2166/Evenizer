import mongoose, { Schema, Document } from "mongoose";
import { PaymentMethod, PaymentStatus } from "../models/enum.js";

export interface IPaymentDocument extends Document {
  bookingId: mongoose.Types.ObjectId; // Reference to Booking
  amount: number;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  transactionId?: string; // External payment gateway transaction ID
  createdAt: Date;
  updatedAt: Date;
}

const paymentSchema = new Schema<IPaymentDocument>(
  {
    bookingId: {
      type: Schema.Types.ObjectId,
      ref: "Booking",
      required: true,
      unique: true, // One payment per booking
    },
    amount: {
      type: Number,
      required: [true, "Amount is required"],
      min: [0, "Amount cannot be negative"],
    },
    paymentMethod: {
      type: String,
      enum: Object.values(PaymentMethod),
      required: true,
    },
    paymentStatus: {
      type: String,
      enum: Object.values(PaymentStatus),
      default: PaymentStatus.PENDING,
    },
    transactionId: {
      type: String,
      sparse: true, // Allows multiple null values but unique non-null values
    },
  },
  {
    timestamps: true,
  }
);

// Index for finding payments by booking
paymentSchema.index({ bookingId: 1 });

export const PaymentModel = mongoose.model<IPaymentDocument>(
  "Payment",
  paymentSchema
);
