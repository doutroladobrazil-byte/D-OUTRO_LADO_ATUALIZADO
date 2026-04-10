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

  // Retained for compatibility. Has no runtime switch effect — all services use
  // DATABASE_URL directly. Will be removed in a future cleanup pass.
  DATA_SOURCE: z.enum(["memory", "supabase"]).default("supabase"),
  PAYMENTS_MODE: z.enum(["mock", "stripe"]).default("mock"),

  // Supabase SDK — required for Storage (media upload/delete)
  SUPABASE_URL: optionalUrl,
  SUPABASE_SERVICE_ROLE_KEY: optionalString,
  SUPABASE_STORAGE_BUCKET_MEDIA: z.string().default("product-media"),

  STRIPE_SECRET_KEY: optionalString,
  STRIPE_WEBHOOK_SECRET: optionalString,

  // ==========================================================================
  // Bag recovery — Stage 11 Part 2
  // ==========================================================================

  /** Minutes after cart update before a bag is considered abandoned. Default: 30. */
  BAG_ABANDONMENT_DELAY_MINUTES: z.coerce.number().int().min(1).default(30),
  /** Discount percentage offered in recovery messages. Default: 10. */
  BAG_ABANDONMENT_DISCOUNT_PERCENT: z.coerce.number().min(0).max(100).default(10),
  /** Hours before a recovery offer code expires. Default: 48. */
  BAG_RECOVERY_OFFER_VALID_HOURS: z.coerce.number().int().min(1).default(48),
  /** Secret token used to authenticate calls to POST /api/internal/recovery/process. */
  RECOVERY_JOB_SECRET: optionalString,

  // Resend (email)
  RESEND_API_KEY: optionalString,
  /** From address for recovery emails. Default: noreply@doutrolado.com */
  RECOVERY_EMAIL_FROM: z.string().default("noreply@doutrolado.com"),

  // Twilio (WhatsApp)
  TWILIO_ACCOUNT_SID: optionalString,
  TWILIO_AUTH_TOKEN: optionalString,
  /** WhatsApp-enabled Twilio sender (e.g. whatsapp:+14155238886) */
  TWILIO_WHATSAPP_FROM: optionalString,

  // ==========================================================================
  // Admin bootstrap — bootstrap-admins script
  // Comma-separated list of e-mails that should be promoted to role='admin'.
  // Only consumed by `npm run bootstrap:admins` — never read at request time.
  // Example: ADMIN_EMAILS=admin@doutrolado.com,ops@doutrolado.com
  // ==========================================================================
  ADMIN_EMAILS: optionalString,
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
