import mongoose from "mongoose";
import { BookingModel, IBookingDocument } from "../schemas/Booking.schema.js";
import { TicketCategoryModel } from "../schemas/TicketCategory.schema.js";
import { BookingStatus, PaymentMethod, PaymentStatus } from "../models/enum.js";
import { PaymentService } from "./payment.service.js";
import { IPaymentDocument } from "../schemas/Payment.schema.js";

// Custom error classes
export class ValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ValidationError";
  }
}

export class NotFoundError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "NotFoundError";
  }
}

export class ConflictError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ConflictError";
  }
}

export class ForbiddenError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ForbiddenError";
  }
}

export class PaymentError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "PaymentError";
  }
}

export class BookingService {
  /**
   * Create a new booking with atomic seat reservation
   * Uses MongoDB transaction to ensure consistency
   */
  static async createBooking(
    customerId: string,
    eventId: string,
    ticketCategoryId: string,
    quantity: number
  ): Promise<IBookingDocument> {
    // Validate input
    if (quantity <= 0) {
      throw new ValidationError("Quantity must be greater than 0");
    }

    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      // 1. Find ticket category and check availability
      const ticketCategory = await TicketCategoryModel.findById(ticketCategoryId).session(session);
      
      if (!ticketCategory) {
        throw new NotFoundError("Ticket category not found");
      }

      // Check if enough seats available
      if (ticketCategory.availableSeats < quantity) {
        throw new ConflictError(
          `Insufficient seats available. Requested: ${quantity}, Available: ${ticketCategory.availableSeats}`
        );
      }

      if (ticketCategory.availableSeats === 0) {
        throw new ConflictError("No seats available for this ticket category");
      }

      // 2. Atomically decrement available seats
      const updatedCategory = await TicketCategoryModel.findByIdAndUpdate(
        ticketCategoryId,
        {
          $inc: {
            availableSeats: -quantity,
            reservedSeats: quantity,
          },
        },
        { session, new: true }
      );

      // Double-check seats didn't go negative (safety check)
      if (updatedCategory && updatedCategory.availableSeats < 0) {
        throw new ConflictError("Insufficient seats available");
      }

      // 3. Calculate expiration time (15 minutes from now)
      const reservedAt = new Date();
      const expiresAt = new Date(reservedAt.getTime() + 15 * 60 * 1000);

      // 4. Create booking
      const booking = await BookingModel.create(
        [
          {
            customerId: new mongoose.Types.ObjectId(customerId),
            eventId: new mongoose.Types.ObjectId(eventId),
            ticketCategoryId: new mongoose.Types.ObjectId(ticketCategoryId),
            quantity,
            totalAmount: ticketCategory.price * quantity,
            status: BookingStatus.RESERVED,
            reservedAt,
            expiresAt,
          },
        ],
        { session }
      );

      // 5. Commit transaction
      await session.commitTransaction();
      
      return booking[0];
    } catch (error) {
      // Rollback transaction on any error
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  }

  /**
   * Cancel a booking and release seats
   */
  static async cancelBooking(
    bookingId: string,
    customerId: string
  ): Promise<IBookingDocument> {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      // 1. Find booking
      const booking = await BookingModel.findById(bookingId).session(session);

      if (!booking) {
        throw new NotFoundError("Booking not found");
      }

      // 2. Verify ownership
      if (booking.customerId.toString() !== customerId) {
        throw new ForbiddenError("You can only cancel your own bookings");
      }

      // 3. Check if booking can be cancelled
      if (booking.status === BookingStatus.CONFIRMED) {
        throw new ValidationError("Cannot cancel confirmed bookings");
      }

      if (booking.status === BookingStatus.EXPIRED || booking.status === BookingStatus.CANCELLED) {
        throw new ValidationError(`Cannot cancel ${booking.status} bookings`);
      }

      // 4. Transition to CANCELLED state
      booking.transitionTo(BookingStatus.CANCELLED);
      await booking.save({ session });

      // 5. Release seats back to ticket category
      await TicketCategoryModel.findByIdAndUpdate(
        booking.ticketCategoryId,
        {
          $inc: {
            availableSeats: booking.quantity,
            reservedSeats: -booking.quantity,
          },
        },
        { session }
      );

      // 6. Commit transaction
      await session.commitTransaction();

      return booking;
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  }

