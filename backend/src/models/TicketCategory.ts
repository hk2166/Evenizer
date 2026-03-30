export class TicketCategory {
  id: string;
  title: string;
  price: number;
  type: string;
  totalSeats: number;
  availableSeats: number;

  constructor(
    id: string,
    title: string,
    price: number,
    type: string,
    totalSeats: number,
    availableSeats: number,
  ) {
    this.id = id;
    this.title = title;
    this.price = price;
    this.type = type;
    this.totalSeats = totalSeats;
    this.availableSeats = availableSeats;
  }

  reserveSeat(quantity: number): boolean {
    if (quantity <= 0) {
      return false;
    }
    if (this.availableSeats < quantity) {
      return false;
    }
    this.availableSeats -= quantity;
    return true;
  }

  releaseSeat(quantity: number): void {
    if (quantity <= 0) {
      return;
    }
    this.availableSeats += quantity;
  }

  updatePrice(newPrice: number): void {
    this.price = newPrice;
  }
}
