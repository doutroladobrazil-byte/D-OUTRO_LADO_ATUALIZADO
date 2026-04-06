import postgres from "postgres";
import { env } from "../config/env.js";

if (!env.DATABASE_URL) {
  throw new Error("DATABASE_URL is required. Set it in your environment or .env file.");
}

export const db = postgres(env.DATABASE_URL, {
  max: 10,
  idle_timeout: 20,
  connect_timeout: 10,
  ssl: env.NODE_ENV === "production" ? "require" : false,
});
