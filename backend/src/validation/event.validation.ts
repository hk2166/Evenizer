// backend/src/validation/event.validation.ts
import { z } from "zod";


export const createEventSchema = z.object({
  body: z.object({
    title: z.string().min(3, "Title must be at least 3 characters"),
    description: z.string().min(10, "Description must be at least 10 characters long"),
    date: z.string(),
    location: z.string().min(1, "Location is required"),
    organizerId: z.string().uuid("Organizer ID must be a valid UUID"),
  }),
});


export const eventIdSchema = z.object({
  params: z.object({
    id: z.string().uuid("Event ID must be a valid UUID"),
  }),
});

export const updateEventSchema = z.object({
  params: z.object({
    id: z.string().uuid("Event ID must be a valid UUID"),
  }),
  body: z.object({
    title: z.string().min(3, "Title must be at least 3 characters").optional(),
    description: z.string().min(10, "Description must be at least 10 characters").optional(),
    date: z.string().or(z.date()).optional(),
    location: z.string().min(1, "Location cannot be empty").optional(),
  }),
});


export type CreateEventInput = z.infer<typeof createEventSchema>["body"];
export type EventIdParams = z.infer<typeof eventIdSchema>["params"];
export type UpdateEventInput = z.infer<typeof updateEventSchema>;
