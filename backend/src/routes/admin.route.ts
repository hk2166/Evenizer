import { Router } from "express";
import { getDashboardHandler } from "../controllers/admin.controller.js";
import { authMiddleware } from "../middleware/auth.middleware.js";

export const adminRouter = Router();

adminRouter.get("/dashboard", authMiddleware, getDashboardHandler);
