// backend/src/services/event.service.ts
import { v4 as uuidv4 } from "uuid";
import { Event } from "../models/Event.js";
import { EventStatus } from "../models/enum.js";
import { db, MockRepository } from "../repositories/mock.repository.js";

/**
 * EventService handles all event-related business logic
 * - Create events
 * - Read events (all or by ID)
 * - Update events (with authorization)
 * - Delete events (with authorization)
 */
export class EventService {
  /**
   * Create a new event
   * Only organizers can create events
   */
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

    // Convert date string to Date object if needed
    const eventDate = typeof date === "string" ? new Date(date) : date;

    // Create new event with DRAFT status
    const newEvent = new Event(
      uuidv4(),
      title,
      description,
      location,
      EventStatus.DRAFT,
      eventDate,
      organizerId
    );

    // Save to database
    MockRepository.save(db.events, newEvent);

    return { event: newEvent };
  }

  /**
   * Get all published events
   * Only returns events with PUBLISHED status (hides drafts)
   */
  static async getAllEvents(): Promise<{ events: Event[] }> {
    // Get all events from database
    const allEvents = Array.from(db.events.values());

    // Filter to only show published events
    const publishedEvents = allEvents.filter(
      (event) => event.status === EventStatus.PUBLISHED
    );

    return { events: publishedEvents };
  }

  /**
   * Get a single event by ID
   * Returns any event regardless of status
   */
  static async getEventById(
    eventId: string
  ): Promise<{ event: Event } | { error: string }> {
    const event = MockRepository.findById(db.events, eventId);

    if (!event) {
      return { error: "Event not found" };
    }

    return { event };
  }

  /**
   * Update an event
   * Only the organizer who created it can update
   * Allows partial updates (only provided fields are updated)
   */
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
    // Find the event
    const event = MockRepository.findById(db.events, eventId);

    if (!event) {
      return { error: "Event not found" };
    }

    // Authorization check: Only the event creator can update
    if (event.organizerId !== organizerId) {
      return { error: "You are not authorized to update this event" };
    }

    // Update only the fields that were provided
    if (updates.title) event.title = updates.title;
    if (updates.description) event.description = updates.description;
    if (updates.location) event.location = updates.location;
    if (updates.date) {
      event.date =
        typeof updates.date === "string" ? new Date(updates.date) : updates.date;
    }

    // Save updated event
    MockRepository.save(db.events, event);

    return { event };
  }

  /**
   * Delete an event
   * Only the organizer who created it can delete
   */
  static async deleteEvent(
    eventId: string,
    organizerId: string
  ): Promise<{ success: true } | { error: string }> {
    // Find the event
    const event = MockRepository.findById(db.events, eventId);

    if (!event) {
      return { error: "Event not found" };
    }

    // Authorization check: Only the event creator can delete
    if (event.organizerId !== organizerId) {
      return { error: "You are not authorized to delete this event" };
    }

    // Delete from database
    db.events.delete(eventId);

    return { success: true };
  }
}
