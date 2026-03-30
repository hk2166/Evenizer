// backend/src/controllers/booking.controller.ts
import { Request, Response } from "express";
import { BookingService } from "../services/booking.service.js";
import { CreateBookingInput } from "../validation/booking.validation.js";

export const createBookingHandler = async (
  req: Request<{}, {}, CreateBookingInput>,
  res: Response,
) => {
  const { customerId, ticketCategoryId, quantity } = req.body;

  // The service remains the same
  const result = await BookingService.createBooking(
    customerId,
    ticketCategoryId,
    quantity,
  );

  if ("error" in result) {
    // The service can return specific errors
    if (result.error === "Not enough available seats.") {
      return res.status(409).json({ message: result.error }); // 409 Conflict
    }
    return res.status(400).json({ message: result.error });
  }

  res.status(201).json({
    message: "Booking created successfully",
    booking: result.booking,
  });
};
