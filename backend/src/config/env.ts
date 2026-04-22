import dotenv from "dotenv";
dotenv.config();

const databaseUrl = process.env.NEON_DB_URI ?? process.env.DATABASE_URL ?? "";
const jwtSecret   = process.env.JWT_SECRET ?? "";

if (!databaseUrl) {
  throw new Error("Database URL is not set. Add NEON_DB_URI to backend/.env");
}

if (!jwtSecret) {
  throw new Error("JWT_SECRET is not set. Add JWT_SECRET to backend/.env");
}

export const env = {
  port:          Number(process.env.PORT ?? 4000),
  nodeEnv:       process.env.NODE_ENV ?? "development",
  databaseUrl,
  jwtSecret,
  jwtExpiresIn:  process.env.JWT_EXPIRES_IN ?? "7d",
  googleClientId: process.env.GOOGLE_CLIENT_ID ?? "",
  allowedOrigins: (process.env.ALLOWED_ORIGINS ?? "http://localhost:5173").split(","),
};
