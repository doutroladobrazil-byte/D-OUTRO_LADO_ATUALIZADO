import { db } from "../lib/db.js";
import { supabaseAdmin } from "../lib/supabase.js";
import { env } from "../config/env.js";
import type { Brand, MediaAsset, MediaType, ProductMedia } from "../types/domain.js";

// =============================================================================
// Storage helpers
// =============================================================================

function getMediaBucket(): string {
  return env.SUPABASE_STORAGE_BUCKET_MEDIA;
}

/**
 * Builds the storage path for a new asset.
 * Pattern: {brand}/{product_id}/{media_type}/{timestamp}-{filename}
 */
export function buildStoragePath(
  brand: Brand,
  productId: string,
  mediaType: MediaType,
  filename: string
): string {
  const ts = Date.now();
  // Sanitise filename: keep extension, replace unsafe chars
  const safe = filename.replace(/[^a-zA-Z0-9._-]/g, "-").toLowerCase();
  return `${brand}/${productId}/${mediaType}/${ts}-${safe}`;
}

// =============================================================================
// Mappers
// =============================================================================

function mapAsset(row: Record<string, unknown>): MediaAsset {
  return {
    id: row.id as string,
    brand: row.brand as Brand,
    mediaType: row.media_type as MediaType,
    bucket: row.bucket as string,
    storagePath: row.storage_path as string,
    publicUrl: row.public_url as string,
    mimeType: (row.mime_type as string | null) ?? undefined,
    fileSizeBytes: (row.file_size_bytes as number | null) ?? undefined,
    width: (row.width as number | null) ?? undefined,
    height: (row.height as number | null) ?? undefined,
    durationSeconds: (row.duration_seconds as number | null) ?? undefined,
    posterUrl: (row.poster_url as string | null) ?? undefined,
    altText: (row.alt_text as string | null) ?? undefined,
    caption: (row.caption as string | null) ?? undefined,
    isActive: row.is_active as boolean,
    createdAt: row.created_at as string,
  };
}

function mapProductMedia(row: Record<string, unknown>): ProductMedia {
  return {
    id: row.pm_id as string,
    productId: row.product_id as string,
    position: row.position as number,
    isPrimary: row.is_primary as boolean,
    createdAt: row.pm_created_at as string,
    asset: mapAsset(row),
  };
}

// =============================================================================
// Queries
// =============================================================================

/** Return all active media for a product, ordered by position. */
export async function listProductMedia(productId: string): Promise<ProductMedia[]> {
  const rows = await db`
    SELECT
      pm.id          AS pm_id,
      pm.product_id,
      pm.position,
      pm.is_primary,
      pm.created_at  AS pm_created_at,
      ma.id,
      ma.brand,
      ma.media_type,
      ma.bucket,
      ma.storage_path,
      ma.public_url,
      ma.mime_type,
      ma.file_size_bytes,
      ma.width,
      ma.height,
      ma.duration_seconds,
      ma.poster_url,
      ma.alt_text,
      ma.caption,
      ma.is_active,
      ma.created_at
    FROM product_media pm
    JOIN media_assets ma ON ma.id = pm.media_asset_id
    WHERE pm.product_id = ${productId}
      AND ma.is_active = true
    ORDER BY pm.is_primary DESC, pm.position
  `;
  return rows.map(mapProductMedia);
}

// =============================================================================
// Register
// =============================================================================

export type RegisterMediaInput = {
  brand: Brand;
  productId: string;
  mediaType: MediaType;
  bucket: string;
  storagePath: string;
  publicUrl: string;
  mimeType?: string;
  fileSizeBytes?: number;
  width?: number;
  height?: number;
  durationSeconds?: number;
  posterUrl?: string;
  altText?: string;
  caption?: string;
  isPrimary?: boolean;
};

/**
 * Insert a media_assets row + product_media join row.
 * If isPrimary is true, clears existing primary flags for this product first.
 */
