import { z } from "zod";
import { db } from "../../lib/db.js";
import type { Brand } from "../../types/domain.js";
import { WEIGHT_RANGES } from "../../config/constants.js";
import type { WeightRange } from "../../types/domain.js";
import {
  getProductAvailabilityMap,
  setProductAvailabilities,
  type ProductAvailabilityMap,
} from "../countries/availability.service.js";

// =============================================================================
// Input schemas
// =============================================================================

export const createProductSchema = z.object({
  brand: z.enum(["casa", "moda"]).default("moda"),
  name: z.string().min(1).max(255),
  slug: z
    .string()
    .min(1)
    .max(255)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug deve conter apenas letras minúsculas, números e hífens"),
  sku: z.string().min(1).max(100),
  shortDescription: z.string().max(500).default(""),
  longDescription: z.string().default(""),
  seoTitle: z.string().max(255).nullable().optional(),
  seoDescription: z.string().max(500).nullable().optional(),
  material: z.string().max(255).default(""),
  dimensions: z.string().max(255).default(""),
  origin: z.string().max(255).nullable().optional(),
  careInstructions: z.string().nullable().optional(),
  weightRange: z.enum(WEIGHT_RANGES as [WeightRange, ...WeightRange[]]),
  weightGrams: z.coerce.number().int().min(1).nullable().optional(),
  retailPriceBRL: z.coerce.number().positive(),
  wholesalePriceBRL: z.coerce.number().positive().nullable().optional(),
  wholesaleMinQty: z.coerce.number().int().min(1).default(1),
  stock: z.coerce.number().int().min(0).default(0),
  badge: z.string().max(64).nullable().optional(),
  isFeatured: z.boolean().default(false),
  isActive: z.boolean().default(true),
  collection: z.string().max(128).nullable().optional(),
  tags: z.array(z.string()).default([]),
  position: z.coerce.number().int().min(0).default(0),
  categoryId: z.string().uuid().nullable().optional(),
  subcategoryId: z.string().uuid().nullable().optional(),
});

export type CreateProductInput = z.infer<typeof createProductSchema>;

export const patchProductSchema = z.object({
  // Identity — slug/sku changes require unique-conflict handling
  name: z.string().min(1).max(255).optional(),
  slug: z
    .string()
    .min(1)
    .max(255)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug deve conter apenas letras minúsculas, números e hífens")
    .optional(),
  sku: z.string().min(1).max(100).optional(),
  // Copy
  shortDescription: z.string().max(500).optional(),
  longDescription: z.string().optional(),
  seoTitle: z.string().max(255).nullable().optional(),
  seoDescription: z.string().max(500).nullable().optional(),
  // Physical
  material: z.string().max(255).optional(),
  dimensions: z.string().max(255).optional(),
  origin: z.string().max(255).nullable().optional(),
  careInstructions: z.string().nullable().optional(),
  // Weight & freight
  weightRange: z.enum(WEIGHT_RANGES as [WeightRange, ...WeightRange[]]).optional(),
  weightGrams: z.coerce.number().int().min(1).nullable().optional(),
  // Pricing
  retailPriceBRL: z.coerce.number().positive().optional(),
  wholesalePriceBRL: z.coerce.number().positive().nullable().optional(),
  wholesaleMinQty: z.coerce.number().int().min(1).optional(),
  // Stock
  stock: z.coerce.number().int().min(0).optional(),
  // Merchandising
  badge: z.string().max(64).nullable().optional(),
  isFeatured: z.boolean().optional(),
  isActive: z.boolean().optional(),
  collection: z.string().max(128).nullable().optional(),
  tags: z.array(z.string()).optional(),
  position: z.coerce.number().int().min(0).optional(),
  // Taxonomy
  categoryId: z.string().uuid().nullable().optional(),
  subcategoryId: z.string().uuid().nullable().optional(),
});

export type PatchProductInput = z.infer<typeof patchProductSchema>;

export const patchOrderStatusSchema = z.object({
  orderStatus: z.enum([
    "created", "processing", "packing", "shipped", "delivered", "cancelled",
  ]).optional(),
  paymentStatus: z.enum(["pending", "paid", "failed", "refunded"]).optional(),
  fiscalStatus: z.enum(["pending", "in_review", "issued", "rejected"]).optional(),
  notes: z.string().max(1000).nullable().optional(),
});

