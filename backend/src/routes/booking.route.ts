import { Router } from "express";
import { createBookingHandler } from "../controllers/booking.controller.js";
import { validate } from "../middleware/validate.js";
import { createBookingSchema } from "../validation/booking.validation.js";

export const bookingRouter = Router();

// The new route:
// 1. It uses our validation middleware.
// 2. It calls the clean controller handler.
bookingRouter.post("/", validate(createBookingSchema), createBookingHandler);
