import mongoose from "mongoose";
import { PaymentModel, IPaymentDocument } from "../schemas/Payment.schema.js";
import { PaymentMethod, PaymentStatus } from "../models/enum.js";

export class PaymentService {
  /**
   * Simulate payment processing with mock gateway
   * Returns success 90% of the time with random delay
   */
  static async processPayment(
    amount: number,
    method: PaymentMethod
  ): Promise<{ success: boolean; transactionId: string }> {
    // Simulate network delay (100-500ms)
    const delay = Math.random() * 400 + 100;
    await new Promise((resolve) => setTimeout(resolve, delay));

    // Simulate 90% success rate
    const success = Math.random() < 0.9;

    // Generate mock transaction ID
    const transactionId = `txn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    return { success, transactionId };
  }

  /**
   * Create a payment record
   */
  static async createPayment(
    bookingId: string,
    amount: number,
    method: PaymentMethod
  ): Promise<IPaymentDocument> {
    const payment = await PaymentModel.create({
      bookingId: new mongoose.Types.ObjectId(bookingId),
      amount,
      paymentMethod: method,
      paymentStatus: PaymentStatus.PENDING,
    });

    return payment;
  }

  /**
   * Update payment status after gateway response
   */
  static async updatePaymentStatus(
    paymentId: string,
    status: PaymentStatus,
    transactionId?: string
  ): Promise<IPaymentDocument> {
    const payment = await PaymentModel.findByIdAndUpdate(
      paymentId,
      {
        paymentStatus: status,
        transactionId,
        processedAt: new Date(),
      },
      { new: true }
    );

    if (!payment) {
      throw new Error("Payment not found");
    }

    return payment;
  }
}
