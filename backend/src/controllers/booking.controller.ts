import { Request, Response } from "express";
import { BookingService, ValidationError, NotFoundError, ConflictError, ForbiddenError, PaymentError } from "../services/booking.service.js";
import { BookingStatus, PaymentMethod, UserRole } from "../models/enum.js";
import { eq } from "drizzle-orm";
import { db } from "../db/index.js";
import { events } from "../db/schema.js";

/**
 * POST /bookings - Create a new booking
 */
export const createBookingHandler = async (req: Request, res: Response) => {
  try {
    const { eventId, ticketCategoryId, quantity } = req.body;
    const customerId = req.user?.userId; // From auth middleware

    if (!customerId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const booking = await BookingService.createBooking(
      customerId,
      eventId,
      ticketCategoryId,
      quantity
    );

    res.status(201).json({
      message: "Booking created successfully",
      booking,
    });
  } catch (error: any) {
    if (error instanceof ValidationError) {
      return res.status(400).json({ error: error.message });
    }
    if (error instanceof NotFoundError) {
      return res.status(404).json({ error: error.message });
    }
    if (error instanceof ConflictError) {
      return res.status(409).json({ error: error.message });
    }
    console.error("Error creating booking:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

/**
 * POST /bookings/:id/payment - Process payment for a booking
 */
export const processPaymentHandler = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { paymentMethod } = req.body;
    const customerId = req.user?.userId; // From auth middleware

    if (!customerId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    if (!id || Array.isArray(id)) {
      return res.status(400).json({ error: "Invalid booking ID" });
    }

    if (!Object.values(PaymentMethod).includes(paymentMethod)) {
      return res.status(400).json({ error: "Invalid payment method" });
    }

    const result = await BookingService.processPayment(
      id,
      customerId,
      paymentMethod
    );

    res.status(200).json({
      message: "Payment processed successfully",
      booking: result.booking,
      payment: result.payment,
    });
  } catch (error: any) {
    if (error instanceof ValidationError) {
      return res.status(400).json({ error: error.message });
    }
    if (error instanceof NotFoundError) {
      return res.status(404).json({ error: error.message });
    }
    if (error instanceof ForbiddenError) {
      return res.status(403).json({ error: error.message });
    }
    if (error instanceof PaymentError) {
      return res.status(402).json({ error: error.message });
    }
    console.error("Error processing payment:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

/**
 * POST /bookings/:id/cancel - Cancel a booking
 */
export const cancelBookingHandler = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const customerId = req.user?.userId; // From auth middleware

    if (!customerId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    if (!id || Array.isArray(id)) {
      return res.status(400).json({ error: "Invalid booking ID" });
    }

    const booking = await BookingService.cancelBooking(id, customerId);

    res.status(200).json({
      message: "Booking cancelled successfully",
      booking,
    });
  } catch (error: any) {
    if (error instanceof ValidationError) {
      return res.status(400).json({ error: error.message });
    }
    if (error instanceof NotFoundError) {
      return res.status(404).json({ error: error.message });
    }
    if (error instanceof ForbiddenError) {
      return res.status(403).json({ error: error.message });
    }
    console.error("Error cancelling booking:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

/**
 * GET /bookings/customer/:customerId - Get customer bookings
 */
export const getCustomerBookingsHandler = async (req: Request, res: Response) => {
  try {
    const { customerId } = req.params;
    const { status } = req.query;
    const currentUser = req.user;

    if (!customerId || Array.isArray(customerId)) {
      return res.status(400).json({ error: "Invalid customer ID" });
    }

    if (!currentUser) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    if (currentUser.role !== UserRole.ADMIN && currentUser.userId !== customerId) {
      return res.status(403).json({ error: "You can only view your own bookings" });
    }

    const bookingStatus = status ? (status as BookingStatus) : undefined;

    const bookings = await BookingService.getCustomerBookings(
      customerId,
      bookingStatus
    );

    res.status(200).json({
      bookings,
      count: bookings.length,
    });
  } catch (error: any) {
    console.error("Error fetching customer bookings:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

/**
 * GET /bookings/event/:eventId - Get event bookings (for organizers)
 */
export const getEventBookingsHandler = async (req: Request, res: Response) => {
  try {
    const { eventId } = req.params;
    const { status } = req.query;
    const currentUser = req.user;

    if (!eventId || Array.isArray(eventId)) {
      return res.status(400).json({ error: "Invalid event ID" });
    }

    if (!currentUser) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const [event] = await db
      .select({ organizerId: events.organizerId })
      .from(events)
      .where(eq(events.id, eventId))
      .limit(1);

    if (!event) {
      return res.status(404).json({ error: "Event not found" });
    }

    if (
      currentUser.role !== UserRole.ADMIN &&
      (currentUser.role !== UserRole.ORGANIZER || event.organizerId !== currentUser.userId)
    ) {
      return res.status(403).json({ error: "You can only view bookings for your own events" });
    }

    const bookingStatus = status ? (status as BookingStatus) : undefined;

    const bookings = await BookingService.getEventBookings(
      eventId,
      bookingStatus
    );

    res.status(200).json({
      bookings,
      count: bookings.length,
    });
  } catch (error: any) {
    console.error("Error fetching event bookings:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

/**
 * GET /bookings/:id - Get booking by ID
 */
export const getBookingByIdHandler = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const currentUser = req.user;

    if (!id || Array.isArray(id)) {
      return res.status(400).json({ error: "Invalid booking ID" });
    }

    if (!currentUser) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const booking = await BookingService.getBookingById(id);

    const eventOwnerId =
      typeof booking.eventId === "object" && booking.eventId !== null
        ? booking.eventId.organizerId
        : undefined;

    const canView =
      currentUser.role === UserRole.ADMIN ||
      booking.customerId === currentUser.userId ||
      (currentUser.role === UserRole.ORGANIZER && eventOwnerId === currentUser.userId);

    if (!canView) {
      return res.status(403).json({ error: "You do not have access to this booking" });
    }

    res.status(200).json({ booking });
  } catch (error: any) {
    if (error instanceof NotFoundError) {
      return res.status(404).json({ error: error.message });
    }
    console.error("Error fetching booking:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
