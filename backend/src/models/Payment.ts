export class Payment {
  id: string;
  amount: number;
  paymentMethod: string;
  paymentStatus: string;

  constructor(
    id: string,
    amount: number,
    paymentMethod: string,
    paymentStatus: string,
  ) {
    this.id = id;
    this.amount = amount;
    this.paymentMethod = paymentMethod;
    this.paymentStatus = paymentStatus;
  }

  processPayment(): boolean {
    // Logic to process payment
    this.paymentStatus = "paid";
    return true;
  }
}
