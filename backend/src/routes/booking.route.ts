import { Router } from "express";
import {
  createBookingHandler,
  processPaymentHandler,
  cancelBookingHandler,
  getCustomerBookingsHandler,
  getEventBookingsHandler,
  getBookingByIdHandler,
} from "../controllers/booking.controller.js";
import { authMiddleware, requireRoles } from "../middleware/auth.middleware.js";
import { validate } from "../middleware/validate.js";
import { UserRole } from "../models/enum.js";
import {
  cancelBookingSchema,
  createBookingSchema,
  getBookingByIdSchema,
  getCustomerBookingsSchema,
  getEventBookingsSchema,
  processPaymentSchema,
} from "../validation/booking.validation.js";

export const bookingRouter = Router();

// Create a new booking
bookingRouter.post(
  "/",
  authMiddleware,
  requireRoles(UserRole.CUSTOMER),
  validate(createBookingSchema),
  createBookingHandler
);

// Process payment for a booking
bookingRouter.post(
  "/:id/payment",
  authMiddleware,
  requireRoles(UserRole.CUSTOMER),
  validate(processPaymentSchema),
  processPaymentHandler
);

// Cancel a booking
bookingRouter.post(
  "/:id/cancel",
  authMiddleware,
  requireRoles(UserRole.CUSTOMER),
  validate(cancelBookingSchema),
  cancelBookingHandler
);

// Get customer bookings
bookingRouter.get(
  "/customer/:customerId",
  authMiddleware,
  validate(getCustomerBookingsSchema),
  getCustomerBookingsHandler
);

// Get event bookings (for organizers)
bookingRouter.get(
  "/event/:eventId",
  authMiddleware,
  validate(getEventBookingsSchema),
  getEventBookingsHandler
);

// Get booking by ID
bookingRouter.get(
  "/:id",
  authMiddleware,
  validate(getBookingByIdSchema),
  getBookingByIdHandler
);
