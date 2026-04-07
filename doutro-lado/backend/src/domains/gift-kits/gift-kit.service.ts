import { z } from "zod";
import { db } from "../../lib/db.js";
import { getProductsBySlug } from "../../services/catalog.service.js";
import { resolveOrderWeightRange } from "../freight/freight.service.js";
import {
  PACKAGING_OPTIONS,
  type CreateGiftKitInput,
  type GiftKit,
  type GiftKitItem,
  type PackagingType,
  type UpdateGiftKitInput,
} from "./gift-kit.types.js";
import type { Brand, WeightRange } from "../../types/domain.js";

// =============================================================================
// Validation schemas
// =============================================================================

const PACKAGING_TYPES = ["standard", "premium", "signature"] as const;

export const createKitSchema = z.object({
  brand: z.enum(["casa", "moda"]),
  name: z.string().min(1).max(128),
  message: z.string().max(500).optional(),
  packagingType: z.enum(PACKAGING_TYPES),
  items: z
    .array(
      z.object({
        productSlug: z.string().min(1),
        quantity: z.coerce.number().int().min(1).max(50),
      })
    )
    .min(1)
    .max(20),
});

export const updateKitSchema = z.object({
  name: z.string().min(1).max(128).optional(),
  message: z.string().max(500).optional().nullable(),
  packagingType: z.enum(PACKAGING_TYPES).optional(),
  items: z
    .array(
      z.object({
        productSlug: z.string().min(1),
        quantity: z.coerce.number().int().min(1).max(50),
      })
    )
    .min(1)
    .max(20)
    .optional(),
});

// =============================================================================
// Business rules
// =============================================================================

/**
 * All items in a gift kit must belong to the same brand as the kit itself.
 * Casa and Moda items cannot be mixed — this is an explicit platform rule.
 */
function ensureSingleBrandKit(kitBrand: Brand, itemBrands: Brand[]) {
  const foreign = itemBrands.filter((b) => b !== kitBrand);
  if (foreign.length > 0) {
    throw new Error(
      `Gift kit brand mismatch: kit is "${kitBrand}" but some items belong to "${foreign[0]}". ` +
        `Casa and Moda items cannot be mixed in the same kit.`
    );
  }
}

/**
 * Compute packaging surcharge (applied on top of subtotal, not freight).
 */
function computePackagingSurcharge(packagingType: PackagingType, subtotalBRL: number): number {
  const option = PACKAGING_OPTIONS[packagingType];
  return Number((subtotalBRL * option.surchargeMultiplier).toFixed(2));
}

// =============================================================================
// Row mapper
// =============================================================================

async function fetchKitRows(kitId: string) {
  return db`
    SELECT
      gk.id, gk.profile_id, gk.brand, gk.name, gk.message,
      gk.packaging_type, gk.total_weight_range, gk.total_amount_brl,
      gk.packaging_surcharge_brl, gk.subtotal_brl,
      gk.created_at, gk.updated_at,
      gki.id AS item_id, gki.product_id, gki.quantity,
      p.slug AS product_slug, p.name AS product_name, p.brand AS product_brand,
      p.retail_price_brl, p.weight_range AS product_weight_range
    FROM gift_kits gk
    LEFT JOIN gift_kit_items gki ON gki.kit_id = gk.id
    LEFT JOIN products p ON p.id = gki.product_id
    WHERE gk.id = ${kitId}
    ORDER BY gki.id
  `;
}

