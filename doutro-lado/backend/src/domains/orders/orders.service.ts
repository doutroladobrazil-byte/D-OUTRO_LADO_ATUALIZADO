import { z } from "zod";
import { db } from "../../lib/db.js";
import { logSystemEvent } from "../admin/system-log.service.js";
import { getProductsBySlug } from "../../services/catalog.service.js";
import type { Brand, BuiltOrder, CountryCode, FreightQuote, OperationalRegion, Region, Role, WeightRange } from "../../types/domain.js";
import { quoteFreight, resolveOrderWeightRange } from "../freight/freight.service.js";
import {
  computeAllInTotals,
  countryRuleToBagPricingRule,
  loadPricingRule,
  makePricingVersion,
  makeCountryPricingVersion,
} from "../bag/bag.service.js";
import { isSupportedCurrency, STATIC_RATES } from "../../services/i18n.service.js";
import {
  getCountryByCode,
  quoteFreightByCountry,
  type CountryDetail,
} from "../countries/countries.service.js";
import { getUnavailableProductIds } from "../countries/availability.service.js";
import { COUNTRY_CODES } from "../../config/constants.js";
import { checkoutAddressSchema, type CheckoutAddress } from "../checkout/checkout-address.schema.js";

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
    /**
     * Stage 14 — buyer contact + shipping address.
     * Required for guest orders (profile_id = null).
     * Optional for authenticated orders — when provided, data is always snapshotted.
     */
    contact: checkoutAddressSchema.optional(),
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

  // ── Block kit items in country-first path (Stage 13) ──────────────────
  // Kit component products are not individually validated against
  // product_country_availability. Reject explicitly to prevent silent bypass.
  if (parsed.countryCode && kitLineItems.length > 0) {
    throw new Error(
      "Gift kits are not available for international shipping. Please add products individually."
    );
  }

  const allItems = [...normalizedItems, ...kitLineItems];

  ensureSingleBrandOrder(parsed.brand, allItems.map((i) => i.brand));

  // ── Product country availability (Stage 13) ─────────────────────────────
  // Validated here (before country resolution) so we reject unavailable items
  // even before loading country commerce rules. The countryCode from the parsed
  // payload is used — kit items are not individually checked (see availability.service).
  const earlyCountryCode = parsed.countryCode as string | undefined;
  if (earlyCountryCode) {
    const productIds = normalizedItems.map((i) => i.productId).filter(Boolean) as string[];
    if (productIds.length > 0) {
      const unavailableIds = await getUnavailableProductIds(productIds, earlyCountryCode);
      if (unavailableIds.size > 0) {
        const unavailableNames = normalizedItems
          .filter((i) => unavailableIds.has(i.productId))
          .map((i) => i.name);
        throw new Error(
          `The following products are not available for the selected destination: ${unavailableNames.join(", ")}`
        );
      }
    }
  }

  const countryCode = (parsed.countryCode as CountryCode | undefined) ?? null;
  const legacyRegion = parsed.region ?? "North America";

  // ── Country resolution (country-first path — loaded ONCE, reused throughout) ──
  // Doing this early so allowGuestCheckout and allowDiscountCodes can gate
  // subsequent steps before any further DB work is done.
  let countryDetail: CountryDetail | null = null;
  let discountCodesAllowed = true;

  if (countryCode) {
    countryDetail = await getCountryByCode(countryCode);
    if (!countryDetail || !countryDetail.isActive || !countryDetail.checkoutEnabled) {
      throw new Error(`Country "${countryCode}" is not available for checkout.`);
    }

    const cr = countryDetail.commerceRule;

    // BLOCO 4 — allowGuestCheckout enforcement
    if (!profileId && cr && !cr.allowGuestCheckout) {
      throw new Error(
        "Guest checkout is not available for this destination. Please sign in to continue."
      );
    }

    // BLOCO 5 — allowDiscountCodes flag (gates offer lookup below)
    discountCodesAllowed = !cr || cr.allowDiscountCodes;
  }

  // Stage 14 — contact/address validation.
  // Guest orders require contact (it's the only identity we have).
  // Authenticated orders: contact is optional but always snapshotted when provided.
  let resolvedContact: CheckoutAddress | null = null;
  if (parsed.contact) {
    // Validate and coerce — checkoutAddressSchema is applied via Zod above, but
    // we parse it again here to get the typed value reliably.
    const contactResult = checkoutAddressSchema.safeParse(parsed.contact);
    if (!contactResult.success) {
      throw new Error(`Invalid shipping address: ${contactResult.error.issues[0]?.message ?? "validation failed"}`);
    }
    resolvedContact = contactResult.data;
    // Country consistency: address.countryCode must match order.countryCode.
    if (parsed.countryCode && resolvedContact.countryCode !== parsed.countryCode) {
      throw new Error(
        `Shipping address country (${resolvedContact.countryCode}) does not match the selected destination (${parsed.countryCode}).`
      );
    }
  } else if (!profileId) {
    // Guest with no contact — only blocked if we're on the country-first path.
    // Legacy region path (authenticated-only) does not require contact.
    if (parsed.countryCode) {
      throw new Error("Contact and shipping address are required for guest checkout.");
    }
  }

  // ── Offer code validation ───────────────────────────────────────────────
  // BLOCO 5: offerCode is only looked up if the country (or legacy path) allows it.
  let discountPercent = 0;
  let offerRow: { id: string } | null = null;
  if (parsed.offerCode && discountCodesAllowed) {
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

  let freightAmountBRL: number;
  let shippingRegionForOrder: string;

  if (countryCode && countryDetail) {
    const countryFreight = await quoteFreightByCountry(countryCode, estimatedWeightRange);
    freightAmountBRL = countryFreight.amountBRL;
    // BLOCO 1: store the operational region group, not the country code.
    // shipping_region is a legacy field for regional groupings ("Europe",
    // "North America", "Asia Pacific"). Country identity lives in the
    // destination_country_* columns added in Stage 12.
    shippingRegionForOrder = countryDetail.regionGroup;
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

  const countryRule = countryDetail?.commerceRule ?? null;
  let rule;
  if (countryCode && countryRule) {
    rule = countryRuleToBagPricingRule(countryRule, subtotalBRL);
  } else {
    rule = await loadPricingRule(legacyRegion);
  }

  const allIn = computeAllInTotals(subtotalBRL, freightAmountBRL, rule, displayCurrency, discountPercent);
  const totalBRL = allIn.adjustedFinalTotalBRL;
  const discountBRL = allIn.discountBRL;

  // BLOCO 2: country-first orders get a semantically correct pricingVersion that
  // identifies the country and uses taxPercent (the configured rate) not taxBRL
  // (a derived value that varies with subtotal and would be meaningless without context).
  const pricingVersion = countryCode && countryRule
    ? makeCountryPricingVersion(countryCode, freightAmountBRL, countryRule)
    : makePricingVersion(freightAmountBRL, rule);

  const publicId = `DL-${Date.now()}`;
  const pricingTier = role === "wholesale" ? "wholesale" : "retail";

  // ── Country snapshot (Stage 12) ─────────────────────────────────────────
  let destinationCountryCode: string | null = null;
  let destinationCountryName: string | null = null;
  let destinationCurrency: string | null = null;
  let exchangeRateUsed: number | null = null;
  let deliveryEtaMinDays: number | null = null;
  let deliveryEtaMaxDays: number | null = null;

  if (countryCode && countryDetail) {
    destinationCountryCode = countryDetail.code;
    destinationCountryName = countryDetail.name;
    // BLOCO 3: persist the currency and exchange rate ACTUALLY used in the
    // calculation, not the country's default. If the customer selected USD
    // for a Swiss order, displayCurrency is USD and that is what was applied.
    destinationCurrency = displayCurrency;
    exchangeRateUsed = STATIC_RATES[displayCurrency] ?? 1;
    deliveryEtaMinDays = countryRule?.estimatedDeliveryMinDays ?? null;
    deliveryEtaMaxDays = countryRule?.estimatedDeliveryMaxDays ?? null;
  }

  // ── Persist ─────────────────────────────────────────────────────────────
  const [order] = await db`
    INSERT INTO orders (
      public_id, profile_id, brand, currency,
      subtotal_brl, freight_brl, total_brl,
      shipping_region, estimated_weight_range, pricing_version,
      offer_code, discount_brl,
      destination_country_code, destination_country_name, destination_currency,
      exchange_rate_used, delivery_eta_min_days, delivery_eta_max_days,
      customer_name_snapshot, customer_email_snapshot, customer_phone_snapshot,
      shipping_line1_snapshot, shipping_line2_snapshot, shipping_city_snapshot,
      shipping_state_region_snapshot, shipping_postal_code_snapshot
    ) VALUES (
      ${publicId}, ${profileId ?? null}, ${parsed.brand}, ${parsed.currency},
      ${subtotalBRL}, ${freightAmountBRL}, ${totalBRL},
      ${shippingRegionForOrder}, ${estimatedWeightRange}, ${pricingVersion},
      ${parsed.offerCode ?? null}, ${discountBRL},
      ${destinationCountryCode}, ${destinationCountryName}, ${destinationCurrency},
      ${exchangeRateUsed}, ${deliveryEtaMinDays}, ${deliveryEtaMaxDays},
      ${resolvedContact?.fullName ?? null}, ${resolvedContact?.email ?? null}, ${resolvedContact?.phone ?? null},
      ${resolvedContact?.line1 ?? null}, ${resolvedContact?.line2 ?? null}, ${resolvedContact?.city ?? null},
      ${resolvedContact?.stateRegion ?? null}, ${resolvedContact?.postalCode ?? null}
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
  // BLOCO A1: use shippingRegionForOrder (already set to countryDetail.regionGroup
  // for country-first orders, or freight.region for legacy orders). This keeps
  // the in-memory return consistent with what was persisted to the DB.
  const operationalRegion = shippingRegionForOrder as OperationalRegion;

  return {
    orderId,
    publicId,
    brand: parsed.brand,
    currency: parsed.currency,
    region: operationalRegion,
    pricingTier,
    items: allItems as BuiltOrder["items"],
    subtotalBRL,
    freight: { region: operationalRegion, weightRange: estimatedWeightRange, amountBRL: freightAmountBRL },
    freightBRL: freightAmountBRL,
    totalBRL,
    estimatedWeightRange,
    paymentStatus: "pending",
    orderStatus: "created",
    fiscalStatus: "pending",
  };
}

// =============================================================================
// Orders by profile — for Minha Conta / Stage 14
// =============================================================================

/**
 * Fetch the most recent 20 orders for an authenticated user.
 * Returns enough for the account page list — no pagination needed at MVP scale.
 */
export async function getOrdersByProfile(profileId: string) {
  const rows = await db`
    SELECT
      public_id, brand, currency,
      subtotal_brl, freight_brl, total_brl,
      order_status, payment_status,
      destination_country_code, destination_country_name,
      customer_name_snapshot,
      created_at
    FROM orders
    WHERE profile_id = ${profileId}
    ORDER BY created_at DESC
    LIMIT 20
  `;
  return rows.map((r) => ({
    publicId: r.public_id as string,
    brand: r.brand as Brand,
    currency: r.currency as string,
    subtotalBRL: Number(r.subtotal_brl),
    freightBRL: Number(r.freight_brl),
    totalBRL: Number(r.total_brl),
    orderStatus: r.order_status as string,
    paymentStatus: r.payment_status as string,
    destinationCountryCode: (r.destination_country_code as string | null) ?? null,
    destinationCountryName: (r.destination_country_name as string | null) ?? null,
    customerNameSnapshot: (r.customer_name_snapshot as string | null) ?? null,
    createdAt: (r.created_at as Date).toISOString(),
  }));
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

  // Stage 15: Audit log for stock deduction
  await logSystemEvent("stock_decremented", "order", orderId, {
    deductedAt: new Date().toISOString(),
  });
}

/**
 * Update payment status on both orders and payment_records.
 * Called by the webhook — idempotent (upserts on conflict).
 *
 * Order status transitions:
 *   paid     → processing
 *   failed   → cancelled  (checkout expired — no payment received)
 *   refunded → unchanged  (was already processing, just mark refunded on payment)
 */
export async function updatePaymentStatus(
  stripeSessionId: string,
  status: "paid" | "failed" | "refunded",
  stripePaymentIntentId?: string
): Promise<void> {
  if (status === "paid") {
    await db`
      UPDATE orders SET
        payment_status = 'paid',
        order_status = 'processing',
        updated_at = now()
      WHERE stripe_session_id = ${stripeSessionId}
    `;
  } else if (status === "failed") {
    await db`
      UPDATE orders SET
        payment_status = 'failed',
        order_status = 'cancelled',
        updated_at = now()
      WHERE stripe_session_id = ${stripeSessionId}
    `;
  } else {
    // refunded — only update payment_status, leave order_status unchanged
    await db`
      UPDATE orders SET
        payment_status = 'refunded',
        updated_at = now()
      WHERE stripe_session_id = ${stripeSessionId}
    `;
  }

  await db`
    UPDATE payment_records SET
      status = ${status},
      provider_payment_id = COALESCE(${stripePaymentIntentId ?? null}, provider_payment_id)
    WHERE provider_payment_id = ${stripeSessionId}
  `;
}

/**
 * Transitions an order to 'awaiting_payment' once the Stripe session is created.
 * Only transitions from 'created' to avoid clobbering a terminal state.
 */
export async function markOrderAwaitingPayment(orderId: string): Promise<void> {
  await db`
    UPDATE orders
    SET order_status = 'awaiting_payment', updated_at = now()
    WHERE id = ${orderId}
      AND order_status = 'created'
  `;
}

/**
 * Cancels an order that failed before payment was initiated.
 * Idempotent — only acts on non-terminal orders (not processing/shipped/delivered/cancelled).
 */
export async function cancelOrderAtCheckout(orderId: string, reason?: string): Promise<void> {
  await db`
    UPDATE orders
    SET order_status = 'cancelled',
        payment_status = 'failed',
        notes = COALESCE(notes || E'\n', '') || ${`[checkout_cancel] ${reason ?? "checkout initiation failed"}`},
        updated_at = now()
    WHERE id = ${orderId}
      AND order_status NOT IN ('processing', 'packing', 'shipped', 'delivered', 'cancelled')
  `;
  await logSystemEvent("checkout_cancelled", "order", orderId, { reason });
}
