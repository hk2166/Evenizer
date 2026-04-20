import mongoose from "mongoose";
import { BookingModel } from "../schemas/Booking.schema.js";
import { TicketCategoryModel } from "../schemas/TicketCategory.schema.js";
import { BookingStatus } from "../models/enum.js";

export class ExpirationWorker {
  private intervalId?: NodeJS.Timeout;
  private isRunning: boolean = false;

  /**
   * Start the expiration worker
   * Runs every 60 seconds to check for expired bookings
   */
  start(): void {
    if (this.isRunning) {
      console.log("⚠️  Expiration worker is already running");
      return;
    }

    console.log("🚀 Starting expiration worker...");
    this.isRunning = true;

    // Run immediately on start
    this.processExpiredBookings();

    // Then run every 60 seconds
    this.intervalId = setInterval(() => {
      this.processExpiredBookings();
    }, 60000); // 60 seconds
  }

  /**
   * Stop the expiration worker
   */
  stop(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = undefined;
      this.isRunning = false;
      console.log("🛑 Expiration worker stopped");
    }
  }

  /**
   * Process expired bookings
   * Finds all RESERVED bookings that have exceeded their expiration time
   * and transitions them to EXPIRED, releasing seats back to availability
   */
  private async processExpiredBookings(): Promise<void> {
    try {
      const now = new Date();

      // Find expired bookings (RESERVED status and expiresAt < now)
      const expiredBookings = await BookingModel.find({
        status: BookingStatus.RESERVED,
        expiresAt: { $lt: now },
      }).limit(100); // Process in batches of 100

      if (expiredBookings.length === 0) {
        return; // No expired bookings to process
      }

      console.log(`⏰ Processing ${expiredBookings.length} expired bookings...`);

      let successCount = 0;
      let errorCount = 0;

      // Process each expired booking in its own transaction
      for (const booking of expiredBookings) {
        const session = await mongoose.startSession();
        session.startTransaction();

        try {
          // Re-fetch booking within transaction to check current status
          // This prevents race conditions with payment processing
          const currentBooking = await BookingModel.findById(booking._id).session(session);

          if (!currentBooking) {
            await session.abortTransaction();
            continue;
          }

          // Double-check status (might have been paid in the meantime)
          if (currentBooking.status !== BookingStatus.RESERVED) {
            await session.abortTransaction();
            continue; // Skip this booking, it's no longer RESERVED
          }

          // Transition booking to EXPIRED
          currentBooking.transitionTo(BookingStatus.EXPIRED);
          await currentBooking.save({ session });

          // Release seats back to ticket category
          await TicketCategoryModel.findByIdAndUpdate(
            currentBooking.ticketCategoryId,
            {
              $inc: {
                availableSeats: currentBooking.quantity,
                reservedSeats: -currentBooking.quantity,
              },
            },
            { session }
          );

          await session.commitTransaction();
          successCount++;
        } catch (error) {
          await session.abortTransaction();
          errorCount++;
          console.error(`❌ Error expiring booking ${booking._id}:`, error);
        } finally {
          session.endSession();
        }
      }

      console.log(
        `✅ Expired ${successCount} bookings successfully${errorCount > 0 ? `, ${errorCount} errors` : ""}`
      );
    } catch (error) {
      console.error("❌ Error in expiration worker:", error);
    }
  }
}
