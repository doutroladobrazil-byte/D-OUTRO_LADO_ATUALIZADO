import type { Request, Response } from "express";
import { z } from "zod";
import {
  deleteProductMedia,
  generateUploadUrl,
  listProductMedia,
  patchMediaAsset,
  registerMediaAsset,
  reorderProductMedia,
  setPrimaryMedia,
} from "../../services/media.service.js";
import { fail, ok } from "../../utils/http.js";
import { logger } from "../../utils/logger.js";

// =============================================================================
// Validation schemas
// =============================================================================

const uploadUrlSchema = z.object({
  brand: z.enum(["casa", "moda"]),
  productId: z.string().uuid(),
  mediaType: z.enum(["image", "video"]),
  filename: z.string().min(1).max(200),
});

const registerSchema = z.object({
  brand: z.enum(["casa", "moda"]),
  productId: z.string().uuid(),
  mediaType: z.enum(["image", "video"]),
  bucket: z.string().min(1),
  storagePath: z.string().min(1),
  publicUrl: z.string().url(),
  mimeType: z.string().optional(),
  fileSizeBytes: z.number().int().positive().optional(),
  width: z.number().int().positive().optional(),
  height: z.number().int().positive().optional(),
  durationSeconds: z.number().positive().optional(),
  posterUrl: z.string().url().optional(),
  altText: z.string().max(300).optional(),
  caption: z.string().max(500).optional(),
  isPrimary: z.boolean().optional(),
});

const reorderSchema = z.object({
  orderedIds: z.array(z.string().uuid()).min(1),
});

// =============================================================================
// Handlers
// =============================================================================

/**
 * POST /admin/media/upload-url
 * Returns a signed Supabase Storage upload URL + the storage path to use for /register.
 */
export async function getUploadUrl(req: Request, res: Response) {
  const parsed = uploadUrlSchema.safeParse(req.body);
  if (!parsed.success) return fail(res, parsed.error.message, 400);

  const { brand, productId, mediaType, filename } = parsed.data;
  const result = await generateUploadUrl(brand, productId, mediaType, filename);

  if (!result) {
    logger.warn("upload_url_unavailable", { productId, brand, mediaType, filename });
    return fail(
      res,
      "Supabase Storage is not configured. Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.",
      503
    );
  }

  return ok(res, result);
}

/**
 * POST /admin/media/register
 * After a successful upload, registers the asset metadata in the DB.
 */
export async function registerMedia(req: Request, res: Response) {
  const parsed = registerSchema.safeParse(req.body);
  if (!parsed.success) return fail(res, parsed.error.message, 400);

  try {
    const media = await registerMediaAsset(parsed.data);
    logger.info("media_registered", {
      assetId: media.asset.id,
      productId: parsed.data.productId,
      mediaType: parsed.data.mediaType,
    });
    return ok(res, media, 201);
  } catch (error) {
    logger.error("media_register_failed", {
      productId: parsed.data.productId,
      err: error instanceof Error ? error.message : String(error),
    });
    return fail(res, error instanceof Error ? error.message : "Failed to register media", 500);
  }
}

/**
 * GET /admin/products/:productId/media
 * List all active media for a product (ordered).
 */
export async function listMedia(req: Request, res: Response) {
  const productId = Array.isArray(req.params.productId) ? req.params.productId[0] : req.params.productId;
  if (!productId) return fail(res, "productId required", 400);

  const media = await listProductMedia(productId);
  return ok(res, media);
}

/**
 * PATCH /admin/products/:productId/media/reorder
 * Body: { orderedIds: string[] }  — array of product_media.id in desired order
 */
export async function reorderMedia(req: Request, res: Response) {
  const productId = Array.isArray(req.params.productId) ? req.params.productId[0] : req.params.productId;
  if (!productId) return fail(res, "productId required", 400);

  const parsed = reorderSchema.safeParse(req.body);
  if (!parsed.success) return fail(res, parsed.error.message, 400);

  try {
    await reorderProductMedia(productId, parsed.data.orderedIds);
    return ok(res, { reordered: true });
  } catch (error) {
    return fail(res, error instanceof Error ? error.message : "Reorder failed", 500);
  }
}

/**
 * PATCH /admin/products/:productId/media/:pmId/primary
 * Sets the given product_media entry as the primary asset for this product.
 */
export async function setPrimary(req: Request, res: Response) {
  const productId = Array.isArray(req.params.productId) ? req.params.productId[0] : req.params.productId;
  const pmId = Array.isArray(req.params.pmId) ? req.params.pmId[0] : req.params.pmId;
  if (!productId || !pmId) return fail(res, "productId and pmId required", 400);

  try {
    await setPrimaryMedia(productId, pmId);
    return ok(res, { primary: pmId });
  } catch (error) {
    return fail(res, error instanceof Error ? error.message : "Set primary failed", 500);
  }
}

const patchMediaSchema = z.object({
  altText: z.string().max(300).nullish(),
  caption: z.string().max(500).nullish(),
  posterUrl: z.string().url().nullish(),
}).strict();

/**
 * PATCH /admin/media/:assetId
 * Update editable metadata: altText, caption, posterUrl.
 */
export async function patchMedia(req: Request, res: Response) {
  const assetId = Array.isArray(req.params.assetId) ? req.params.assetId[0] : req.params.assetId;
  if (!assetId) return fail(res, "assetId required", 400);

  const parsed = patchMediaSchema.safeParse(req.body);
  if (!parsed.success) return fail(res, parsed.error.issues[0]?.message ?? parsed.error.message, 400);

  const updated = await patchMediaAsset(assetId, {
    altText: parsed.data.altText ?? undefined,
    caption: parsed.data.caption ?? undefined,
    posterUrl: parsed.data.posterUrl ?? undefined,
  });
  if (!updated) return fail(res, "Media asset not found", 404);
  return ok(res, updated);
}

/**
 * DELETE /admin/media/:assetId
 * Query param: productId (required — needed to determine if asset is shared)
 */
export async function deleteMedia(req: Request, res: Response) {
  const assetId = Array.isArray(req.params.assetId) ? req.params.assetId[0] : req.params.assetId;
  const productIdParam = req.query.productId;
  const productId = Array.isArray(productIdParam) ? productIdParam[0] : productIdParam;

  if (!assetId) return fail(res, "assetId required", 400);
  if (typeof productId !== "string") return fail(res, "productId query param required", 400);

  try {
    await deleteProductMedia(assetId, productId);
    return ok(res, { deleted: assetId });
  } catch (error) {
    return fail(res, error instanceof Error ? error.message : "Delete failed", 500);
  }
}
