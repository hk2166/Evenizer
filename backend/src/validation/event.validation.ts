// backend/src/validation/event.validation.ts
import { z } from "zod";

/**
 * Validation schema for creating an event
 * This validates the incoming HTTP request data
 */
export const createEventSchema = z.object({
  body: z.object({
    title: z.string().min(3, "Title must be at least 3 characters"),
    description: z.string().min(10, "Description must be at least 10 characters long"),
    date: z.string().or(z.date()),
    location: z.string().min(1, "Location is required"),
    organizerId: z.string().uuid("Organizer ID must be a valid UUID"),
  }),
});

/**
 * TypeScript type inferred from the schema
 * Use this in your controller for type safety
 */
export type CreateEventInput = z.infer<typeof createEventSchema>["body"];
