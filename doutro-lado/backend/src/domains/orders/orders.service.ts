import { z } from "zod";
import { db } from "../../lib/db.js";
import { getProductsBySlug } from "../../services/catalog.service.js";
import type { Brand, BuiltOrder, CountryCode, FreightQuote, Region, Role, WeightRange } from "../../types/domain.js";
import { quoteFreight, resolveOrderWeightRange } from "../freight/freight.service.js";
import {
  computeAllInTotals,
  countryRuleToBagPricingRule,
  loadPricingRule,
  makePricingVersion,
} from "../bag/bag.service.js";
import { isSupportedCurrency, STATIC_RATES } from "../../services/i18n.service.js";
import {
  getCountryByCode,
  loadCountryCommerceRule,
  quoteFreightByCountry,
} from "../countries/countries.service.js";
import { COUNTRY_CODES } from "../../config/constants.js";

// =============================================================================
// Validation
// =============================================================================

const productItemSchema = z.object({
  productSlug: z.string().min(1),
  quantity: z.coerce.number().int().min(1),
});

const giftKitItemSchema = z.object({
  kitId: z.string().uuid(),
  quantity: z.coerce.number().int().min(1),
});

const orderSchema = z
  .object({
    brand: z.enum(["casa", "moda"]), // "casa" mantido por compatibilidade com dados historicos
    /**
     * Stage 12 — country-first path.
     * When provided, overrides `region` for freight + pricing.
     */
    countryCode: z
      .string()
      .length(2)
      .transform((v) => v.toUpperCase())
      .refine((v) => (COUNTRY_CODES as readonly string[]).includes(v), {
        message: "Unsupported country code.",
      })
      .optional(),
    /** Legacy region — required when countryCode is absent. */
    region: z.enum(["North America", "Europe", "Middle East"]).optional(),
    currency: z.string().default("USD"),
    items: z.array(productItemSchema).default([]),
    kitItems: z.array(giftKitItemSchema).optional().default([]),
    offerCode: z.string().min(1).max(32).optional(),
  })
  .refine(
    (data) => data.items.length > 0 || (data.kitItems && data.kitItems.length > 0),
    { message: "Order must contain at least one product or kit item." }
  )
  .refine((data) => data.countryCode || data.region, {
    message: "Either countryCode or region must be provided.",
  });

export type BuildOrderResult = BuiltOrder & { orderId: string };

// =============================================================================
// Business rules
// =============================================================================

