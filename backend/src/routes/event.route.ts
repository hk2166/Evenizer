// backend/src/routes/event.route.ts
import { Router } from "express";
import {
  createEventHandler,
  getAllEventsHandler,
  getEventByIdHandler,
  updateEventHandler,
  deleteEventHandler,
} from "../controllers/event.controller.js";
import { validate } from "../middleware/validate.js";
import { authMiddleware } from "../middleware/auth.middleware.js";
import {
  createEventSchema,
  eventIdSchema,
  updateEventSchema,
} from "../validation/event.validation.js";

export const eventRouter = Router();

// ============================================
// PUBLIC ROUTES (No authentication required)
// ============================================

/**
 * GET /events
 * Get all published events
 * Anyone can view published events
 */
eventRouter.get("/", getAllEventsHandler);

/**
 * GET /events/:id
 * Get a single event by ID
 * Validates that :id is a valid UUID
 */
eventRouter.get("/:id", validate(eventIdSchema), getEventByIdHandler);

// ============================================
// PROTECTED ROUTES (Authentication required)
// ============================================

/**
 * POST /events
 * Create a new event
 * 1. authMiddleware - Verify user is logged in
 * 2. validate - Check request data is valid
 * 3. createEventHandler - Create the event
 */
eventRouter.post(
  "/",
  authMiddleware,
  validate(createEventSchema),
  createEventHandler
);

/**
 * PUT /events/:id
 * Update an event
 * 1. authMiddleware - Verify user is logged in
 * 2. validate - Check :id and body data are valid
 * 3. updateEventHandler - Update the event (checks ownership)
 */
eventRouter.put(
  "/:id",
  authMiddleware,
  validate(updateEventSchema),
  updateEventHandler
);

/**
 * DELETE /events/:id
 * Delete an event
 * 1. authMiddleware - Verify user is logged in
 * 2. validate - Check :id is valid
 * 3. deleteEventHandler - Delete the event (checks ownership)
 */
eventRouter.delete(
  "/:id",
  authMiddleware,
  validate(eventIdSchema),
  deleteEventHandler
);
