// backend/src/services/booking.service.ts

import { v4 as uuidv4 } from "uuid";
import { Booking } from "../models/Booking";
import { BookingStatus, PaymentMethod, PaymentStatus } from "../models/enum";
import { Payment } from "../models/Payment";
import { TicketCategory } from "../models/TicketCategory";
import { db, MockRepository } from "../repositories/mock.repository";

// Corresponds to the BookingService in your sequence diagram
export class BookingService {
  // Simulates the entire booking process
  static async createBooking(
    customerId: string,
    ticketCategoryId: string,
    quantity: number,
  ): Promise<{ booking: Booking; payment: Payment } | { error: string }> {
    // 1. Verify Seats (Interaction with TicketService/Repository)
    const ticketCategory = MockRepository.findById(
      db.ticketCategories,
      ticketCategoryId,
    );

    if (!ticketCategory) {
      return { error: "Ticket category not found." };
    }

    // Use the method we defined in the TicketCategory class
    const seatsReserved = ticketCategory.reserveSeat(quantity);

    if (!seatsReserved) {
      return { error: "Not enough available seats." };
    }
    // Save the change to our mock DB
    MockRepository.save(db.ticketCategories, ticketCategory);

    // 2. Create Booking Record
    const totalAmount = ticketCategory.price * quantity;
    const newBooking = new Booking(
      uuidv4(),
      quantity,
      totalAmount,
      BookingStatus.RESERVED, // Initial status is RESERVED
      new Date(),
    );
    MockRepository.save(db.bookings, newBooking);

    // 3. Process Payment (Interaction with PaymentService)
    // For now, we'll simulate a successful payment directly
    const newPayment = new Payment(
      uuidv4(),
      totalAmount,
      PaymentMethod.CARD, // Mock payment method
      PaymentStatus.PENDING,
    );

    // Simulate calling a payment gateway
    const paymentSuccess = true;
    newPayment.processPayment(paymentSuccess);
    MockRepository.save(db.payments, newPayment);

    // 4. Update Booking Status based on Payment
    if (newPayment.paymentStatus === PaymentStatus.SUCCESS) {
      newBooking.markPaid();
      newBooking.confirmBooking(); // Mark as PAID, then CONFIRMED
      MockRepository.save(db.bookings, newBooking);
    } else {
      // If payment fails, release the seats
      ticketCategory.releaseSeat(quantity);
      MockRepository.save(db.ticketCategories, ticketCategory);
      newBooking.cancelBooking();
      MockRepository.save(db.bookings, newBooking);
      return { error: "Payment failed." };
    }

    // 5. Return final booking and payment details
    return { booking: newBooking, payment: newPayment };
  }
}
