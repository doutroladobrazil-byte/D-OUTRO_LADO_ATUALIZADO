import { z } from "zod";
import { db } from "../../lib/db.js";
import { getProductsBySlug } from "../../services/catalog.service.js";
import type { Brand, BuiltOrder, FreightQuote, Role } from "../../types/domain.js";
import { quoteFreight, resolveOrderWeightRange } from "../freight/freight.service.js";
import { computeAllInTotals, loadPricingRule, makePricingVersion } from "../bag/bag.service.js";
import { isSupportedCurrency } from "../../services/i18n.service.js";

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

export type BuildOrderResult = BuiltOrder & { orderId: string };

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
export async function buildOrder(payload: unknown, role: Role = "customer", profileId?: string): Promise<BuildOrderResult> {
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

  // ── All-in pricing ──────────────────────────────────────────────────────
  const subtotalBRL = normalizedItems.reduce((sum, i) => sum + i.lineTotalBRL, 0);
  const displayCurrency = isSupportedCurrency(parsed.currency) ? parsed.currency : "BRL";
  const rule = await loadPricingRule(parsed.region);
  const allIn = computeAllInTotals(subtotalBRL, freight.amountBRL, rule, displayCurrency);
  const totalBRL = allIn.finalTotalBRL;
  const pricingVersion = makePricingVersion(freight.amountBRL, rule);

  const publicId = `DL-${Date.now()}`;
  const pricingTier = role === "wholesale" ? "wholesale" : "retail";

  // ── Persist ─────────────────────────────────────────────────────────────
  const [order] = await db`
    INSERT INTO orders (
      public_id, profile_id, brand, currency,
      subtotal_brl, freight_brl, total_brl,
      shipping_region, estimated_weight_range, pricing_version
    ) VALUES (
      ${publicId}, ${profileId ?? null}, ${parsed.brand}, ${parsed.currency},
      ${subtotalBRL}, ${freight.amountBRL}, ${totalBRL},
      ${freight.region}, ${freight.weightRange}, ${pricingVersion}
    )
    RETURNING id
  `;
  const orderId = order.id as string;

  await db`
    INSERT INTO order_items ${db(
      normalizedItems.map((item) => ({
        order_id: orderId,
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
    orderId,
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

// =============================================================================
// Payment record helpers
// =============================================================================

/**
 * Persist a payment_records row and update the order's stripe_session_id.
 * Called after Stripe session creation.
 */
export async function attachStripeSession(orderId: string, stripeSessionId: string): Promise<void> {
  await db`
    UPDATE orders SET stripe_session_id = ${stripeSessionId}, updated_at = now()
    WHERE id = ${orderId}
  `;
  await db`
    INSERT INTO payment_records (order_id, provider, provider_payment_id, status, amount_brl)
    SELECT id, 'stripe', ${stripeSessionId}, 'pending', total_brl
    FROM orders WHERE id = ${orderId}
  `;
}

/**
 * Deduct stock for all items in an order.
 * Called only once per order (idempotent via stock_deducted_at).
 *
 * The UPDATE on stock_deducted_at uses WHERE stock_deducted_at IS NULL so that
 * concurrent webhook replays cannot claim the deduction twice. Only the first
 * call that wins the atomic UPDATE actually proceeds to decrement product stock.
 */
export async function deductStockForOrder(orderId: string): Promise<void> {
  // Atomically claim the right to deduct stock.
  // If another concurrent call already claimed it, this returns no rows.
  const [claimed] = await db`
    UPDATE orders
    SET stock_deducted_at = now()
    WHERE id = ${orderId}
      AND stock_deducted_at IS NULL
    RETURNING id
  `;
  if (!claimed) return; // already deducted — idempotency guard

  // Decrement product stock by the ordered quantity.
  // GREATEST(0, ...) prevents negative stock in edge cases.
  await db`
    UPDATE products p
    SET stock      = GREATEST(0, p.stock - oi.quantity),
        updated_at = now()
    FROM order_items oi
    WHERE oi.order_id = ${orderId}
      AND p.id        = oi.product_id
  `;
}

/**
 * Update payment status on both orders and payment_records.
 * Called by the webhook — idempotent (upserts on conflict).
 */
export async function updatePaymentStatus(
  stripeSessionId: string,
  status: "paid" | "failed" | "refunded",
  stripePaymentIntentId?: string
): Promise<void> {
  const newOrderStatus = status === "paid" ? "processing" : "created";

  await db`
    UPDATE orders SET
      payment_status = ${status},
      order_status = ${newOrderStatus},
      updated_at = now()
    WHERE stripe_session_id = ${stripeSessionId}
  `;

  await db`
    UPDATE payment_records SET
      status = ${status},
      provider_payment_id = COALESCE(${stripePaymentIntentId ?? null}, provider_payment_id)
    WHERE provider_payment_id = ${stripeSessionId}
  `;
}
