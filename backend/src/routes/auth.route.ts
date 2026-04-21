// backend/src/routes/auth.route.ts
import { Router } from "express";
import {
  registerHandler,
  loginHandler,
  googleLoginHandler,
  getCurrentUserHandler,
} from "../controllers/auth.controller.js";
import { validate } from "../middleware/validate.js";
import {
  registerSchema,
  loginSchema,
  googleLoginSchema,
} from "../validation/auth.validation.js";
import { authMiddleware } from "../middleware/auth.middleware.js";

export const authRouter = Router();

authRouter.post("/", validate(registerSchema), registerHandler);

authRouter.post("/login", validate(loginSchema), loginHandler);

authRouter.post("/google", validate(googleLoginSchema), googleLoginHandler);

// GET /auth/me - Get current user (PROTECTED ROUTE)
// 1. authMiddleware verifies JWT token
// 2. If valid, getCurrentUserHandler returns user info
authRouter.get("/me", authMiddleware, getCurrentUserHandler);
