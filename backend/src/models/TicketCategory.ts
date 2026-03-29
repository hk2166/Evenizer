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

  reserveSeat(): boolean {
    // Logic to reserve a seat
    if (this.availableSeats > 0) {
      this.availableSeats--;
      return true;
    }
    return false;
  }

  releaseSeat(): void {
    // Logic to release a seat
    this.availableSeats++;
  }

  updatePrice(newPrice: number): void {
    this.price = newPrice;
  }
}
