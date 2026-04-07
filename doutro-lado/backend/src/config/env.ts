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

  // ==========================================================================
  // Auth — Supabase JWT
  // Required in production. The JWT secret is found in:
  // Supabase → Settings → API → JWT Settings → JWT Secret
  // ==========================================================================
  SUPABASE_JWT_SECRET: optionalString,

  // Dev-only static tokens — mapped to roles for local testing without Supabase.
  // Ignored in production when SUPABASE_JWT_SECRET is set.
  DEV_CUSTOMER_TOKEN: z.string().default("dev-customer-token"),
  DEV_WHOLESALE_TOKEN: z.string().default("dev-wholesale-token"),
  DEV_ADMIN_TOKEN: z.string().default("dev-admin-token"),

  DATA_SOURCE: z.enum(["memory", "supabase"]).default("memory"),
  PAYMENTS_MODE: z.enum(["mock", "stripe"]).default("mock"),

  // Supabase SDK — required for Storage (media upload/delete)
  SUPABASE_URL: optionalUrl,
  SUPABASE_SERVICE_ROLE_KEY: optionalString,
  SUPABASE_STORAGE_BUCKET_MEDIA: z.string().default("product-media"),

  STRIPE_SECRET_KEY: optionalString,
  STRIPE_WEBHOOK_SECRET: optionalString,
});

export const env = schema.parse(process.env);
