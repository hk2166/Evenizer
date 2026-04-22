// backend/src/validation/event.validation.ts
import { z } from "zod";

const postgresUuid = z
  .string()
  .regex(
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i,
    "Event ID must be a valid UUID",
  );

const ticketCategorySchema = z.object({
  title: z.string().min(1, "Ticket title is required"),
  price: z.number().nonnegative("Ticket price cannot be negative"),
  type: z.string().min(1, "Ticket type is required"),
  totalSeats: z.number().int().positive("Total seats must be positive"),
});

export const createEventSchema = z.object({
  body: z.object({
    title: z.string().min(3, "Title must be at least 3 characters"),
    description: z
      .string()
      .min(10, "Description must be at least 10 characters long"),
    date: z.string().refine((value) => !Number.isNaN(Date.parse(value)), {
      message: "Date must be valid",
    }),
    location: z.string().min(1, "Location is required"),
    ticketCategories: z.array(ticketCategorySchema).optional(),
  }),
});

export const eventIdSchema = z.object({
  params: z.object({
    id: postgresUuid,
  }),
});

export const addTicketCategorySchema = z.object({
  params: z.object({
    id: postgresUuid,
  }),
  body: ticketCategorySchema,
});

export const updateEventSchema = z.object({
  params: z.object({
    id: postgresUuid,
  }),
  body: z.object({
    title: z.string().min(3, "Title must be at least 3 characters").optional(),
    description: z
      .string()
      .min(10, "Description must be at least 10 characters")
      .optional(),
    date: z.string().or(z.date()).optional(),
    location: z.string().min(1, "Location cannot be empty").optional(),
  }),
});

export type CreateEventInput = z.infer<typeof createEventSchema>["body"];
export type EventIdParams = z.infer<typeof eventIdSchema>["params"];
export type UpdateEventInput = z.infer<typeof updateEventSchema>;
