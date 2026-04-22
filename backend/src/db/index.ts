import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "./schema.js";
import { env } from "../config/env.js";

const sql = neon(env.databaseUrl);
export const db = drizzle(sql, { schema });

export type DB = typeof db;
