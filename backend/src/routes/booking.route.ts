import { Router } from "express";
import {
  createBookingHandler,
  processPaymentHandler,
  cancelBookingHandler,
  getCustomerBookingsHandler,
  getEventBookingsHandler,
  getBookingByIdHandler,
} from "../controllers/booking.controller.js";
import { authMiddleware } from "../middleware/auth.middleware.js";

export const bookingRouter = Router();

// Create a new booking
bookingRouter.post("/", authMiddleware, createBookingHandler);

// Process payment for a booking
bookingRouter.post("/:id/payment", authMiddleware, processPaymentHandler);

// Cancel a booking
bookingRouter.post("/:id/cancel", authMiddleware, cancelBookingHandler);

// Get customer bookings
bookingRouter.get("/customer/:customerId", getCustomerBookingsHandler);

// Get event bookings (for organizers)
bookingRouter.get("/event/:eventId", getEventBookingsHandler);

// Get booking by ID
bookingRouter.get("/:id", getBookingByIdHandler);
