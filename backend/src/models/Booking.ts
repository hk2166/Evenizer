import { BookingStatus } from "./enum";

export class Booking {
  id: string;
  quantity: number;
  totalAmount: number;
  status: BookingStatus;
  bookingDate: Date;

  constructor(
    id: string,
    quantity: number,
    totalAmount: number,
    status: BookingStatus,
    bookingDate: Date,
  ) {
    this.id = id;
    this.quantity = quantity;
    this.totalAmount = totalAmount;
    this.status = status;
    this.bookingDate = bookingDate;
  }

  markPaid(): void {
    if (this.status !== BookingStatus.RESERVED) {
      throw new Error("Invalid booking status transition");
    }
    this.status = BookingStatus.PAID;
  }

  confirmBooking(): void {
    if (this.status !== BookingStatus.PAID) {
      throw new Error("Invalid booking status transition");
    }
    this.status = BookingStatus.CONFIRMED;
  }

  cancelBooking(): void {
    if (this.status === BookingStatus.CONFIRMED) {
      throw new Error("Invalid booking status transition");
    }
    this.status = BookingStatus.CANCELLED;
  }

  expireBooking(): void {
    if (this.status !== BookingStatus.RESERVED) {
      throw new Error("Invalid booking status transition");
    }
    this.status = BookingStatus.EXPIRED;
  }
}
