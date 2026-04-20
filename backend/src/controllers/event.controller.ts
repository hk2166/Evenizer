import { Request, Response } from "express";
import { EventService, ValidationError, NotFoundError, ForbiddenError } from "../services/event.service.js";
import { CreateEventInput, EventIdParams, UpdateEventInput } from "../validation/event.validation.js";

/**
 * POST /events - Create event
 */
export const createEventHandler = async (
  req: Request<{}, {}, CreateEventInput>,
  res: Response
) => {
  try {
    const { title, description, date, location, organizerId, ticketCategories } = req.body as any;

    const event = await EventService.createEvent(
      title,
      description,
      date,
      location,
      organizerId,
      ticketCategories
    );

    return res.status(201).json({
      message: "Event created successfully",
      event: {
        id: event._id,
        title: event.title,
        description: event.description,
        location: event.location,
        status: event.status,
        date: event.date,
        organizerId: event.organizerId,
        ticketCategories: event.ticketCategories,
      },
    });
  } catch (error: any) {
    if (error instanceof ValidationError) {
      return res.status(400).json({ message: error.message });
    }
    if (error instanceof NotFoundError) {
      return res.status(404).json({ message: error.message });
    }
    console.error("Error creating event:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

/**
 * GET /events - Get all published events
 */
export const getAllEventsHandler = async (req: Request, res: Response) => {
  try {
    const events = await EventService.getAllEvents();

    return res.status(200).json({
      message: "Events retrieved successfully",
      count: events.length,
      events: events.map((event) => ({
        id: event._id,
        title: event.title,
        description: event.description,
        location: event.location,
        status: event.status,
        date: event.date,
        organizerId: event.organizerId,
        ticketCategories: event.ticketCategories,
      })),
    });
  } catch (error: any) {
    console.error("Error fetching events:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

/**
 * GET /events/:id - Get event by ID
 */
export const getEventByIdHandler = async (
  req: Request<EventIdParams>,
  res: Response
) => {
  try {
    const { id } = req.params;

    if (!id || Array.isArray(id)) {
      return res.status(400).json({ message: "Invalid event ID" });
    }

    const event = await EventService.getEventById(id);

    return res.status(200).json({
      message: "Event retrieved successfully",
      event: {
        id: event._id,
        title: event.title,
        description: event.description,
        location: event.location,
        status: event.status,
        date: event.date,
        organizerId: event.organizerId,
        ticketCategories: event.ticketCategories,
      },
    });
  } catch (error: any) {
    if (error instanceof NotFoundError) {
      return res.status(404).json({ message: error.message });
    }
    console.error("Error fetching event:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

/**
 * PUT /events/:id - Update event
 */
export const updateEventHandler = async (
  req: Request<EventIdParams, {}, UpdateEventInput["body"]>,
  res: Response
) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    const organizerId = req.user!.userId;

    if (!id || Array.isArray(id)) {
      return res.status(400).json({ message: "Invalid event ID" });
    }

    const event = await EventService.updateEvent(id, organizerId, updates);

    return res.status(200).json({
      message: "Event updated successfully",
      event: {
        id: event._id,
        title: event.title,
        description: event.description,
        location: event.location,
        status: event.status,
        date: event.date,
        organizerId: event.organizerId,
      },
    });
  } catch (error: any) {
    if (error instanceof NotFoundError) {
      return res.status(404).json({ message: error.message });
    }
    if (error instanceof ForbiddenError) {
      return res.status(403).json({ message: error.message });
    }
    console.error("Error updating event:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

/**
 * DELETE /events/:id - Delete event
 */
export const deleteEventHandler = async (
  req: Request<EventIdParams>,
  res: Response
) => {
  try {
    const { id } = req.params;
    const organizerId = req.user!.userId;

    if (!id || Array.isArray(id)) {
      return res.status(400).json({ message: "Invalid event ID" });
    }

    await EventService.deleteEvent(id, organizerId);

    return res.status(200).json({
      message: "Event deleted successfully",
    });
  } catch (error: any) {
    if (error instanceof NotFoundError) {
      return res.status(404).json({ message: error.message });
    }
    if (error instanceof ForbiddenError) {
      return res.status(403).json({ message: error.message });
    }
    console.error("Error deleting event:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

/**
 * POST /events/:id/publish - Publish event
 */
export const publishEventHandler = async (
  req: Request<EventIdParams>,
  res: Response
) => {
  try {
    const { id } = req.params;
    const organizerId = req.user!.userId;

    if (!id || Array.isArray(id)) {
      return res.status(400).json({ message: "Invalid event ID" });
    }

    const event = await EventService.publishEvent(id, organizerId);

    return res.status(200).json({
      message: "Event published successfully",
      event: {
        id: event._id,
        title: event.title,
        status: event.status,
      },
    });
  } catch (error: any) {
    if (error instanceof NotFoundError) {
      return res.status(404).json({ message: error.message });
    }
    if (error instanceof ForbiddenError) {
      return res.status(403).json({ message: error.message });
    }
    console.error("Error publishing event:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

/**
 * POST /events/:id/ticket-categories - Add ticket category
 */
export const addTicketCategoryHandler = async (
  req: Request<EventIdParams>,
  res: Response
) => {
  try {
    const { id } = req.params;
    const organizerId = req.user!.userId;
    const categoryData = req.body;

    if (!id || Array.isArray(id)) {
      return res.status(400).json({ message: "Invalid event ID" });
    }

    const category = await EventService.addTicketCategory(id, organizerId, categoryData);

    return res.status(201).json({
      message: "Ticket category added successfully",
      category: {
        id: category._id,
        title: category.title,
        price: category.price,
        type: category.type,
        totalSeats: category.totalSeats,
        availableSeats: category.availableSeats,
      },
    });
  } catch (error: any) {
    if (error instanceof NotFoundError) {
      return res.status(404).json({ message: error.message });
    }
    if (error instanceof ForbiddenError) {
      return res.status(403).json({ message: error.message });
    }
    console.error("Error adding ticket category:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

/**
 * GET /events/organizer/:organizerId - Get organizer's events
 */
export const getOrganizerEventsHandler = async (
  req: Request,
  res: Response
) => {
  try {
    const { organizerId } = req.params;

    if (!organizerId || Array.isArray(organizerId)) {
      return res.status(400).json({ message: "Invalid organizer ID" });
    }

    const events = await EventService.getOrganizerEvents(organizerId);

    return res.status(200).json({
      message: "Organizer events retrieved successfully",
      count: events.length,
      events: events.map((event) => ({
        id: event._id,
        title: event.title,
        description: event.description,
        location: event.location,
        status: event.status,
        date: event.date,
        ticketCategories: event.ticketCategories,
      })),
    });
  } catch (error: any) {
    console.error("Error fetching organizer events:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};
