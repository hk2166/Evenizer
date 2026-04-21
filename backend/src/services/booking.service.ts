import { eq, and, sql } from "drizzle-orm";
import { db } from "../db/index.js";
import { bookings, ticketCategories, payments, events, users, Booking, Payment } from "../db/schema.js";
import { BookingStatus, PaymentMethod, PaymentStatus } from "../models/enum.js";
import { PaymentService } from "./payment.service.js";

export class ValidationError extends Error { constructor(m: string) { super(m); this.name = "ValidationError"; } }
export class NotFoundError   extends Error { constructor(m: string) { super(m); this.name = "NotFoundError"; } }
export class ConflictError   extends Error { constructor(m: string) { super(m); this.name = "ConflictError"; } }
export class ForbiddenError  extends Error { constructor(m: string) { super(m); this.name = "ForbiddenError"; } }
export class PaymentError    extends Error { constructor(m: string) { super(m); this.name = "PaymentError"; } }

// Valid state transitions
const TRANSITIONS: Record<string, string[]> = {
  reserved:  ["paid", "expired", "cancelled"],
  paid:      ["confirmed", "cancelled"],
  confirmed: [],
  expired:   [],
  cancelled: [],
};

function canTransition(from: string, to: string): boolean {
  return TRANSITIONS[from]?.includes(to) ?? false;
}

export class BookingService {
  static async createBooking(
    customerId: string, eventId: string,
    ticketCategoryId: string, quantity: number
  ): Promise<Booking> {
    if (quantity <= 0) throw new ValidationError("Quantity must be greater than 0");

    const [event] = await db
      .select({ id: events.id, status: events.status })
      .from(events)
      .where(eq(events.id, eventId))
      .limit(1);

    if (!event) throw new NotFoundError("Event not found");
    if (event.status !== "published") throw new ValidationError("Only published events can be booked");

    // Atomic seat reservation using UPDATE ... WHERE available_seats >= quantity
    const [updated] = await db
      .update(ticketCategories)
      .set({
        availableSeats: sql`${ticketCategories.availableSeats} - ${quantity}`,
        reservedSeats:  sql`${ticketCategories.reservedSeats}  + ${quantity}`,
      })
      .where(
        and(
          eq(ticketCategories.id, ticketCategoryId),
          eq(ticketCategories.eventId, eventId),
          sql`${ticketCategories.availableSeats} >= ${quantity}`
        )
      )
      .returning();

    if (!updated) {
      // Check if category exists at all
      const [cat] = await db
        .select({ id: ticketCategories.id })
        .from(ticketCategories)
        .where(eq(ticketCategories.id, ticketCategoryId))
        .limit(1);
      if (!cat) throw new NotFoundError("Ticket category not found");
      const [eventCategory] = await db
        .select({ id: ticketCategories.id })
        .from(ticketCategories)
        .where(and(eq(ticketCategories.id, ticketCategoryId), eq(ticketCategories.eventId, eventId)))
        .limit(1);
      if (!eventCategory) throw new ValidationError("Ticket category does not belong to this event");
      throw new ConflictError("Insufficient seats available");
    }

    const reservedAt = new Date();
    const expiresAt  = new Date(reservedAt.getTime() + 15 * 60 * 1000);
    const totalAmount = Number(updated.price) * quantity;

    const [booking] = await db
      .insert(bookings)
      .values({
        customerId, eventId, ticketCategoryId, quantity,
        totalAmount: String(totalAmount),
        status: "reserved", reservedAt, expiresAt,
      })
      .returning();

    return booking;
  }

  static async cancelBooking(bookingId: string, customerId: string): Promise<Booking> {
    const [booking] = await db.select().from(bookings).where(eq(bookings.id, bookingId)).limit(1);
    if (!booking) throw new NotFoundError("Booking not found");
    if (booking.customerId !== customerId) throw new ForbiddenError("You can only cancel your own bookings");

    if (!canTransition(booking.status, "cancelled")) {
      throw new ValidationError(`Cannot cancel a ${booking.status} booking`);
    }

    // Release seats atomically
    await db
      .update(ticketCategories)
      .set({
        availableSeats: sql`${ticketCategories.availableSeats} + ${booking.quantity}`,
        reservedSeats:  sql`${ticketCategories.reservedSeats}  - ${booking.quantity}`,
      })
      .where(eq(ticketCategories.id, booking.ticketCategoryId));

    const [updated] = await db
      .update(bookings)
      .set({ status: "cancelled", cancelledAt: new Date() })
      .where(eq(bookings.id, bookingId))
      .returning();

    return updated;
  }

