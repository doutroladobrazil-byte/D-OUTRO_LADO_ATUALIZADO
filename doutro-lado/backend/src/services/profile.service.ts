import { db } from "../lib/db.js";
import type { AuthProfile, Role } from "../types/domain.js";

// =============================================================================
// Mappers
// =============================================================================

function mapProfile(row: Record<string, unknown>): AuthProfile {
  return {
    id: row.id as string,
    authUserId: (row.auth_user_id as string | null) ?? null,
    email: row.email as string,
    fullName: (row.full_name as string | null) ?? null,
    role: (row.role as Role) ?? "customer",
    isActive: (row.is_active as boolean) ?? true,
    preferredLanguage: (row.preferred_language as string) ?? "en",
    preferredCurrency: (row.preferred_currency as string) ?? "USD",
    createdAt: new Date(row.created_at as string).toISOString(),
  };
}

const PROFILE_SELECT = `
  id, auth_user_id, email, full_name, role, is_active,
  preferred_language, preferred_currency, created_at
`;

// =============================================================================
// Queries
// =============================================================================

export async function getProfileByAuthUserId(authUserId: string): Promise<AuthProfile | null> {
  const rows = await db`
    SELECT ${db.unsafe(PROFILE_SELECT)}
    FROM profiles
    WHERE auth_user_id = ${authUserId}
    LIMIT 1
  `;
  return rows.length > 0 ? mapProfile(rows[0]) : null;
}

export async function getProfileById(profileId: string): Promise<AuthProfile | null> {
  const rows = await db`
    SELECT ${db.unsafe(PROFILE_SELECT)}
    FROM profiles
    WHERE id = ${profileId}
    LIMIT 1
  `;
  return rows.length > 0 ? mapProfile(rows[0]) : null;
}

/**
 * Returns the existing profile for `authUserId`, or creates one with default
 * `customer` role if this is the user's first authenticated request.
 *
 * The DB trigger `on_auth_user_created` normally handles profile creation at
 * signup time. This function is a safe fallback for edge cases (e.g. users
 * created via admin API, or triggered before the function was deployed).
 */
export async function getOrCreateProfile(authUserId: string, email: string): Promise<AuthProfile> {
  const existing = await getProfileByAuthUserId(authUserId);
  if (existing) return existing;

  const rows = await db`
    INSERT INTO profiles (auth_user_id, email, role, is_active)
    VALUES (${authUserId}, ${email}, 'customer', true)
    ON CONFLICT (auth_user_id) DO UPDATE
      SET email = EXCLUDED.email
    RETURNING ${db.unsafe(PROFILE_SELECT)}
  `;
  return mapProfile(rows[0]);
}

// =============================================================================
// Mutations
// =============================================================================

export type UpdateProfileInput = {
  fullName?: string;
  preferredLanguage?: string;
  preferredCurrency?: string;
};

export async function updateProfile(
  profileId: string,
  data: UpdateProfileInput
): Promise<AuthProfile> {
  const rows = await db`
    UPDATE profiles SET
      full_name          = COALESCE(${data.fullName          ?? null}, full_name),
      preferred_language = COALESCE(${data.preferredLanguage ?? null}, preferred_language),
      preferred_currency = COALESCE(${data.preferredCurrency ?? null}, preferred_currency)
    WHERE id = ${profileId}
    RETURNING ${db.unsafe(PROFILE_SELECT)}
  `;
  return mapProfile(rows[0]);
}
