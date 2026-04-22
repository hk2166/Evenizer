import { and, eq, lt, sql } from "drizzle-orm";
import { db } from "../db/index.js";
import { bookings, ticketCategories } from "../db/schema.js";

export class ExpirationWorker {
  private intervalId?: NodeJS.Timeout;
  private isRunning = false;

  start(): void {
    if (this.isRunning) return;
    this.isRunning = true;
    console.log("🚀 Expiration worker started");
    this.processExpiredBookings();
    this.intervalId = setInterval(() => this.processExpiredBookings(), 60_000);
  }

  stop(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = undefined;
      this.isRunning = false;
      console.log(" Expiration worker stopped");
    }
  }

  private async processExpiredBookings(): Promise<void> {
    try {
      const now = new Date();

      // Find expired reserved bookings
      const expired = await db
        .select({ id: bookings.id, ticketCategoryId: bookings.ticketCategoryId, quantity: bookings.quantity })
        .from(bookings)
        .where(and(eq(bookings.status, "reserved"), lt(bookings.expiresAt, now)))
        .limit(100);

      if (expired.length === 0) return;

      console.log(` Expiring ${expired.length} bookings...`);

      for (const b of expired) {
        try {
          // Atomic update: only expire if still reserved
          const [updated] = await db
            .update(bookings)
            .set({ status: "expired" })
            .where(and(eq(bookings.id, b.id), eq(bookings.status, "reserved")))
            .returning({ id: bookings.id });

          if (updated) {
            // Release seats
            await db
              .update(ticketCategories)
              .set({
                availableSeats: sql`${ticketCategories.availableSeats} + ${b.quantity}`,
                reservedSeats:  sql`${ticketCategories.reservedSeats}  - ${b.quantity}`,
              })
              .where(eq(ticketCategories.id, b.ticketCategoryId));
          }
        } catch (err) {
          console.error(` Error expiring booking ${b.id}:`, err);
        }
      }

      console.log(` Processed ${expired.length} expired bookings`);
    } catch (err) {
      console.error(" Expiration worker error:", err);
    }
  }
}
