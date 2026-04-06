import "dotenv/config";
import { z } from "zod";

const optionalString = z.preprocess((value) => {
  if (typeof value !== "string") return value;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}, z.string().optional());

const optionalUrl = z.preprocess((value) => {
  if (typeof value !== "string") return value;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}, z.string().url().optional());

const schema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z.string().default("4000"),
  APP_URL: z.string().url().default("http://localhost:3000"),
  DATABASE_URL: optionalString,
  AUTH_MODE: z.enum(["token", "header"]).default("token"),
  ALLOW_DEV_AUTH_HEADERS: z.preprocess((value) => value === "true" || value === true, z.boolean()).default(false),
  DEV_CUSTOMER_TOKEN: z.string().default("dev-customer-token"),
  DEV_WHOLESALE_TOKEN: z.string().default("dev-wholesale-token"),
  DEV_ADMIN_TOKEN: z.string().default("dev-admin-token"),
  DATA_SOURCE: z.enum(["memory", "supabase"]).default("memory"),
  PAYMENTS_MODE: z.enum(["mock", "stripe"]).default("mock"),
  SUPABASE_URL: optionalUrl,
  SUPABASE_SERVICE_ROLE_KEY: optionalString,
  STRIPE_SECRET_KEY: optionalString,
  STRIPE_WEBHOOK_SECRET: optionalString
});

export const env = schema.parse(process.env);
