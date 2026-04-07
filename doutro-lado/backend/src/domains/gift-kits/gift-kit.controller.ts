import type { Request, Response } from "express";
import { z } from "zod";
import {
  createGiftKit,
  createKitSchema,
  deleteGiftKit,
  getGiftKitById,
  listGiftKitsByProfile,
  updateGiftKit,
  updateKitSchema,
} from "./gift-kit.service.js";
import { PACKAGING_OPTIONS } from "./gift-kit.types.js";
import { fail, ok } from "../../utils/http.js";

// =============================================================================
// Controller handlers
// =============================================================================

/**
 * GET /gift-kits/packaging-options
 * Public — returns the structured packaging catalog for the frontend to render.
 */
export async function listPackagingOptions(_req: Request, res: Response) {
  const options = Object.entries(PACKAGING_OPTIONS).map(([type, data]) => ({
    type,
    label: data.label,
    descriptionPT: data.descriptionPT,
    surchargeMultiplier: data.surchargeMultiplier,
  }));
  return ok(res, options);
}

/**
 * POST /gift-kits
 * Authenticated — creates a new gift kit owned by the requesting user.
 */
export async function createKit(req: Request, res: Response) {
  const parsed = createKitSchema.safeParse(req.body);
  if (!parsed.success) return fail(res, parsed.error.message, 400);

  const profileId = (req as Request & { user?: { profileId?: string } }).user?.profileId;

  const kit = await createGiftKit(parsed.data, profileId);
  return ok(res, kit, 201);
}

/**
 * GET /gift-kits/mine
 * Authenticated — lists all kits belonging to the logged-in user.
 */
export async function listMyKits(req: Request, res: Response) {
  const profileId = (req as Request & { user?: { profileId?: string } }).user?.profileId;
  if (!profileId) return fail(res, "Profile not found in token", 401);

  const kits = await listGiftKitsByProfile(profileId);
  return ok(res, kits);
}

/**
 * GET /gift-kits/:id
 * Authenticated — returns a single gift kit. Future: enforce ownership.
 */
export async function getKit(req: Request, res: Response) {
  const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const kit = await getGiftKitById(id);
  if (!kit) return fail(res, "Gift kit not found", 404);
  return ok(res, kit);
}

/**
 * PATCH /gift-kits/:id
 * Authenticated — partial update of name, message, packaging or items.
 */
export async function patchKit(req: Request, res: Response) {
  const parsed = updateKitSchema.safeParse(req.body);
  if (!parsed.success) return fail(res, parsed.error.message, 400);

  const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const kit = await updateGiftKit(id, parsed.data);
  return ok(res, kit);
}

/**
 * DELETE /gift-kits/:id
 * Authenticated — removes the kit and all items.
 */
export async function removeKit(req: Request, res: Response) {
  const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  await deleteGiftKit(id);
  return ok(res, { deleted: id });
}
