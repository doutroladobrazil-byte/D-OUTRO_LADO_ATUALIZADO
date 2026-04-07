import { z } from "zod";
import { db } from "../../lib/db.js";
import { getProductsBySlug } from "../../services/catalog.service.js";
import type { Brand, BuiltOrder, FreightQuote, Role } from "../../types/domain.js";
import { quoteFreight, resolveOrderWeightRange } from "../freight/freight.service.js";

// =============================================================================
// Validation
// =============================================================================

const itemSchema = z.object({
  productSlug: z.string().min(1),
  quantity: z.coerce.number().int().min(1),
});

const orderSchema = z.object({
  brand: z.enum(["casa", "moda"]),
  region: z.enum(["North America", "Europe", "Middle East"]),
  currency: z.string().default("USD"),
  items: z.array(itemSchema).min(1),
});

// =============================================================================
// Business rules
// =============================================================================

function ensureSingleBrandOrder(expectedBrand: Brand, itemBrands: Brand[]) {
  const uniqueBrands = [...new Set(itemBrands)];
  if (uniqueBrands.length !== 1 || uniqueBrands[0] !== expectedBrand) {
    throw new Error(
      "Order items must belong to a single site brand. Casa and Moda cannot be mixed."
    );
  }
}

// =============================================================================
// buildOrder — core commerce transaction
// =============================================================================

/**
 * Validates, prices, quotes freight and persists a new order.
 *
 * Freight rules (Stage 3):
 *  - Weight range is determined from the order items using upper-bound estimation.
 *  - Freight amount is a deterministic lookup (region × weight range).
 *  - No per-item surcharges. One rate per order.
 *  - The freight snapshot (region, weightRange, amountBRL) is stored in the order row.
 */
export async function buildOrder(payload: unknown, role: Role = "customer"): Promise<BuiltOrder> {
  const parsed = orderSchema.parse(payload);

  const slugs = parsed.items.map((i) => i.productSlug);
  const products = await getProductsBySlug(slugs);

  // ── Build normalized line items ─────────────────────────────────────────
  const normalizedItems = parsed.items.map((item) => {
    const product = products.find((p) => p.slug === item.productSlug);
    if (!product) throw new Error(`Product not found: ${item.productSlug}`);
    if (item.quantity > product.stock) {
      throw new Error(
        `Insufficient stock for ${product.slug}. Available: ${product.stock}`
      );
    }

    const useWholesale = role === "wholesale" && item.quantity >= product.wholesaleMinQty;
    const unitPriceBRL = useWholesale ? product.wholesalePriceBRL : product.retailPriceBRL;

    return {
      productId: product.id,
      brand: product.brand,
      slug: product.slug,
      sku: product.sku,
      name: product.name,
      quantity: item.quantity,
      unitPriceBRL,
      lineTotalBRL: Number((unitPriceBRL * item.quantity).toFixed(2)),
      weightRange: product.weightRange,
    };
  });

  ensureSingleBrandOrder(parsed.brand, normalizedItems.map((i) => i.brand));

  // ── Freight calculation ─────────────────────────────────────────────────
  const estimatedWeightRange = resolveOrderWeightRange(
    normalizedItems.map((i) => ({ weightRange: i.weightRange, quantity: i.quantity }))
  );

  const freight: FreightQuote = await quoteFreight({
    region: parsed.region,
    weightRange: estimatedWeightRange,
  });

  // ── Totals ──────────────────────────────────────────────────────────────
  const subtotalBRL = normalizedItems.reduce((sum, i) => sum + i.lineTotalBRL, 0);
  const totalBRL = Number((subtotalBRL + freight.amountBRL).toFixed(2));
  const publicId = `DL-${Date.now()}`;
  const pricingTier = role === "wholesale" ? "wholesale" : "retail";

  // ── Persist ─────────────────────────────────────────────────────────────
  const [order] = await db`
    INSERT INTO orders (
      public_id, brand, currency,
      subtotal_brl, freight_brl, total_brl,
      shipping_region, estimated_weight_range
    ) VALUES (
      ${publicId}, ${parsed.brand}, ${parsed.currency},
      ${subtotalBRL}, ${freight.amountBRL}, ${totalBRL},
      ${freight.region}, ${freight.weightRange}
    )
    RETURNING id
  `;

  await db`
    INSERT INTO order_items ${db(
      normalizedItems.map((item) => ({
        order_id: order.id as string,
        product_id: item.productId,
        brand: item.brand,
        product_name: item.name,
        sku: item.sku,
        quantity: item.quantity,
        unit_price_brl: item.unitPriceBRL,
        weight_range: item.weightRange,
        line_total_brl: item.lineTotalBRL,
      }))
    )}
  `;

  // ── Return the built order snapshot ────────────────────────────────────
  return {
    publicId,
    brand: parsed.brand,
    currency: parsed.currency,
    region: parsed.region,
    pricingTier,
    items: normalizedItems,
    subtotalBRL,
    freight,
    freightBRL: freight.amountBRL,
    totalBRL,
    estimatedWeightRange,
    paymentStatus: "pending",
    orderStatus: "created",
    fiscalStatus: "pending",
  };
}