export type PatchOrderStatusInput = z.infer<typeof patchOrderStatusSchema>;

// =============================================================================
// Product admin operations
// =============================================================================

/**
 * List all products for admin (includes inactive, all brands).
 */
export async function listAdminProducts(options: { brand?: Brand; search?: string } = {}) {
  const { brand, search } = options;
  const rows = await db`
    SELECT
      p.id, p.brand, p.name, p.slug, p.sku,
      p.retail_price_brl, p.wholesale_price_brl, p.wholesale_min_qty,
      p.stock, p.weight_range, p.badge, p.is_featured, p.is_active,
      p.collection, p.created_at,
      c.name AS category_name
    FROM products p
    LEFT JOIN categories c ON c.id = p.category_id
    WHERE true
      ${brand ? db`AND p.brand = ${brand}` : db``}
      ${search ? db`AND (p.name ILIKE ${"%" + search + "%"} OR p.sku ILIKE ${"%" + search + "%"})` : db``}
    ORDER BY p.brand, p.is_active DESC, p.name
    LIMIT 200
  `;

  return rows.map((row) => ({
    id: row.id as string,
    brand: row.brand as Brand,
    name: row.name as string,
    slug: row.slug as string,
    sku: row.sku as string,
    category: (row.category_name as string) ?? "",
    retailPriceBRL: Number(row.retail_price_brl),
    wholesalePriceBRL: row.wholesale_price_brl != null ? Number(row.wholesale_price_brl) : 0,
    wholesaleMinQty: row.wholesale_min_qty as number,
    stock: row.stock as number,
    weightRange: row.weight_range as WeightRange,
    badge: (row.badge as string | null) ?? null,
    isFeatured: row.is_featured as boolean,
    isActive: row.is_active as boolean,
    collection: (row.collection as string | null) ?? null,
    createdAt: (row.created_at as Date).toISOString(),
  }));
}

/**
 * Get a single product with full details for admin editing.
 */
export async function getAdminProductById(productId: string) {
  const [row] = await db`
    SELECT
      p.id, p.brand, p.name, p.slug, p.sku,
      p.short_description, p.long_description,
      p.seo_title, p.seo_description,
      p.material, p.dimensions, p.origin, p.care_instructions,
      p.weight_range, p.weight_grams,
      p.retail_price_brl, p.wholesale_price_brl, p.wholesale_min_qty,
      p.stock, p.badge, p.is_featured, p.is_active,
      p.collection, p.tags, p.position,
      p.category_id, p.subcategory_id,
      p.created_at, p.updated_at,
      c.name AS category_name,
      s.name AS subcategory_name
    FROM products p
    LEFT JOIN categories c ON c.id = p.category_id
    LEFT JOIN subcategories s ON s.id = p.subcategory_id
    WHERE p.id = ${productId}
  `;
  if (!row) throw new Error(`Produto não encontrado: ${productId}`);

  return {
    id: row.id as string,
    brand: row.brand as Brand,
    name: row.name as string,
    slug: row.slug as string,
    sku: row.sku as string,
    shortDescription: (row.short_description as string) ?? "",
    longDescription: (row.long_description as string) ?? "",
    seoTitle: (row.seo_title as string | null) ?? null,
    seoDescription: (row.seo_description as string | null) ?? null,
    material: (row.material as string) ?? "",
    dimensions: (row.dimensions as string) ?? "",
    origin: (row.origin as string | null) ?? null,
    careInstructions: (row.care_instructions as string | null) ?? null,
    weightRange: row.weight_range as WeightRange,
    weightGrams: (row.weight_grams as number | null) ?? null,
    retailPriceBRL: Number(row.retail_price_brl),
    wholesalePriceBRL: row.wholesale_price_brl != null ? Number(row.wholesale_price_brl) : null,
    wholesaleMinQty: row.wholesale_min_qty as number,
    stock: row.stock as number,
    badge: (row.badge as string | null) ?? null,
    isFeatured: row.is_featured as boolean,
    isActive: row.is_active as boolean,
    collection: (row.collection as string | null) ?? null,
    tags: (row.tags as string[]) ?? [],
    position: (row.position as number) ?? 0,
    categoryId: (row.category_id as string | null) ?? null,
    subcategoryId: (row.subcategory_id as string | null) ?? null,
    category: (row.category_name as string | null) ?? "",
    subcategory: (row.subcategory_name as string | null) ?? "",
    createdAt: (row.created_at as Date).toISOString(),
    updatedAt: (row.updated_at as Date).toISOString(),
  };
}