  /**
   * Get customer bookings with optional status filter
   */
  static async getCustomerBookings(
    customerId: string,
    status?: BookingStatus
  ): Promise<IBookingDocument[]> {
    const query: any = { customerId: new mongoose.Types.ObjectId(customerId) };
    
    if (status) {
      query.status = status;
    }

    const bookings = await BookingModel.find(query)
      .populate("eventId")
      .populate("ticketCategoryId")
      .sort({ reservedAt: -1 });

    return bookings;
  }

  /**
   * Get event bookings (for organizers)
   */
  static async getEventBookings(
    eventId: string,
    status?: BookingStatus
  ): Promise<IBookingDocument[]> {
    const query: any = { eventId: new mongoose.Types.ObjectId(eventId) };
    
    if (status) {
      query.status = status;
    }

    const bookings = await BookingModel.find(query)
      .populate("customerId")
      .populate("ticketCategoryId")
      .sort({ reservedAt: -1 });

    return bookings;
  }

  /**
   * Get booking by ID
   */
  static async getBookingById(bookingId: string): Promise<IBookingDocument> {
    const booking = await BookingModel.findById(bookingId)
      .populate("eventId")
      .populate("ticketCategoryId")
      .populate("customerId");

    if (!booking) {
      throw new NotFoundError("Booking not found");
    }

    return booking;
  }

  /**
   * Process payment for a booking
   */
  static async processPayment(
    bookingId: string,
    customerId: string,
    paymentMethod: PaymentMethod
  ): Promise<{ booking: IBookingDocument; payment: IPaymentDocument }> {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      // 1. Find booking
      const booking = await BookingModel.findById(bookingId).session(session);

      if (!booking) {
        throw new NotFoundError("Booking not found");
      }

      // 2. Verify ownership
      if (booking.customerId.toString() !== customerId) {
        throw new ForbiddenError("You can only pay for your own bookings");
      }

      // 3. Validate booking state
      if (booking.status !== BookingStatus.RESERVED) {
        throw new ValidationError(`Cannot process payment for ${booking.status} booking`);
      }

      // 4. Check if booking has expired
      if (booking.isExpired()) {
        throw new ValidationError("Booking has expired");
      }

      // 5. Validate payment amount
      const paymentAmount = booking.totalAmount;

      // 6. Create payment record
      const payment = await PaymentService.createPayment(
        bookingId,
        paymentAmount,
        paymentMethod
      );

      // 7. Process payment through mock gateway
      const { success, transactionId } = await PaymentService.processPayment(
        paymentAmount,
        paymentMethod
      );

      if (success) {
        // Payment succeeded - transition booking to PAID then CONFIRMED
        booking.transitionTo(BookingStatus.PAID);
        booking.transitionTo(BookingStatus.CONFIRMED);
        booking.paymentId = payment._id as mongoose.Types.ObjectId;
        await booking.save({ session });

        // Update payment status
        await PaymentService.updatePaymentStatus(
          payment._id.toString(),
          PaymentStatus.SUCCESS,
          transactionId
        );

        // Update ticket category: move from reserved to confirmed
        await TicketCategoryModel.findByIdAndUpdate(
          booking.ticketCategoryId,
          {
            $inc: {
              reservedSeats: -booking.quantity,
            },
          },
          { session }
        );

        await session.commitTransaction();

        // Reload payment with updated status
        const updatedPayment = await PaymentService.updatePaymentStatus(
          payment._id.toString(),
          PaymentStatus.SUCCESS,
          transactionId
        );

        return { booking, payment: updatedPayment };
      } else {
        // Payment failed - cancel booking and release seats
        booking.transitionTo(BookingStatus.CANCELLED);
        await booking.save({ session });

        // Release seats back to available
        await TicketCategoryModel.findByIdAndUpdate(
          booking.ticketCategoryId,
          {
            $inc: {
              availableSeats: booking.quantity,
              reservedSeats: -booking.quantity,
            },
          },
          { session }
        );

        // Update payment status
        await PaymentService.updatePaymentStatus(
          payment._id.toString(),
          PaymentStatus.FAILED,
          transactionId
        );

        await session.commitTransaction();

        throw new PaymentError("Payment failed");
      }
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  }

  /**
   * Internal method to release seats (used by expiration worker and payment failure)
   */
  static async releaseSeats(
    session: mongoose.ClientSession,
    ticketCategoryId: mongoose.Types.ObjectId,
    quantity: number
  ): Promise<void> {
    await TicketCategoryModel.findByIdAndUpdate(
      ticketCategoryId,
      {
        $inc: {
          availableSeats: quantity,
          reservedSeats: -quantity,
        },
      },
      { session }
    );
  }
}
