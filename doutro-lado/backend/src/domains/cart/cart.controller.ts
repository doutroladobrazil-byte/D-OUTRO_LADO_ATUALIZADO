import type { Request, Response } from "express";
import { z } from "zod";
import {
  getCartByProfile,
  getOrCreateCart,
  upsertCartItem,
  upsertCartItemSchema,
} from "./cart.service.js";
import { fail, ok } from "../../utils/http.js";
import type { Brand } from "../../types/domain.js";

// =============================================================================
// Controller handlers
// =============================================================================

/**
 * GET /cart?brand=casa|moda
 * Returns or initialises the cart for the authenticated user's brand.
 */
export async function getCart(req: Request, res: Response) {
  const brand = req.query.brand as Brand;
  if (brand !== "casa" && brand !== "moda") {
    return fail(res, "Query param `brand` must be 'casa' or 'moda'", 400);
  }
  const profileId = req.user?.profileId;
  if (!profileId) return fail(res, "Profile not found in token", 401);

  const cart = await getCartByProfile(profileId, brand);
  // Return empty cart shape if none exists yet
  if (!cart) {
    return ok(res, {
      id: null,
      profileId,
      brand,
      currency: "BRL",
      items: [],
      subtotalBRL: 0,
    });
  }
  return ok(res, cart);
}

/**
 * PUT /cart/items
 * Body: { brand, productSlug, quantity }
 * Upserts item; quantity=0 removes.
 */
export async function putCartItem(req: Request, res: Response) {
  const parsed = upsertCartItemSchema.safeParse(req.body);
  if (!parsed.success) return fail(res, parsed.error.message, 400);

  const profileId = req.user?.profileId;
  if (!profileId) return fail(res, "Profile not found in token", 401);

  try {
    const cart = await upsertCartItem(profileId, parsed.data);
    return ok(res, cart);
  } catch (err) {
    return fail(res, err instanceof Error ? err.message : "Cart update failed", 400);
  }
}

/**
 * DELETE /cart/items/:productSlug?brand=casa|moda
 * Convenience: remove a specific item from the cart.
 */
export async function removeCartItem(req: Request, res: Response) {
  const brand = req.query.brand as Brand;
  if (brand !== "casa" && brand !== "moda") {
    return fail(res, "Query param `brand` must be 'casa' or 'moda'", 400);
  }
  const productSlug = Array.isArray(req.params.productSlug)
    ? req.params.productSlug[0]
    : req.params.productSlug;

  const profileId = req.user?.profileId;
  if (!profileId) return fail(res, "Profile not found in token", 401);

  try {
    const cart = await upsertCartItem(profileId, { brand, productSlug, quantity: 0 });
    return ok(res, cart);
  } catch (err) {
    return fail(res, err instanceof Error ? err.message : "Remove failed", 400);
  }
}