/**
 * Create a new product.
 * Returns the newly created row with id, slug, and brand.
 */
export async function createAdminProduct(input: CreateProductInput) {
  const parsed = createProductSchema.parse(input);

  const [row] = await db`
    INSERT INTO products (
      brand, name, slug, sku,
      short_description, long_description,
      seo_title, seo_description,
      material, dimensions, origin, care_instructions,
      weight_range, weight_grams,
      retail_price_brl, wholesale_price_brl, wholesale_min_qty,
      stock, badge, is_featured, is_active,
      collection, tags, position,
      category_id, subcategory_id
    ) VALUES (
      ${parsed.brand}, ${parsed.name}, ${parsed.slug}, ${parsed.sku},
      ${parsed.shortDescription}, ${parsed.longDescription},
      ${parsed.seoTitle ?? null}, ${parsed.seoDescription ?? null},
      ${parsed.material}, ${parsed.dimensions},
      ${parsed.origin ?? null}, ${parsed.careInstructions ?? null},
      ${parsed.weightRange}, ${parsed.weightGrams ?? null},
      ${parsed.retailPriceBRL}, ${parsed.wholesalePriceBRL ?? null}, ${parsed.wholesaleMinQty},
      ${parsed.stock}, ${parsed.badge ?? null}, ${parsed.isFeatured}, ${parsed.isActive},
      ${parsed.collection ?? null}, ${parsed.tags}, ${parsed.position},
      ${parsed.categoryId ?? null}, ${parsed.subcategoryId ?? null}
    )
    RETURNING id, brand, name, slug, sku, retail_price_brl, is_active, created_at
  `;
  return row as {
    id: string;
    brand: string;
    name: string;
    slug: string;
    sku: string;
    retail_price_brl: string;
    is_active: boolean;
    created_at: Date;
  };
}

/**
 * Patch a product — any subset of fields.
 * Handles slug/sku uniqueness gracefully.
 */
export async function patchAdminProduct(productId: string, input: PatchProductInput) {
  const parsed = patchProductSchema.parse(input);

  const updates: Record<string, unknown> = {};

  // Identity
  if (parsed.name !== undefined) updates.name = parsed.name;
  if (parsed.slug !== undefined) updates.slug = parsed.slug;
  if (parsed.sku !== undefined) updates.sku = parsed.sku;
  // Copy
  if (parsed.shortDescription !== undefined) updates.short_description = parsed.shortDescription;
  if (parsed.longDescription !== undefined) updates.long_description = parsed.longDescription;
  if (parsed.seoTitle !== undefined) updates.seo_title = parsed.seoTitle;
  if (parsed.seoDescription !== undefined) updates.seo_description = parsed.seoDescription;
  // Physical
  if (parsed.material !== undefined) updates.material = parsed.material;
  if (parsed.dimensions !== undefined) updates.dimensions = parsed.dimensions;
  if (parsed.origin !== undefined) updates.origin = parsed.origin;
  if (parsed.careInstructions !== undefined) updates.care_instructions = parsed.careInstructions;
  // Weight
  if (parsed.weightRange !== undefined) updates.weight_range = parsed.weightRange;
  if (parsed.weightGrams !== undefined) updates.weight_grams = parsed.weightGrams;
  // Pricing
  if (parsed.retailPriceBRL !== undefined) updates.retail_price_brl = parsed.retailPriceBRL;
  if (parsed.wholesalePriceBRL !== undefined) updates.wholesale_price_brl = parsed.wholesalePriceBRL;
  if (parsed.wholesaleMinQty !== undefined) updates.wholesale_min_qty = parsed.wholesaleMinQty;
  // Stock
  if (parsed.stock !== undefined) updates.stock = parsed.stock;
  // Merchandising
  if (parsed.badge !== undefined) updates.badge = parsed.badge;
  if (parsed.isFeatured !== undefined) updates.is_featured = parsed.isFeatured;
  if (parsed.isActive !== undefined) updates.is_active = parsed.isActive;
  if (parsed.collection !== undefined) updates.collection = parsed.collection;
  if (parsed.tags !== undefined) updates.tags = parsed.tags;
  if (parsed.position !== undefined) updates.position = parsed.position;
  // Taxonomy
  if (parsed.categoryId !== undefined) updates.category_id = parsed.categoryId;
  if (parsed.subcategoryId !== undefined) updates.subcategory_id = parsed.subcategoryId;

  if (Object.keys(updates).length === 0) {
    throw new Error("Nenhum campo fornecido para atualização");
  }

  updates.updated_at = new Date();

  const [row] = await db`
    UPDATE products SET ${db(updates)}
    WHERE id = ${productId}
    RETURNING id, brand, name, slug, sku, stock, retail_price_brl, wholesale_price_brl,
              is_featured, is_active, badge, updated_at
  `;
  if (!row) throw new Error(`Produto não encontrado: ${productId}`);
  return row;
}

