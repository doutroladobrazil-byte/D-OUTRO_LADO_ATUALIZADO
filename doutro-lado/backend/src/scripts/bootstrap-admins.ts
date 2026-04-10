/**
 * bootstrap-admins.ts
 *
 * Promotes a list of e-mails (from ADMIN_EMAILS env var) to role='admin'
 * in the public.profiles table.
 *
 * Safe to run repeatedly — idempotent by design.
 *
 * Usage:
 *   npm run bootstrap:admins        (from doutro-lado/backend/)
 *
 * Required env vars:
 *   DATABASE_URL   — Supabase direct connection string (postgres superuser)
 *   ADMIN_EMAILS   — comma-separated list of e-mails to promote
 *
 * Optional (for Supabase environments where auth.users is in a separate schema):
 *   SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY — used as fallback lookup strategy
 */

import { env } from "../config/env.js";
import { db } from "../lib/db.js";
import { supabaseAdmin } from "../lib/supabase.js";

// =============================================================================
// Helpers
// =============================================================================

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function isValidEmail(value: string): boolean {
  return EMAIL_RE.test(value);
}

function parseAdminEmails(raw: string | undefined): string[] {
  if (!raw) return [];
  return raw
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter((e) => e.length > 0);
}

type Outcome =
  | "promoted"
  | "already_admin"
  | "profile_created_and_promoted"
  | "auth_user_not_found"
  | "skipped_invalid_email";

function log(outcome: Outcome, email: string, detail?: string) {
  const label: Record<Outcome, string> = {
    promoted:                    "  ✓ promoted              ",
    already_admin:               "  · already admin         ",
    profile_created_and_promoted:"  ✓ created & promoted    ",
    auth_user_not_found:         "  ✗ auth user not found   ",
    skipped_invalid_email:       "  ! skipped invalid email ",
  };
  const suffix = detail ? `  (${detail})` : "";
  process.stdout.write(`${label[outcome]}${email}${suffix}\n`);
}

// =============================================================================
// Auth user lookup
// Two strategies:
//   1. Direct SQL on auth.users — works when DATABASE_URL uses postgres superuser
//   2. Supabase Admin SDK   — fallback when auth schema is not accessible via SQL
// =============================================================================

async function findAuthUserId(email: string): Promise<string | null> {
  // Strategy 1: direct SQL (preferred — consistent with rest of the codebase)
  try {
    const rows = await db`
      SELECT id FROM auth.users WHERE email = ${email} LIMIT 1
    `;
    if (rows.length > 0) return rows[0].id as string;
    // Row not found — fall through to strategy 2 only if admin SDK is available
  } catch (err) {
    // auth schema inaccessible via this connection (some Supabase plans restrict it)
    const msg = err instanceof Error ? err.message : String(err);
    process.stderr.write(
      `[bootstrap] Direct auth.users query failed: ${msg}\n` +
      `[bootstrap] Falling back to Supabase Admin SDK...\n`
    );
  }

  // Strategy 2: Supabase Admin SDK (requires SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY)
  if (!supabaseAdmin) {
    process.stderr.write(
      `[bootstrap] Supabase Admin SDK not available. ` +
      `Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY to enable SDK fallback.\n`
    );
    return null;
  }

  const { data, error } = await supabaseAdmin.auth.admin.listUsers();
  if (error) {
    process.stderr.write(`[bootstrap] SDK listUsers error: ${error.message}\n`);
    return null;
  }

  const user = data.users.find((u) => u.email?.toLowerCase() === email);
  return user?.id ?? null;
}

// =============================================================================
// Per-email promotion logic
// =============================================================================

async function promoteEmail(email: string): Promise<Outcome> {
  if (!isValidEmail(email)) return "skipped_invalid_email";

  const authUserId = await findAuthUserId(email);
  if (!authUserId) return "auth_user_not_found";

  // Check existing profile
  const existing = await db`
    SELECT id, role FROM profiles
    WHERE auth_user_id = ${authUserId}
    LIMIT 1
  `;

  if (existing.length > 0 && existing[0].role === "admin") {
    return "already_admin";
  }

  const isNew = existing.length === 0;

  // Upsert: create if missing, promote if exists. Idempotent.
  await db`
    INSERT INTO profiles (auth_user_id, email, role, is_active)
    VALUES (${authUserId}, ${email}, 'admin', true)
    ON CONFLICT (auth_user_id) DO UPDATE
      SET role      = 'admin',
          is_active = true,
          email     = EXCLUDED.email
  `;

  return isNew ? "profile_created_and_promoted" : "promoted";
}

// =============================================================================
// Main
// =============================================================================

async function main() {
  process.stdout.write("\n[bootstrap-admins] Starting...\n\n");

  const emails = parseAdminEmails(env.ADMIN_EMAILS);

  if (emails.length === 0) {
    process.stderr.write(
      "[bootstrap-admins] No emails to process.\n" +
      "  Set ADMIN_EMAILS=user@example.com in your environment or .env file.\n\n"
    );
    process.exit(1);
  }

  process.stdout.write(`  Processing ${emails.length} email(s):\n\n`);

  let errors = 0;

  for (const email of emails) {
    try {
      const outcome = await promoteEmail(email);
      log(outcome, email);
      if (outcome === "auth_user_not_found") errors++;
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      log("auth_user_not_found", email, `unexpected error: ${msg}`);
      errors++;
    }
  }

  process.stdout.write("\n[bootstrap-admins] Done.\n\n");

  await db.end();

  process.exit(errors > 0 ? 1 : 0);
}

main().catch((err) => {
  process.stderr.write(`[bootstrap-admins] Fatal: ${err instanceof Error ? err.message : String(err)}\n`);
  process.exit(1);
});
