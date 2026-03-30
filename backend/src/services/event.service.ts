// backend/src/services/event.service.ts
import { v4 as uuidv4 } from "uuid";
import { Event } from "../models/Event.js";
import { EventStatus } from "../models/enum.js";
import { db, MockRepository } from "../repositories/mock.repository.js";

export class EventService {
  static async createEvent(
    title: string,
    description: string,
    date: string | Date,
    location: string,
    organizerId: string
  ): Promise<{ event: Event } | { error: string }> {
    // 1. Check if organizer exists
    const organizer = MockRepository.findById(db.users, organizerId);
    if (!organizer) {
      return { error: "Organizer not found" };
    }

    // 2. Convert date string to Date object if needed
    const eventDate = typeof date === "string" ? new Date(date) : date;

    // 3. Create new Event instance
    const newEvent = new Event(
      uuidv4(),
      title,
      description,
      location,
      EventStatus.DRAFT,
      eventDate
    );

    // 4. Save to database
    MockRepository.save(db.events, newEvent); // ✅ With semicolon
return { event: newEvent };

    // 5. Return the created event
    return { event: newEvent };
  }
}