export async function registerMediaAsset(input: RegisterMediaInput): Promise<ProductMedia> {
  const {
    brand, productId, mediaType, bucket, storagePath, publicUrl,
    mimeType, fileSizeBytes, width, height, durationSeconds,
    posterUrl, altText, caption, isPrimary = false,
  } = input;

  // Determine next position
  const [posRow] = await db`
    SELECT COALESCE(MAX(position), -1) + 1 AS next_pos
    FROM product_media
    WHERE product_id = ${productId}
  `;
  const nextPos = posRow.next_pos as number;

  // Insert asset
  const [assetRow] = await db`
    INSERT INTO media_assets (
      brand, media_type, bucket, storage_path, public_url,
      mime_type, file_size_bytes, width, height,
      duration_seconds, poster_url, alt_text, caption
    ) VALUES (
      ${brand}, ${mediaType}, ${bucket}, ${storagePath}, ${publicUrl},
      ${mimeType ?? null}, ${fileSizeBytes ?? null}, ${width ?? null}, ${height ?? null},
      ${durationSeconds ?? null}, ${posterUrl ?? null}, ${altText ?? null}, ${caption ?? null}
    )
    RETURNING *
  `;

  // If setting as primary, clear existing primary flags
  if (isPrimary) {
    await db`
      UPDATE product_media SET is_primary = false
      WHERE product_id = ${productId}
    `;
  }

  // Insert join row
  const [pmRow] = await db`
    INSERT INTO product_media (product_id, media_asset_id, position, is_primary)
    VALUES (${productId}, ${assetRow.id}, ${nextPos}, ${isPrimary})
    RETURNING id AS pm_id, product_id, position, is_primary, created_at AS pm_created_at
  `;

  return {
    id: pmRow.pm_id as string,
    productId: pmRow.product_id as string,
    position: pmRow.position as number,
    isPrimary: pmRow.is_primary as boolean,
    createdAt: pmRow.pm_created_at as string,
    asset: mapAsset(assetRow),
  };
}

// =============================================================================
// Delete
// =============================================================================

/**
 * Remove a media asset from a product:
 * 1. Remove product_media join row
 * 2. Delete from media_assets (soft or hard — here: hard, then storage)
 * 3. Delete from Supabase Storage
 *
 * Note: if the asset is used by other products, we only unlink (not delete the asset row).
 */
export async function deleteProductMedia(assetId: string, productId: string): Promise<void> {
  // Unlink from product
  await db`
    DELETE FROM product_media
    WHERE media_asset_id = ${assetId} AND product_id = ${productId}
  `;

  // Check if asset is still used by other products
  const [countRow] = await db`
    SELECT COUNT(*) AS cnt FROM product_media WHERE media_asset_id = ${assetId}
  `;
  const stillUsed = Number(countRow.cnt) > 0;

  if (!stillUsed) {
    // Get storage path before deletion
    const [assetRow] = await db`
      SELECT bucket, storage_path FROM media_assets WHERE id = ${assetId}
    `;

    if (assetRow) {
      // Delete from storage (non-fatal if fails)
      if (supabaseAdmin) {
        await supabaseAdmin.storage
          .from(assetRow.bucket as string)
          .remove([assetRow.storage_path as string]);
      }

      await db`DELETE FROM media_assets WHERE id = ${assetId}`;
    }
  }
}

// =============================================================================
// Reorder
// =============================================================================

/**
 * Update positions for a product's media in bulk.
 * orderedIds = array of product_media.id (pm join ids) in desired order.
 */
export async function reorderProductMedia(
  productId: string,
  orderedIds: string[]
): Promise<void> {
  // Build a VALUES list for bulk update
  for (let i = 0; i < orderedIds.length; i++) {
    await db`
      UPDATE product_media
      SET position = ${i}
      WHERE id = ${orderedIds[i]} AND product_id = ${productId}
    `;
  }
}

// =============================================================================
// Set primary
// =============================================================================

export async function setPrimaryMedia(productId: string, pmId: string): Promise<void> {
  await db`
    UPDATE product_media SET is_primary = false WHERE product_id = ${productId}
  `;
  await db`
    UPDATE product_media SET is_primary = true WHERE id = ${pmId} AND product_id = ${productId}
  `;
}

// =============================================================================
// Signed upload URL
// =============================================================================

export type UploadUrlResult = {
  signedUrl: string;
  storagePath: string;
  bucket: string;
  publicUrl: string;
};

/**
 * Generate a signed upload URL so the admin UI can upload directly to Supabase Storage
 * without routing the binary through the backend.
 */
export async function generateUploadUrl(
  brand: Brand,
  productId: string,
  mediaType: MediaType,
  filename: string
): Promise<UploadUrlResult | null> {
  if (!supabaseAdmin) return null;

  const bucket = getMediaBucket();
  const storagePath = buildStoragePath(brand, productId, mediaType, filename);

  const { data, error } = await supabaseAdmin.storage
    .from(bucket)
    .createSignedUploadUrl(storagePath);

  if (error || !data) return null;

  // Build public URL
  const { data: publicData } = supabaseAdmin.storage
    .from(bucket)
    .getPublicUrl(storagePath);

  return {
    signedUrl: data.signedUrl,
    storagePath,
    bucket,
    publicUrl: publicData.publicUrl,
  };
}
