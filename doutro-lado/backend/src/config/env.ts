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
  // Required in production. Found at:
  // Supabase Dashboard → Settings → API → JWT Settings → JWT Secret
  // ==========================================================================
  SUPABASE_JWT_SECRET: optionalString,

  // Dev-only static tokens — mapped to roles for local testing without Supabase.
  // These are NEVER active in production (NODE_ENV === "production" bypasses the path).
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

// =============================================================================
// Production safety validation
// =============================================================================
// Fail fast with an explicit diagnostic message rather than starting a server
// that silently falls back to degraded or insecure behaviour.
//
// These checks run at module import time (before the HTTP server binds),
// so a misconfigured deploy is caught immediately with a clear error.
// =============================================================================

if (env.NODE_ENV === "production") {
  const missing: string[] = [];

  if (!env.DATABASE_URL) missing.push("DATABASE_URL");
  if (!env.SUPABASE_JWT_SECRET) missing.push("SUPABASE_JWT_SECRET");

  if (env.PAYMENTS_MODE === "stripe") {
    if (!env.STRIPE_SECRET_KEY) missing.push("STRIPE_SECRET_KEY");
    if (!env.STRIPE_WEBHOOK_SECRET) missing.push("STRIPE_WEBHOOK_SECRET");
  }

  if (missing.length > 0) {
    process.stderr.write(
      `\n[env] FATAL: Missing required environment variables for NODE_ENV=production:\n` +
      missing.map((v) => `  - ${v}`).join("\n") +
      "\n\nSet these variables in your hosting dashboard and restart the service.\n\n"
    );
    process.exit(1);
  }
}
