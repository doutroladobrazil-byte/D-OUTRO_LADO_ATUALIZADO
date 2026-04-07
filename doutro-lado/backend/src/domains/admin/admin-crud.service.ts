import { z } from "zod";
import { db } from "../../lib/db.js";
import type { Brand } from "../../types/domain.js";
import { WEIGHT_RANGES } from "../../config/constants.js";
import type { WeightRange } from "../../types/domain.js";

// =============================================================================
// Input schemas
// =============================================================================

export const patchProductSchema = z.object({
  name: z.string().min(1).max(255).optional(),
  shortDescription: z.string().max(500).optional(),
  longDescription: z.string().optional(),
  retailPriceBRL: z.coerce.number().positive().optional(),
  wholesalePriceBRL: z.coerce.number().positive().optional(),
  wholesaleMinQty: z.coerce.number().int().min(1).optional(),
  stock: z.coerce.number().int().min(0).optional(),
  weightRange: z.enum(WEIGHT_RANGES as [WeightRange, ...WeightRange[]]).optional(),
  weightGrams: z.coerce.number().int().min(1).optional(),
  badge: z.string().max(64).nullable().optional(),
  isFeatured: z.boolean().optional(),
  isActive: z.boolean().optional(),
  collection: z.string().max(128).nullable().optional(),
  tags: z.array(z.string()).optional(),
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
    wholesalePriceBRL: Number(row.wholesale_price_brl),
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
 * Patch a product — price, stock, status, etc.
 * Returns the updated product row.
 */
export async function patchAdminProduct(productId: string, input: PatchProductInput) {
  const parsed = patchProductSchema.parse(input);

  // Build dynamic SET clause — only include fields that were provided
  const updates: Record<string, unknown> = {};
  if (parsed.name !== undefined) updates.name = parsed.name;
  if (parsed.shortDescription !== undefined) updates.short_description = parsed.shortDescription;
  if (parsed.longDescription !== undefined) updates.long_description = parsed.longDescription;
  if (parsed.retailPriceBRL !== undefined) updates.retail_price_brl = parsed.retailPriceBRL;
  if (parsed.wholesalePriceBRL !== undefined) updates.wholesale_price_brl = parsed.wholesalePriceBRL;
  if (parsed.wholesaleMinQty !== undefined) updates.wholesale_min_qty = parsed.wholesaleMinQty;
  if (parsed.stock !== undefined) updates.stock = parsed.stock;
  if (parsed.weightRange !== undefined) updates.weight_range = parsed.weightRange;
  if (parsed.weightGrams !== undefined) updates.weight_grams = parsed.weightGrams;
  if (parsed.badge !== undefined) updates.badge = parsed.badge;
  if (parsed.isFeatured !== undefined) updates.is_featured = parsed.isFeatured;
  if (parsed.isActive !== undefined) updates.is_active = parsed.isActive;
  if (parsed.collection !== undefined) updates.collection = parsed.collection;
  if (parsed.tags !== undefined) updates.tags = parsed.tags;

  if (Object.keys(updates).length === 0) {
    throw new Error("No fields provided to update");
  }

  updates.updated_at = new Date();

  const [row] = await db`
    UPDATE products SET ${db(updates)}
    WHERE id = ${productId}
    RETURNING id, brand, name, slug, sku, stock, retail_price_brl, wholesale_price_brl,
              is_featured, is_active, badge, updated_at
  `;
  if (!row) throw new Error(`Product not found: ${productId}`);
  return row;
}

// =============================================================================
// Order admin operations
// =============================================================================

/**
 * Update order workflow status (order_status, payment_status, fiscal_status).
 */
export async function patchAdminOrder(orderId: string, input: PatchOrderStatusInput) {
  const parsed = patchOrderStatusSchema.parse(input);

  const updates: Record<string, unknown> = {};
  if (parsed.orderStatus !== undefined) updates.order_status = parsed.orderStatus;
  if (parsed.paymentStatus !== undefined) updates.payment_status = parsed.paymentStatus;
  if (parsed.fiscalStatus !== undefined) updates.fiscal_status = parsed.fiscalStatus;
  if (parsed.notes !== undefined) updates.notes = parsed.notes;

  if (Object.keys(updates).length === 0) throw new Error("No fields to update");
  updates.updated_at = new Date();

  // Orders are looked up by public_id for admin operations
  const [row] = await db`
    UPDATE orders SET ${db(updates)}
    WHERE public_id = ${orderId}
    RETURNING id, public_id, brand, order_status, payment_status, fiscal_status, updated_at
  `;
  if (!row) throw new Error(`Order not found: ${orderId}`);
  return row;
}

/**
 * Get full order detail for admin view.
 */
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

/**
 * List all customer profiles for admin management.
 */
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
// Stock overview
// =============================================================================

export async function getStockOverview() {
  const rows = await db`
    SELECT
      brand, sku, name, stock,
      is_active
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