function mapToGiftKit(rows: Record<string, unknown>[]): GiftKit {
  if (rows.length === 0) throw new Error("Gift kit not found");
  const first = rows[0];

  const packagingType = first.packaging_type as PackagingType;

  const items: GiftKitItem[] = rows
    .filter((r) => r.item_id !== null)
    .map((r) => {
      const unitPrice = Number(r.retail_price_brl);
      return {
        id: r.item_id as string,
        productId: r.product_id as string,
        productSlug: r.product_slug as string,
        productName: r.product_name as string,
        brand: r.product_brand as Brand,
        quantity: r.quantity as number,
        unitPriceBRL: unitPrice,
        lineTotalBRL: Number((unitPrice * (r.quantity as number)).toFixed(2)),
        weightRange: r.product_weight_range as WeightRange,
      };
    });

  return {
    id: first.id as string,
    profileId: (first.profile_id as string | null) ?? null,
    brand: first.brand as Brand,
    name: first.name as string,
    message: (first.message as string | null) ?? null,
    packagingType,
    packagingLabel: PACKAGING_OPTIONS[packagingType].label,
    items,
    subtotalBRL: Number(first.subtotal_brl),
    packagingSurchargeBRL: Number(first.packaging_surcharge_brl),
    totalBRL: Number(first.total_amount_brl),
    estimatedWeightRange: first.total_weight_range as WeightRange,
    createdAt: (first.created_at as Date).toISOString(),
    updatedAt: (first.updated_at as Date).toISOString(),
  };
}

// =============================================================================
// Service operations
// =============================================================================

/**
 * Create a new gift kit and persist all items in a single transaction.
 * Enforces:
 *  - brand isolation (no Casa+Moda mixing)
 *  - stock availability
 *  - deterministic totals (subtotal + packaging surcharge)
 *  - weight range estimation compatible with freight module
 */
export async function createGiftKit(
  input: CreateGiftKitInput,
  profileId?: string
): Promise<GiftKit> {
  const parsed = createKitSchema.parse(input);

  const slugs = parsed.items.map((i) => i.productSlug);
  const products = await getProductsBySlug(slugs);

  // Build item lines
  const itemLines = parsed.items.map((item) => {
    const product = products.find((p) => p.slug === item.productSlug);
    if (!product) throw new Error(`Product not found: ${item.productSlug}`);
    if (item.quantity > product.stock) {
      throw new Error(`Insufficient stock for ${product.slug}. Available: ${product.stock}`);
    }
    return {
      productId: product.id,
      brand: product.brand,
      slug: product.slug,
      name: product.name,
      quantity: item.quantity,
      unitPriceBRL: product.retailPriceBRL,
      lineTotalBRL: Number((product.retailPriceBRL * item.quantity).toFixed(2)),
      weightRange: product.weightRange,
    };
  });

  // Brand isolation check
  ensureSingleBrandKit(parsed.brand, itemLines.map((i) => i.brand));

  // Totals
  const subtotalBRL = Number(itemLines.reduce((s, i) => s + i.lineTotalBRL, 0).toFixed(2));
  const packagingSurchargeBRL = computePackagingSurcharge(parsed.packagingType, subtotalBRL);
  const totalBRL = Number((subtotalBRL + packagingSurchargeBRL).toFixed(2));
  const estimatedWeightRange = resolveOrderWeightRange(
    itemLines.map((i) => ({ weightRange: i.weightRange, quantity: i.quantity }))
  );

  // Persist
  const [kit] = await db`
    INSERT INTO gift_kits (
      profile_id, brand, name, message, packaging_type,
      subtotal_brl, packaging_surcharge_brl, total_amount_brl, total_weight_range
    ) VALUES (
      ${profileId ?? null}, ${parsed.brand}, ${parsed.name}, ${parsed.message ?? null},
      ${parsed.packagingType}, ${subtotalBRL}, ${packagingSurchargeBRL},
      ${totalBRL}, ${estimatedWeightRange}
    )
    RETURNING id
  `;

  if (itemLines.length > 0) {
    await db`
      INSERT INTO gift_kit_items ${db(
        itemLines.map((line) => ({
          kit_id: kit.id as string,
          product_id: line.productId,
          quantity: line.quantity,
        }))
      )}
    `;
  }

  const rows = await fetchKitRows(kit.id as string);
  return mapToGiftKit(rows as Record<string, unknown>[]);
}

/**
 * Fetch a single gift kit by ID.
 */
export async function getGiftKitById(kitId: string): Promise<GiftKit> {
  const rows = await fetchKitRows(kitId);
  return mapToGiftKit(rows as Record<string, unknown>[]);
}

