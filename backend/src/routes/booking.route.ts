import { Router } from "express";
import { createBookingHandler } from "../controllers/booking.controller";
import { validate } from "../middleware/validate";
import { createBookingSchema } from "../schemas/booking.schema";

export const bookingRouter = Router();

// The new route:
// 1. It uses our validation middleware.
// 2. It calls the clean controller handler.
bookingRouter.post("/", validate(createBookingSchema), createBookingHandler);
