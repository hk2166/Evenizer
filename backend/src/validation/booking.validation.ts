import { z } from "zod";
import { BookingStatus, PaymentMethod } from "../models/enum.js";

const postgresUuid = z
  .string()
  .regex(
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i,
    "ID must be a valid UUID",
  );

// Validation schema for creating a booking
export const createBookingSchema = z.object({
  body: z.object({
    eventId: postgresUuid,
    ticketCategoryId: postgresUuid,
    quantity: z.number().int().positive("Quantity must be a positive integer"),
  }),
});

// Validation schema for processing payment
export const processPaymentSchema = z.object({
  body: z.object({
    paymentMethod: z.nativeEnum(PaymentMethod),
  }),
  params: z.object({
    id: postgresUuid,
  }),
});

// Validation schema for cancelling booking
export const cancelBookingSchema = z.object({
  params: z.object({
    id: postgresUuid,
  }),
});

// Validation schema for getting customer bookings
export const getCustomerBookingsSchema = z.object({
  params: z.object({
    customerId: postgresUuid,
  }),
  query: z.object({
    status: z.nativeEnum(BookingStatus).optional(),
  }),
});

// Validation schema for getting event bookings
export const getEventBookingsSchema = z.object({
  params: z.object({
    eventId: postgresUuid,
  }),
  query: z.object({
    status: z.nativeEnum(BookingStatus).optional(),
  }),
});

// Validation schema for getting booking by ID
export const getBookingByIdSchema = z.object({
  params: z.object({
    id: postgresUuid,
  }),
});

export type CreateBookingInput = z.infer<typeof createBookingSchema>["body"];
export type ProcessPaymentInput = z.infer<typeof processPaymentSchema>["body"];
