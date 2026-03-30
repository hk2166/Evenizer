import { PaymentMethod, PaymentStatus } from "./enum";

export class Payment {
  id: string;
  amount: number;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;

  constructor(
    id: string,
    amount: number,
    paymentMethod: PaymentMethod,
    paymentStatus: PaymentStatus,
  ) {
    this.id = id;
    this.amount = amount;
    this.paymentMethod = paymentMethod;
    this.paymentStatus = paymentStatus;
  }

  processPayment(success: boolean): PaymentStatus {
    this.paymentStatus = success ? PaymentStatus.SUCCESS : PaymentStatus.FAILED;
    return this.paymentStatus;
  }
}