  static async processPayment(
    bookingId: string, customerId: string, paymentMethod: PaymentMethod
  ): Promise<{ booking: Booking; payment: Payment }> {
    const [booking] = await db.select().from(bookings).where(eq(bookings.id, bookingId)).limit(1);
    if (!booking) throw new NotFoundError("Booking not found");
    if (booking.customerId !== customerId) throw new ForbiddenError("You can only pay for your own bookings");
    if (booking.status !== "reserved") throw new ValidationError(`Cannot process payment for ${booking.status} booking`);
    if (new Date() > booking.expiresAt) throw new ValidationError("Booking has expired");

    const payment = await PaymentService.createPayment(bookingId, Number(booking.totalAmount), paymentMethod);
    const { success, transactionId } = await PaymentService.processPayment(Number(booking.totalAmount), paymentMethod);

    if (success) {
      const [updatedBooking] = await db
        .update(bookings)
        .set({ status: "confirmed", paidAt: new Date(), confirmedAt: new Date(), paymentId: payment.id })
        .where(eq(bookings.id, bookingId))
        .returning();

      // Move seats from reserved → confirmed (just decrement reservedSeats)
      await db
        .update(ticketCategories)
        .set({ reservedSeats: sql`${ticketCategories.reservedSeats} - ${booking.quantity}` })
        .where(eq(ticketCategories.id, booking.ticketCategoryId));

      const updatedPayment = await PaymentService.updatePaymentStatus(payment.id, PaymentStatus.SUCCESS, transactionId);
      return { booking: updatedBooking, payment: updatedPayment };
    } else {
      // Payment failed — cancel booking and release seats
      await db
        .update(bookings)
        .set({ status: "cancelled", cancelledAt: new Date() })
        .where(eq(bookings.id, bookingId));

      await db
        .update(ticketCategories)
        .set({
          availableSeats: sql`${ticketCategories.availableSeats} + ${booking.quantity}`,
          reservedSeats:  sql`${ticketCategories.reservedSeats}  - ${booking.quantity}`,
        })
        .where(eq(ticketCategories.id, booking.ticketCategoryId));

      await PaymentService.updatePaymentStatus(payment.id, PaymentStatus.FAILED, transactionId);
      throw new PaymentError("Payment failed");
    }
  }

  static async getCustomerBookings(customerId: string, status?: BookingStatus) {
    const rows = await db
      .select({
        booking:        bookings,
        event:          events,
        ticketCategory: ticketCategories,
      })
      .from(bookings)
      .leftJoin(events,           eq(bookings.eventId,          events.id))
      .leftJoin(ticketCategories, eq(bookings.ticketCategoryId, ticketCategories.id))
      .where(
        status
          ? and(eq(bookings.customerId, customerId), eq(bookings.status, status))
          : eq(bookings.customerId, customerId)
      )
      .orderBy(sql`${bookings.reservedAt} DESC`);

    return rows.map((r) => ({
      ...r.booking,
      eventId:          r.event          ?? r.booking.eventId,
      ticketCategoryId: r.ticketCategory ?? r.booking.ticketCategoryId,
    }));
  }

  static async getEventBookings(eventId: string, status?: BookingStatus) {
    const rows = await db
      .select({
        booking:        bookings,
        ticketCategory: ticketCategories,
        customer:       users,
      })
      .from(bookings)
      .leftJoin(ticketCategories, eq(bookings.ticketCategoryId, ticketCategories.id))
      .leftJoin(users,            eq(bookings.customerId,       users.id))
      .where(
        status
          ? and(eq(bookings.eventId, eventId), eq(bookings.status, status))
          : eq(bookings.eventId, eventId)
      )
      .orderBy(sql`${bookings.reservedAt} DESC`);

    return rows.map((r) => ({
      ...r.booking,
      ticketCategoryId: r.ticketCategory ?? r.booking.ticketCategoryId,
      customerId:       r.customer       ?? r.booking.customerId,
    }));
  }

  static async getBookingById(bookingId: string) {
    const [row] = await db
      .select({
        booking:        bookings,
        event:          events,
        ticketCategory: ticketCategories,
      })
      .from(bookings)
      .leftJoin(events,           eq(bookings.eventId,          events.id))
      .leftJoin(ticketCategories, eq(bookings.ticketCategoryId, ticketCategories.id))
      .where(eq(bookings.id, bookingId))
      .limit(1);

    if (!row) throw new NotFoundError("Booking not found");

    return {
      ...row.booking,
      eventId:          row.event          ?? row.booking.eventId,
      ticketCategoryId: row.ticketCategory ?? row.booking.ticketCategoryId,
    };
  }
}