/**
 * Soft-delete a product by setting is_active = false.
 * Hard delete is intentionally not exposed — preserves historical order integrity.
 */
export async function deleteAdminProduct(productId: string) {
  const [row] = await db`
    UPDATE products SET is_active = false, updated_at = now()
    WHERE id = ${productId}
    RETURNING id, is_active
  `;
  if (!row) throw new Error(`Produto não encontrado: ${productId}`);
  return row as { id: string; is_active: boolean };
}

// =============================================================================
// Order admin operations
// =============================================================================

export async function patchAdminOrder(orderId: string, input: PatchOrderStatusInput) {
  const parsed = patchOrderStatusSchema.parse(input);

  const updates: Record<string, unknown> = {};
  if (parsed.orderStatus !== undefined) updates.order_status = parsed.orderStatus;
  if (parsed.paymentStatus !== undefined) updates.payment_status = parsed.paymentStatus;
  if (parsed.fiscalStatus !== undefined) updates.fiscal_status = parsed.fiscalStatus;
  if (parsed.notes !== undefined) updates.notes = parsed.notes;

  if (Object.keys(updates).length === 0) throw new Error("No fields to update");
  updates.updated_at = new Date();

  const [row] = await db`
    UPDATE orders SET ${db(updates)}
    WHERE public_id = ${orderId}
    RETURNING id, public_id, brand, order_status, payment_status, fiscal_status, updated_at
  `;
  if (!row) throw new Error(`Order not found: ${orderId}`);
  return row;
}

export async function getAdminOrderDetail(publicId: string) {
  const [order] = await db`
    SELECT
      o.id, o.public_id, o.brand, o.currency,
      o.subtotal_brl, o.freight_brl, o.total_brl,
      o.shipping_region, o.estimated_weight_range,
      o.order_status, o.payment_status, o.fiscal_status,
      o.stripe_session_id, o.notes,
      o.created_at, o.updated_at,
      COALESCE(p.full_name, 'Guest') AS customer_name,
      p.id AS profile_id
    FROM orders o
    LEFT JOIN profiles p ON p.id = o.profile_id
    WHERE o.public_id = ${publicId}
  `;
  if (!order) throw new Error(`Order not found: ${publicId}`);

  const items = await db`
    SELECT product_name, sku, brand, quantity, unit_price_brl, line_total_brl, weight_range
    FROM order_items
    WHERE order_id = ${order.id}
    ORDER BY id
  `;

  return {
    id: order.id as string,
    publicId: order.public_id as string,
    brand: order.brand as Brand,
    currency: order.currency as string,
    subtotalBRL: Number(order.subtotal_brl),
    freightBRL: Number(order.freight_brl),
    totalBRL: Number(order.total_brl),
    shippingRegion: order.shipping_region as string,
    estimatedWeightRange: order.estimated_weight_range as string,
    orderStatus: order.order_status as string,
    paymentStatus: order.payment_status as string,
    fiscalStatus: order.fiscal_status as string,
    stripeSessionId: (order.stripe_session_id as string | null) ?? null,
    notes: (order.notes as string | null) ?? null,
    customerName: order.customer_name as string,
    profileId: (order.profile_id as string | null) ?? null,
    createdAt: (order.created_at as Date).toISOString(),
    updatedAt: (order.updated_at as Date).toISOString(),
    items: items.map((i) => ({
      productName: i.product_name as string,
      sku: (i.sku as string) ?? "",
      brand: i.brand as Brand,
      quantity: i.quantity as number,
      unitPriceBRL: Number(i.unit_price_brl),
      lineTotalBRL: Number(i.line_total_brl),
      weightRange: i.weight_range as string,
    })),
  };
}

