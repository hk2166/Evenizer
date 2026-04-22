import express from "express";
import cors from "cors";
import { env } from "./config/env.js";
import { healthRouter } from "./routes/health.route.js";
import { bookingRouter } from "./routes/booking.route.js";
import { eventRouter } from "./routes/event.route.js";
import { authRouter } from "./routes/auth.route.js";
import { adminRouter } from "./routes/admin.route.js";

export const app = express();

// Restrict CORS to known origins in all environments
app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (e.g. curl, Postman, server-to-server)
    if (!origin) return callback(null, true);
    if (env.allowedOrigins.includes(origin)) return callback(null, true);
    callback(new Error(`CORS: origin '${origin}' not allowed`));
  },
  credentials: true,
}));

app.use(express.json({ limit: "1mb" }));

app.use("/health",   healthRouter);
app.use("/auth",     authRouter);
app.use("/events",   eventRouter);
app.use("/bookings", bookingRouter);
app.use("/admin",    adminRouter);

app.use((_req, res) => {
  res.status(404).json({ message: "Route not found" });
});
