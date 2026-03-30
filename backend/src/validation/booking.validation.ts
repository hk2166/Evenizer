// backend/src/validation/booking.validation.ts
import { z } from "zod";

/**
 * Validation schema for creating a booking
 * This validates the incoming HTTP request data
 */
export const createBookingSchema = z.object({
  body: z.object({
    customerId: z.string().uuid("Customer ID must be a valid UUID"),
    ticketCategoryId: z.string().uuid("Ticket category ID must be a valid UUID"),
    quantity: z.number().int().positive("Quantity must be a positive number"),
  }),
});

/**
 * TypeScript type inferred from the schema
 * Use this in your controller for type safety
 */
export type CreateBookingInput = z.infer<typeof createBookingSchema>["body"];
