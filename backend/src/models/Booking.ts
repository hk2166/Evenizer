export class Booking {
  id: string;
  quantity: number;
  totalAmount: number;
  status: string;
  bookingDate: Date;

  constructor(
    id: string,
    quantity: number,
    totalAmount: number,
    status: string,
    bookingDate: Date,
  ) {
    this.id = id;
    this.quantity = quantity;
    this.totalAmount = totalAmount;
    this.status = status;
    this.bookingDate = bookingDate;
  }

  confirmBooking(): void {
    // Logic to confirm booking
    this.status = "confirmed";
  }

  cancelBooking(): void {
    // Logic to cancel booking
    this.status = "cancelled";
  }
}
