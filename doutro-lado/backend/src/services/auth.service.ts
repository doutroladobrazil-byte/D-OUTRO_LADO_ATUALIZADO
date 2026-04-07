import { jwtVerify } from "jose";
import type { Request } from "express";
import { env } from "../config/env.js";
import { getOrCreateProfile } from "./profile.service.js";
import type { Role } from "../types/domain.js";

// =============================================================================
// Types
// =============================================================================

export type RequestUser = {
  id: string;        // Supabase auth.users UUID
  profileId: string; // profiles.id
  email: string;
  role: Role;
  isActive: boolean;
};

// =============================================================================
// Dev-mode static token table
// Allows local development without a real Supabase project.
// Never active in production (NODE_ENV === "production" bypasses this path).
// =============================================================================

const DEV_TOKENS = new Map<string, Role>([
  [env.DEV_CUSTOMER_TOKEN, "customer"],
  [env.DEV_WHOLESALE_TOKEN, "wholesale"],
  [env.DEV_ADMIN_TOKEN, "admin"],
]);

// =============================================================================
// Helpers
// =============================================================================

function parseBearerToken(headerValue?: string | null): string | null {
  if (!headerValue) return null;
  const parts = headerValue.split(" ");
  if (parts.length !== 2 || parts[0]?.toLowerCase() !== "bearer" || !parts[1]) return null;
  return parts[1].trim();
}

// Supabase JWT payload shape (relevant fields only).
interface SupabaseJwtPayload {
  sub: string;       // auth user UUID
  email?: string;
  aud?: string;      // "authenticated"
  role?: string;     // postgres role — NOT our app role
}

// =============================================================================
// Main resolver
// =============================================================================

/**
 * Resolves the authenticated user from the request.
 *
 * Resolution order:
 *  1. Dev-only static tokens (development + test environments only).
 *  2. Supabase JWT — verified locally using SUPABASE_JWT_SECRET, then
 *     the profile is fetched from the database.
 *
 * Returns null for any invalid or missing credential.
 */
export async function resolveRequestUser(req: Request): Promise<RequestUser | null> {
  const token = parseBearerToken(req.header("authorization"));
  if (!token) return null;

  // ── Dev path: static tokens ────────────────────────────────────────────
  if (env.NODE_ENV !== "production") {
    const devRole = DEV_TOKENS.get(token);
    if (devRole) {
      return {
        id: `dev-${devRole}`,
        profileId: `dev-profile-${devRole}`,
        email: `${devRole}@dev.local`,
        role: devRole,
        isActive: true,
      };
    }
  }

  // ── Production path: Supabase JWT ──────────────────────────────────────
  if (!env.SUPABASE_JWT_SECRET) return null;

  try {
    const secret = new TextEncoder().encode(env.SUPABASE_JWT_SECRET);
    const { payload } = await jwtVerify<SupabaseJwtPayload>(token, secret, {
      audience: "authenticated",
    });

    if (!payload.sub) return null;

    const profile = await getOrCreateProfile(payload.sub, payload.email ?? "");
    if (!profile.isActive) return null;

    return {
      id: payload.sub,
      profileId: profile.id,
      email: profile.email,
      role: profile.role,
      isActive: profile.isActive,
    };
  } catch {
    // Invalid token, expired, wrong secret, etc.
    return null;
  }
}
