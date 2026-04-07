import type { Request, Response } from "express";
import { getProfileById, updateProfile, type UpdateProfileInput } from "../../services/profile.service.js";
import { fail, ok } from "../../utils/http.js";

/**
 * GET /api/auth/session
 * Returns the authenticated user's full profile.
 * Used by the frontend to hydrate the auth context after login.
 */
export async function getSession(req: Request, res: Response) {
  if (!req.user) {
    fail(res, "Unauthorized", 401);
    return;
  }

  const profile = await getProfileById(req.user.profileId);
  if (!profile) {
    fail(res, "Profile not found", 404);
    return;
  }

  ok(res, profile);
}

/**
 * PATCH /api/auth/profile
 * Allows the authenticated user to update their own profile preferences.
 * Role changes are NOT allowed here — role management is admin-only.
 */
export async function patchProfile(req: Request, res: Response) {
  if (!req.user) {
    fail(res, "Unauthorized", 401);
    return;
  }

  const { fullName, preferredLanguage, preferredCurrency } = req.body as UpdateProfileInput;

  const updated = await updateProfile(req.user.profileId, {
    fullName,
    preferredLanguage,
    preferredCurrency,
  });

  ok(res, updated);
}