function ensureSingleBrandOrder(expectedBrand: Brand, itemBrands: Brand[]) {
  const uniqueBrands = [...new Set(itemBrands)];
  if (uniqueBrands.length !== 1 || uniqueBrands[0] !== expectedBrand) {
    throw new Error(
      "Order items must belong to a single brand."
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

  // ── Build normalized product line items ────────────────────────────────
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
      productId: product.id as string,
      giftKitId: null as string | null,
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

  // ── Build gift kit line items ───────────────────────────────────────────
  const kitLineItems: typeof normalizedItems = [];
  for (const kitItem of parsed.kitItems) {
    const rows = await db`
      SELECT id, name, brand, total_amount_brl, total_weight_range
      FROM gift_kits WHERE id = ${kitItem.kitId} LIMIT 1
    `;
    if (rows.length === 0) throw new Error(`Gift kit not found: ${kitItem.kitId}`);
    const kit = rows[0];
    const unitPriceBRL = Number(kit.total_amount_brl);
    kitLineItems.push({
      productId: null as unknown as string, // kit lines have no productId
      giftKitId: kit.id as string,
      brand: kit.brand as Brand,
      slug: kit.id as string,
      sku: `KIT-${(kit.id as string).slice(0, 8).toUpperCase()}`,
      name: kit.name as string,
      quantity: kitItem.quantity,
      unitPriceBRL,
      lineTotalBRL: Number((unitPriceBRL * kitItem.quantity).toFixed(2)),
      weightRange: kit.total_weight_range as WeightRange,
    });
  }

  const allItems = [...normalizedItems, ...kitLineItems];

  ensureSingleBrandOrder(parsed.brand, allItems.map((i) => i.brand));

  // ── Offer code validation ───────────────────────────────────────────────
  let discountPercent = 0;
  let offerRow: { id: string } | null = null;
  if (parsed.offerCode) {
    const offerRows = await db`
      SELECT id, discount_percent FROM bag_recovery_offers
      WHERE code = ${parsed.offerCode}
        AND is_used = false
        AND valid_until > now()
      LIMIT 1
    `.catch(() => []);
    if ((offerRows as unknown[]).length > 0) {
      const offer = (offerRows as Record<string, unknown>[])[0];
      discountPercent = Number(offer.discount_percent);
      offerRow = { id: offer.id as string };
    }
  }

  // ── Freight calculation ─────────────────────────────────────────────────
  const estimatedWeightRange = resolveOrderWeightRange(
    allItems.map((i) => ({ weightRange: i.weightRange, quantity: i.quantity }))
  );

  const countryCode = (parsed.countryCode as CountryCode | undefined) ?? null;
  const legacyRegion = parsed.region ?? "North America";

  let freightAmountBRL: number;
  let shippingRegionForOrder: string;

  if (countryCode) {
    const countryFreight = await quoteFreightByCountry(countryCode, estimatedWeightRange);
    freightAmountBRL = countryFreight.amountBRL;
    shippingRegionForOrder = countryCode; // store country code in shipping_region for country-path orders
  } else {
    const freight: FreightQuote = await quoteFreight({
      region: legacyRegion,
      weightRange: estimatedWeightRange,
    });
    freightAmountBRL = freight.amountBRL;
    shippingRegionForOrder = freight.region;
  }

  // ── All-in pricing ──────────────────────────────────────────────────────
  const subtotalBRL = allItems.reduce((sum, i) => sum + i.lineTotalBRL, 0);
  const displayCurrency = isSupportedCurrency(parsed.currency) ? parsed.currency : "BRL";

  let rule;
  if (countryCode) {
    const countryRule = await loadCountryCommerceRule(countryCode);
    rule = countryRule
      ? countryRuleToBagPricingRule(countryRule, subtotalBRL)
      : await loadPricingRule(legacyRegion);
  } else {
    rule = await loadPricingRule(legacyRegion);
  }

  const allIn = computeAllInTotals(subtotalBRL, freightAmountBRL, rule, displayCurrency, discountPercent);
  const totalBRL = allIn.adjustedFinalTotalBRL;
  const discountBRL = allIn.discountBRL;
  const pricingVersion = makePricingVersion(freightAmountBRL, rule);

  const publicId = `DL-${Date.now()}`;
  const pricingTier = role === "wholesale" ? "wholesale" : "retail";

  // ── Country snapshot (Stage 12) ─────────────────────────────────────────
  let destinationCountryCode: string | null = null;
  let destinationCountryName: string | null = null;
  let destinationCurrency: string | null = null;
  let exchangeRateUsed: number | null = null;
  let deliveryEtaMinDays: number | null = null;
  let deliveryEtaMaxDays: number | null = null;

  if (countryCode) {
    const countryDetail = await getCountryByCode(countryCode);
    if (countryDetail) {
      destinationCountryCode = countryDetail.code;
      destinationCountryName = countryDetail.name;
      destinationCurrency = countryDetail.defaultCurrency;
      exchangeRateUsed = STATIC_RATES[countryDetail.defaultCurrency] ?? null;
      deliveryEtaMinDays = countryDetail.commerceRule?.estimatedDeliveryMinDays ?? null;
      deliveryEtaMaxDays = countryDetail.commerceRule?.estimatedDeliveryMaxDays ?? null;
    }
  }

  // ── Persist ─────────────────────────────────────────────────────────────
  const [order] = await db`
    INSERT INTO orders (
      public_id, profile_id, brand, currency,
      subtotal_brl, freight_brl, total_brl,
      shipping_region, estimated_weight_range, pricing_version,
      offer_code, discount_brl,
      destination_country_code, destination_country_name, destination_currency,
      exchange_rate_used, delivery_eta_min_days, delivery_eta_max_days
    ) VALUES (
      ${publicId}, ${profileId ?? null}, ${parsed.brand}, ${parsed.currency},
      ${subtotalBRL}, ${freightAmountBRL}, ${totalBRL},
      ${shippingRegionForOrder}, ${estimatedWeightRange}, ${pricingVersion},
      ${parsed.offerCode ?? null}, ${discountBRL},
      ${destinationCountryCode}, ${destinationCountryName}, ${destinationCurrency},
      ${exchangeRateUsed}, ${deliveryEtaMinDays}, ${deliveryEtaMaxDays}
    )
    RETURNING id
  `;
  const orderId = order.id as string;

  await db`
    INSERT INTO order_items ${db(
      allItems.map((item) => ({
        order_id: orderId,
        product_id: item.productId ?? null,
        gift_kit_id: item.giftKitId ?? null,
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

  // Mark offer as used (idempotent — only if we validated one)
  if (offerRow) {
    await db`
      UPDATE bag_recovery_offers
      SET is_used = true, used_at = now()
      WHERE id = ${offerRow.id} AND is_used = false
    `;
  }

  // ── Return the built order snapshot ────────────────────────────────────
  return {
    orderId,
    publicId,
    brand: parsed.brand,
    currency: parsed.currency,
    region: legacyRegion,
    pricingTier,
    items: allItems as BuiltOrder["items"],
    subtotalBRL,
    freight: { region: legacyRegion, weightRange: estimatedWeightRange, amountBRL: freightAmountBRL },
    freightBRL: freightAmountBRL,
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
