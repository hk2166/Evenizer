import mongoose from "mongoose";
import { EventModel, IEventDocument } from "../schemas/Event.schema.js";
import { TicketCategoryModel, ITicketCategoryDocument } from "../schemas/TicketCategory.schema.js";
import { EventStatus } from "../models/enum.js";

// Custom error classes
export class ValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ValidationError";
  }
}

export class NotFoundError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "NotFoundError";
  }
}

export class ForbiddenError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ForbiddenError";
  }
}

interface TicketCategoryInput {
  title: string;
  price: number;
  type: string;
  totalSeats: number;
}

export class EventService {
  /**
   * Create event with optional ticket categories
   */
  static async createEvent(
    title: string,
    description: string,
    date: string | Date,
    location: string,
    organizerId: string,
    ticketCategories?: TicketCategoryInput[]
  ): Promise<IEventDocument> {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const eventDate = typeof date === "string" ? new Date(date) : date;

      // Create event
      const event = await EventModel.create(
        [
          {
            title,
            description,
            location,
            status: EventStatus.DRAFT,
            date: eventDate,
            organizerId: new mongoose.Types.ObjectId(organizerId),
            ticketCategories: [],
          },
        ],
        { session }
      );

      // Create ticket categories if provided
      if (ticketCategories && Array.isArray(ticketCategories) && ticketCategories.length > 0) {
        const categoryDocs = await TicketCategoryModel.create(
          ticketCategories.map((cat) => ({
            title: cat.title,
            price: cat.price,
            type: cat.type,
            totalSeats: cat.totalSeats,
            availableSeats: cat.totalSeats,
            reservedSeats: 0,
            eventId: event[0]._id,
          })),
          { session }
        );

        // Update event with ticket category IDs
        event[0].ticketCategories = categoryDocs.map((cat) => cat._id as mongoose.Types.ObjectId);
        await event[0].save({ session });
      }

      await session.commitTransaction();
      return event[0];
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  }

  /**
   * Get all published events
   */
  static async getAllEvents(): Promise<IEventDocument[]> {
    const events = await EventModel.find({ status: EventStatus.PUBLISHED })
      .populate("ticketCategories")
      .sort({ date: 1 });

    return events;
  }

  /**
   * Get event by ID
   */
  static async getEventById(eventId: string): Promise<IEventDocument> {
    const event = await EventModel.findById(eventId)
      .populate("ticketCategories")
      .populate("organizerId");

    if (!event) {
      throw new NotFoundError("Event not found");
    }

    return event;
  }

  /**
   * Update event
   */
  static async updateEvent(
    eventId: string,
    organizerId: string,
    updates: {
      title?: string;
      description?: string;
      date?: string | Date;
      location?: string;
      status?: EventStatus;
    }
  ): Promise<IEventDocument> {
    const event = await EventModel.findById(eventId);

    if (!event) {
      throw new NotFoundError("Event not found");
    }

    // Check authorization
    if (event.organizerId.toString() !== organizerId) {
      throw new ForbiddenError("You are not authorized to update this event");
    }

    // Apply updates
    if (updates.title) event.title = updates.title;
    if (updates.description) event.description = updates.description;
    if (updates.location) event.location = updates.location;
    if (updates.status) event.status = updates.status;
    if (updates.date) {
      event.date = typeof updates.date === "string" ? new Date(updates.date) : updates.date;
    }

    await event.save();
    return event;
  }

  /**
   * Delete event
   */
  static async deleteEvent(eventId: string, organizerId: string): Promise<void> {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const event = await EventModel.findById(eventId).session(session);

      if (!event) {
        throw new NotFoundError("Event not found");
      }

      // Check authorization
      if (event.organizerId.toString() !== organizerId) {
        throw new ForbiddenError("You are not authorized to delete this event");
      }

      // Delete associated ticket categories
      await TicketCategoryModel.deleteMany(
        { eventId: event._id },
        { session }
      );

      // Delete event
      await EventModel.findByIdAndDelete(eventId, { session });

      await session.commitTransaction();
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  }

  /**
   * Publish event (make it visible to customers)
   */
  static async publishEvent(eventId: string, organizerId: string): Promise<IEventDocument> {
    const event = await EventModel.findById(eventId);

    if (!event) {
      throw new NotFoundError("Event not found");
    }

    if (event.organizerId.toString() !== organizerId) {
      throw new ForbiddenError("You are not authorized to publish this event");
    }

    event.status = EventStatus.PUBLISHED;
    await event.save();

    return event;
  }

  /**
   * Add ticket category to existing event
   */
  static async addTicketCategory(
    eventId: string,
    organizerId: string,
    categoryData: TicketCategoryInput
  ): Promise<ITicketCategoryDocument> {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const event = await EventModel.findById(eventId).session(session);

      if (!event) {
        throw new NotFoundError("Event not found");
      }

      if (event.organizerId.toString() !== organizerId) {
        throw new ForbiddenError("You are not authorized to modify this event");
      }

      // Create ticket category
      const category = await TicketCategoryModel.create(
        [
          {
            title: categoryData.title,
            price: categoryData.price,
            type: categoryData.type,
            totalSeats: categoryData.totalSeats,
            availableSeats: categoryData.totalSeats,
            reservedSeats: 0,
            eventId: event._id,
          },
        ],
        { session }
      );

      // Add to event's ticket categories
      event.ticketCategories.push(category[0]._id as mongoose.Types.ObjectId);
      await event.save({ session });

      await session.commitTransaction();
      return category[0];
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  }

  /**
   * Get organizer's events
   */
  static async getOrganizerEvents(organizerId: string): Promise<IEventDocument[]> {
    const events = await EventModel.find({
      organizerId: new mongoose.Types.ObjectId(organizerId),
    })
      .populate("ticketCategories")
      .sort({ createdAt: -1 });

    return events;
  }
}
