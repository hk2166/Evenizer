// backend/src/routes/event.route.ts
import { Router } from "express";
import { createEventHandler } from "../controllers/event.controller.js";
import { validate } from "../middleware/validate.js";
import { createEventSchema } from "../validation/event.validation.js";

export const eventRouter = Router();


eventRouter.post("/", validate(createEventSchema), createEventHandler);
