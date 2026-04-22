import { db } from "../db/index.js";
import { sql } from "drizzle-orm";

export const connectDatabase = async (): Promise<void> => {
  try {
    // Test connection with a simple query
    await db.execute(sql`SELECT 1`);
    console.log("Neon PostgreSQL connected successfully");
  } catch (error) {
    console.error("Neon DB connection error:", error);
    process.exit(1);
  }
};
