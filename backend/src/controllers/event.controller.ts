// backend/src/controllers/event.controller.ts
import { Request, Response } from "express";
import { EventService } from "../services/event.service.js";
import { CreateEventInput } from "../validation/event.validation.js";

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
