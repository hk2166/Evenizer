// backend/src/controllers/event.controller.ts
import { Request, Response } from "express";
import { EventService } from "../services/event.service.js";
import { 
  CreateEventInput, 
  EventIdParams, 
  UpdateEventInput 
} from "../validation/event.validation.js";


export const createEventHandler = async (
  req: Request<{}, {}, CreateEventInput>,
  res: Response
) => {
  const { title, description, date, location, organizerId } = req.body;

  const result = await EventService.createEvent(
    title,
    description,
    date,
    location,
    organizerId
  );

  if ("error" in result) {
    if (result.error === "Organizer not found") {
      return res.status(404).json({ message: result.error });
    }
    return res.status(400).json({ message: result.error });
  }

  return res.status(201).json({
    message: "Event created successfully",
    event: result.event,
  });
};


export const getAllEventsHandler = async (
  req: Request,
  res: Response
) => {
  
  const result = await EventService.getAllEvents();

  // Return events (always succeeds, might be empty array)
  return res.status(200).json({
    message: "Events retrieved successfully",
    count: result.events.length,
    events: result.events,
  });
};


export const getEventByIdHandler = async (
  req: Request<EventIdParams>,
  res: Response
) => {
  
  const { id } = req.params;

  
  const result = await EventService.getEventById(id);

  
  if ("error" in result) {
    return res.status(404).json({ message: result.error });
  }

  
  return res.status(200).json({
    message: "Event retrieved successfully",
    event: result.event,
  });
};

export const updateEventHandler = async (
  req: Request<EventIdParams, {}, UpdateEventInput["body"]>,
  res: Response
) => {

  const { id } = req.params;


  const updates = req.body;


  const organizerId = req.user!.userId;


  const result = await EventService.updateEvent(id, organizerId, updates);


  if ("error" in result) {

    if (result.error === "Event not found") {
      return res.status(404).json({ message: result.error });
    }

    if (result.error.includes("not authorized")) {
      return res.status(403).json({ message: result.error });
    }

    return res.status(400).json({ message: result.error });
  }


  return res.status(200).json({
    message: "Event updated successfully",
    event: result.event,
  });
};


export const deleteEventHandler = async (
  req: Request<EventIdParams>,
  res: Response
) => {

  const { id } = req.params;


  const organizerId = req.user!.userId;


  const result = await EventService.deleteEvent(id, organizerId);


  if ("error" in result) {

    if (result.error === "Event not found") {
      return res.status(404).json({ message: result.error });
    }

    if (result.error.includes("not authorized")) {
      return res.status(403).json({ message: result.error });
    }

    return res.status(400).json({ message: result.error });
  }


  return res.status(200).json({
    message: "Event deleted successfully",
  });
};
f