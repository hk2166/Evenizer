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
    // Verify organizer exists
    const organizer = MockRepository.findById(db.users, organizerId);
    if (!organizer) {
      return { error: "Organizer not found" };
    }

    const eventDate = typeof date === "string" ? new Date(date) : date;

    const newEvent = new Event(
      uuidv4(),
      title,
      description,
      location,
      EventStatus.DRAFT,
      eventDate,
      organizerId
    );

    
    MockRepository.save(db.events, newEvent);

    return { event: newEvent };
  }


  static async getAllEvents(): Promise<{ events: Event[] }> {
    
    const allEvents = Array.from(db.events.values());

    
    const publishedEvents = allEvents.filter(
      (event) => event.status === EventStatus.PUBLISHED
    );

    return { events: publishedEvents };
  }

  static async getEventById(
    eventId: string
  ): Promise<{ event: Event } | { error: string }> {
    const event = MockRepository.findById(db.events, eventId);

    if (!event) {
      return { error: "Event not found" };
    }

    return { event };
  }


  static async updateEvent(
    eventId: string,
    organizerId: string,
    updates: {
      title?: string;
      description?: string;
      date?: string | Date;
      location?: string;
    }
  ): Promise<{ event: Event } | { error: string }> {
    
    const event = MockRepository.findById(db.events, eventId);

    if (!event) {
      return { error: "Event not found" };
    }

    
    if (event.organizerId !== organizerId) {
      return { error: "You are not authorized to update this event" };
    }

    
    if (updates.title) event.title = updates.title;
    if (updates.description) event.description = updates.description;
    if (updates.location) event.location = updates.location;
    if (updates.date) {
      event.date =
        typeof updates.date === "string" ? new Date(updates.date) : updates.date;
    }

    
    MockRepository.save(db.events, event);

    return { event };
  }

  
  static async deleteEvent(
    eventId: string,
    organizerId: string
  ): Promise<{ success: true } | { error: string }> {
    
    const event = MockRepository.findById(db.events, eventId);

    if (!event) {
      return { error: "Event not found" };
    }

    
    if (event.organizerId !== organizerId) {
      return { error: "You are not authorized to delete this event" };
    }

    
    db.events.delete(eventId);

    return { success: true };
  }
}
