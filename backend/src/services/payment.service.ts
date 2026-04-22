import { eq } from "drizzle-orm";
import { db } from "../db/index.js";
import { payments, Payment } from "../db/schema.js";
import { PaymentMethod, PaymentStatus } from "../models/enum.js";

export class PaymentService {
  static async processPayment(
    _amount: number,
    _method: PaymentMethod
  ): Promise<{ success: boolean; transactionId: string }> {
    const delay = Math.random() * 400 + 100;
    await new Promise((r) => setTimeout(r, delay));
    const success = Math.random() < 0.9;
    const transactionId = `txn_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`;
    return { success, transactionId };
  }

  static async createPayment(
    bookingId: string,
    amount: number,
    method: PaymentMethod
  ): Promise<Payment> {
    const [payment] = await db
      .insert(payments)
      .values({
        bookingId,
        amount: String(amount),
        paymentMethod: method,
        paymentStatus: "pending",
      })
      .returning();
    return payment;
  }

  static async updatePaymentStatus(
    paymentId: string,
    status: PaymentStatus,
    transactionId?: string
  ): Promise<Payment> {
    const [payment] = await db
      .update(payments)
      .set({
        paymentStatus: status,
        transactionId: transactionId ?? null,
        processedAt: new Date(),
      })
      .where(eq(payments.id, paymentId))
      .returning();

    if (!payment) throw new Error("Payment not found");
    return payment;
  }
}