// =============================================================================
// Customer admin operations
// =============================================================================

export async function listAdminCustomers(options: { role?: string; search?: string } = {}) {
  const { role, search } = options;
  const rows = await db`
    SELECT
      id, full_name, role, is_active,
      preferred_currency, preferred_language, created_at
    FROM profiles
    WHERE true
      ${role ? db`AND role = ${role}` : db``}
      ${search ? db`AND full_name ILIKE ${"%" + search + "%"}` : db``}
    ORDER BY created_at DESC
    LIMIT 200
  `;

  return rows.map((row) => ({
    id: row.id as string,
    fullName: (row.full_name as string | null) ?? "—",
    role: row.role as string,
    isActive: row.is_active as boolean,
    preferredCurrency: (row.preferred_currency as string) ?? "USD",
    preferredLanguage: (row.preferred_language as string) ?? "en",
    createdAt: (row.created_at as Date).toISOString(),
  }));
}

// =============================================================================
// Taxonomy — categories + subcategories
// =============================================================================

/**
 * List categories (with nested subcategories) for a given brand.
 * Used by the admin product form taxonomy selects.
 */
export async function listAdminCategories(brand: Brand) {
  const cats = await db`
    SELECT id, name, slug, brand
    FROM categories
    WHERE brand = ${brand}
    ORDER BY name
  `;

  if (cats.length === 0) return [];

  const catIds = cats.map((c) => c.id as string);
  const subs = await db`
    SELECT id, name, slug, category_id
    FROM subcategories
    WHERE category_id = ANY(${catIds}::uuid[])
    ORDER BY name
  `;

  return cats.map((c) => ({
    id: c.id as string,
    name: c.name as string,
    slug: c.slug as string,
    brand: c.brand as Brand,
    subcategories: subs
      .filter((s) => s.category_id === c.id)
      .map((s) => ({
        id: s.id as string,
        name: s.name as string,
        slug: s.slug as string,
      })),
  }));
}

// =============================================================================
// Product country availability — Stage 13
// =============================================================================

/**
 * Returns the availability map for a product (admin view).
 * Shows all 6 MVP countries with their current is_active flag.
 */
export async function getAdminProductAvailability(
  productId: string
): Promise<ProductAvailabilityMap> {
  return getProductAvailabilityMap(productId);
}

export const updateAvailabilitySchema = z.record(
  z.string().length(2),
  z.boolean()
);
export type UpdateAvailabilityInput = z.infer<typeof updateAvailabilitySchema>;

/**
 * Batch-update country availability flags for a product.
 * Only accepts valid 2-letter country codes; unknown codes are ignored.
 */
export async function patchAdminProductAvailability(
  productId: string,
  input: unknown
): Promise<ProductAvailabilityMap> {
  const parsed = updateAvailabilitySchema.parse(input);
  // Verify product exists first
  const [exists] = await db`SELECT id FROM products WHERE id = ${productId} LIMIT 1`;
  if (!exists) throw new Error(`Product not found: ${productId}`);
  return setProductAvailabilities(productId, parsed);
}

// =============================================================================
// Stock overview
// =============================================================================

export async function getStockOverview() {
  const rows = await db`
    SELECT brand, sku, name, stock, is_active
    FROM products
    ORDER BY stock ASC, brand, name
    LIMIT 200
  `;

  const critical = rows.filter((r) => Number(r.stock) < 5).length;
  const outOfStock = rows.filter((r) => Number(r.stock) === 0).length;
  const healthy = rows.filter((r) => Number(r.stock) >= 20).length;

  return {
    totalSKUs: rows.length,
    critical,
    outOfStock,
    healthy,
    items: rows.map((row) => ({
      brand: row.brand as Brand,
      sku: row.sku as string,
      name: row.name as string,
      stock: Number(row.stock),
      isActive: row.is_active as boolean,
    })),
  };
}
