// backend/src/routes/auth.route.ts
import { Router } from "express";
import { registerHandler, loginHandler } from "../controllers/auth.controller.js";
import { validate } from "../middleware/validate.js";
import { registerSchema, loginSchema } from "../validation/auth.validation.js";

export const authRouter = Router();

authRouter.post("/", validate(registerSchema), registerHandler);


authRouter.post("/login", validate(loginSchema), loginHandler);
