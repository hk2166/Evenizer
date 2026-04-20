import { z } from "zod";
import { PaymentMethod } from "../models/enum.js";

// Validation schema for creating a booking
export const createBookingSchema = z.object({
  body: z.object({
    eventId: z.string().min(1, "Event ID is required"),
    ticketCategoryId: z.string().min(1, "Ticket category ID is required"),
    quantity: z.number().int().positive("Quantity must be a positive integer"),
  }),
});

// Validation schema for processing payment
export const processPaymentSchema = z.object({
  body: z.object({
    paymentMethod: z.nativeEnum(PaymentMethod),
  }),
  params: z.object({
    id: z.string().min(1, "Booking ID is required"),
  }),
});

// Validation schema for cancelling booking
export const cancelBookingSchema = z.object({
  params: z.object({
    id: z.string().min(1, "Booking ID is required"),
  }),
});

// Validation schema for getting customer bookings
export const getCustomerBookingsSchema = z.object({
  params: z.object({
    customerId: z.string().min(1, "Customer ID is required"),
  }),
  query: z.object({
    status: z.string().optional(),
  }),
});

// Validation schema for getting event bookings
export const getEventBookingsSchema = z.object({
  params: z.object({
    eventId: z.string().min(1, "Event ID is required"),
  }),
  query: z.object({
    status: z.string().optional(),
  }),
});

// Validation schema for getting booking by ID
export const getBookingByIdSchema = z.object({
  params: z.object({
    id: z.string().min(1, "Booking ID is required"),
  }),
});

export type CreateBookingInput = z.infer<typeof createBookingSchema>["body"];
export type ProcessPaymentInput = z.infer<typeof processPaymentSchema>["body"];
