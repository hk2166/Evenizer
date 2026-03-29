export class Event {
  id: string;
  title: string;
  description: string;
  location: string;
  status: string;
  date: Date;

  constructor(
    id: string,
    title: string,
    description: string,
    location: string,
    status: string,
    date: Date,
  ) {
    this.id = id;
    this.title = title;
    this.description = description;
    this.location = location;
    this.status = status;
    this.date = date;
  }

  publishEvent(): void {
    // Logic to publish event
  }

  cancelEvent(): void {
    // Logic to cancel event
  }

  updateEvent(): void {
    // Logic to update event
  }
}