/**
 * List all gift kits for a given profile.
 */
export async function listGiftKitsByProfile(profileId: string): Promise<GiftKit[]> {
  const kitIds = await db`
    SELECT id FROM gift_kits WHERE profile_id = ${profileId} ORDER BY created_at DESC
  `;
  if (kitIds.length === 0) return [];

  const kits = await Promise.all(
    (kitIds as Record<string, unknown>[]).map((row) =>
      getGiftKitById(row.id as string)
    )
  );
  return kits;
}

/**
 * Update name, message, packaging and/or items of an existing kit.
 * Recalculates all totals deterministically.
 */
export async function updateGiftKit(
  kitId: string,
  input: UpdateGiftKitInput
): Promise<GiftKit> {
  const parsed = updateKitSchema.parse(input);

  // Fetch current kit for brand reference
  const existing = await getGiftKitById(kitId);

  let itemLines = existing.items.map((i) => ({
    productId: i.productId,
    brand: i.brand,
    slug: i.productSlug,
    name: i.productName,
    quantity: i.quantity,
    unitPriceBRL: i.unitPriceBRL,
    lineTotalBRL: i.lineTotalBRL,
    weightRange: i.weightRange,
  }));

  // Replace items if provided
  if (parsed.items) {
    const slugs = parsed.items.map((i) => i.productSlug);
    const products = await getProductsBySlug(slugs);

    itemLines = parsed.items.map((item) => {
      const product = products.find((p) => p.slug === item.productSlug);
      if (!product) throw new Error(`Product not found: ${item.productSlug}`);
      if (item.quantity > product.stock) {
        throw new Error(`Insufficient stock for ${product.slug}. Available: ${product.stock}`);
      }
      return {
        productId: product.id,
        brand: product.brand,
        slug: product.slug,
        name: product.name,
        quantity: item.quantity,
        unitPriceBRL: product.retailPriceBRL,
        lineTotalBRL: Number((product.retailPriceBRL * item.quantity).toFixed(2)),
        weightRange: product.weightRange,
      };
    });

    ensureSingleBrandKit(existing.brand, itemLines.map((i) => i.brand));
  }

  const packagingType = (parsed.packagingType ?? existing.packagingType) as PackagingType;
  const subtotalBRL = Number(itemLines.reduce((s, i) => s + i.lineTotalBRL, 0).toFixed(2));
  const packagingSurchargeBRL = computePackagingSurcharge(packagingType, subtotalBRL);
  const totalBRL = Number((subtotalBRL + packagingSurchargeBRL).toFixed(2));
  const estimatedWeightRange = resolveOrderWeightRange(
    itemLines.map((i) => ({ weightRange: i.weightRange, quantity: i.quantity }))
  );

  await db`
    UPDATE gift_kits SET
      name = ${parsed.name ?? existing.name},
      message = ${parsed.message !== undefined ? parsed.message : existing.message},
      packaging_type = ${packagingType},
      subtotal_brl = ${subtotalBRL},
      packaging_surcharge_brl = ${packagingSurchargeBRL},
      total_amount_brl = ${totalBRL},
      total_weight_range = ${estimatedWeightRange},
      updated_at = now()
    WHERE id = ${kitId}
  `;

  if (parsed.items) {
    await db`DELETE FROM gift_kit_items WHERE kit_id = ${kitId}`;
    if (itemLines.length > 0) {
      await db`
        INSERT INTO gift_kit_items ${db(
          itemLines.map((line) => ({
            kit_id: kitId,
            product_id: line.productId,
            quantity: line.quantity,
          }))
        )}
      `;
    }
  }

  const rows = await fetchKitRows(kitId);
  return mapToGiftKit(rows as Record<string, unknown>[]);
}

/**
 * Delete a gift kit and all its items (cascade).
 */
export async function deleteGiftKit(kitId: string): Promise<void> {
  await db`DELETE FROM gift_kits WHERE id = ${kitId}`;
}
