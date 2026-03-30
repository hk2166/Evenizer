import mongoose, { Schema, Document } from "mongoose";
import { UserRole } from "../models/enum.js";

/**
 * Interface representing a User document in MongoDB
 * This extends Document to get MongoDB _id and other methods
 */
export interface IUserDocument extends Document {
  name: string;
  email: string;
  password: string;
  role: UserRole;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * User Schema Definition
 * This defines how user data is stored in MongoDB
 */
const userSchema = new Schema<IUserDocument>(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      minlength: [2, "Name must be at least 2 characters"],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, "Please provide a valid email"],
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [6, "Password must be at least 6 characters"],
    },
    role: {
      type: String,
      enum: Object.values(UserRole),
      required: true,
    },
  },
  {
    timestamps: true, // Automatically adds createdAt and updatedAt
  }
);

// Create index on email for faster lookups
userSchema.index({ email: 1 });

export const UserModel = mongoose.model<IUserDocument>("User", userSchema);
