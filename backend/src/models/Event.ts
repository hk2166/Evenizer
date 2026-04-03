import { EventStatus } from "./enum";

export class Event {
  id: string;
  title: string;
  description: string;
  location: string;
  status: EventStatus;
  date: Date;
  organizerId: string;

  constructor(
    id: string,
    title: string,
    description: string,
    location: string,
    status: EventStatus,
    date: Date,
    organizerId: string
  ) {
    this.id = id;
    this.title = title;
    this.description = description;
    this.location = location;
    this.status = status;
    this.date = date;
    this.organizerId = organizerId;
  }

  publishEvent(): void {
    this.status = EventStatus.PUBLISHED;
  }

  cancelEvent(): void {
    this.status = EventStatus.CANCELLED;
  }

  updateEvent(): void {
    // Logic to update event
  }
}
