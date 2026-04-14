import { createHash } from "node:crypto";
import { z } from "zod";
import { db } from "../../lib/db.js";
import { getProductsBySlug } from "../../services/catalog.service.js";
import { quoteFreight, resolveOrderWeightRange } from "../freight/freight.service.js";
import { STATIC_RATES } from "../../services/i18n.service.js";
import { COUNTRY_CODES, REGIONS } from "../../config/constants.js";
import type { CountryCode, Region, SupportedCurrency, WeightRange } from "../../types/domain.js";
import {
  loadCountryCommerceRule,
  quoteFreightByCountry,
} from "../countries/countries.service.js";
import type {
  AppliedOffer,
  BagPricingRule,
  BagSimulateRequest,
  BagSimulationResult,
  BagSimulatedItem,
  BagSimulatedKitItem,
  BagTotals,
  CountryPricingRule,
} from "./bag.types.js";

// =============================================================================
// Request validation schema
// =============================================================================

export const simulateRequestSchema = z
  .object({
    /**
     * Stage 12 — country-first path.
     * When provided, overrides `region` for freight + pricing lookups.
     * Must be an ISO 3166-1 alpha-2 code for one of the 6 MVP countries.
     */
    countryCode: z
      .string()
      .length(2)
      .transform((v) => v.toUpperCase())
      .refine((v) => (COUNTRY_CODES as readonly string[]).includes(v), {
        message: "Unsupported country code.",
      })
      .optional(),
    /**
     * Legacy region-based path (Stage 3–11).
     * Required when countryCode is absent; optional when countryCode is provided.
     */
    region: z.enum(REGIONS as [Region, ...Region[]]).optional(),
    currency: z.enum(["BRL", "USD", "EUR", "AED", "CHF", "SGD"] as const).default("BRL"),
    items: z
      .array(
        z.discriminatedUnion("type", [
          z.object({
            type: z.literal("product"),
            productSlug: z.string().min(1).max(200),
            quantity: z.coerce.number().int().min(1).max(99),
          }),
          z.object({
            type: z.literal("gift_kit"),
            kitId: z.string().uuid(),
            quantity: z.coerce.number().int().min(1).max(10),
          }),
        ])
      )
      .min(1),
    offerCode: z.string().min(1).max(32).optional(),
  })
  .refine((d) => d.countryCode || d.region, {
    message: "Either countryCode or region must be provided.",
  });

// =============================================================================
// Country-first adapter — Stage 12
// =============================================================================

/**
 * Convert a CountryPricingRule (percent-based tax) to a BagPricingRule
 * (flat BRL tax) so that computeAllInTotals can be reused unchanged.
 *
 * tax flat = subtotalBRL * taxPercent / 100
 * All other fields map 1-to-1.
 */
export function countryRuleToBagPricingRule(
  rule: CountryPricingRule,
  subtotalBRL: number
): BagPricingRule {
  return {
    // region is omitted — country-first rules have no legacy Region mapping.
    taxBRL: Number((subtotalBRL * rule.taxPercent / 100).toFixed(2)),
    logisticsBRL: rule.logisticsBRL,
    marginPercent: rule.marginPercent,
    isActive: rule.isActive,
  };
}

// =============================================================================
// Pricing rule — loaded from bag_pricing_rules (defaults to zeros if missing)
// =============================================================================

export async function loadPricingRule(region: Region): Promise<BagPricingRule> {
  try {
    const rows = await db`
      SELECT tax_brl, logistics_brl, margin_percent
      FROM bag_pricing_rules
      WHERE region = ${region} AND is_active = true
      LIMIT 1
    `;
    if (rows.length > 0) {
      return {
        region,
        taxBRL: Number(rows[0].tax_brl),
        logisticsBRL: Number(rows[0].logistics_brl),
        marginPercent: Number(rows[0].margin_percent),
        isActive: true,
      };
    }
  } catch {
    // Table may not yet exist in this environment — return safe defaults.
  }
  return { region, taxBRL: 0, logisticsBRL: 0, marginPercent: 0, isActive: true };
}

// =============================================================================
// All-in total computation (pure, exported for use by orders.service)
// =============================================================================

/**
 * Compute the all-in totals from subtotal + freight + regional rule + optional discount.
 *
 * Formula:
 *   base = subtotal + freight + tax + logistics
 *   margin = base * marginPercent / 100
 *   finalTotal = base + margin
 *   discount = finalTotal * discountPercent / 100
 *   adjustedFinalTotal = finalTotal - discount
 */
export function computeAllInTotals(
  subtotalBRL: number,
  freightBRL: number,
  rule: BagPricingRule,
  currency: SupportedCurrency = "BRL",
  discountPercent = 0
): BagTotals {
  const embeddedFreightBRL = freightBRL;
  const embeddedTaxBRL = Number(rule.taxBRL.toFixed(2));
  const embeddedLogisticsBRL = Number(rule.logisticsBRL.toFixed(2));

  const base = Number(
    (subtotalBRL + embeddedFreightBRL + embeddedTaxBRL + embeddedLogisticsBRL).toFixed(2)
  );
  const embeddedMarginBRL = Number((base * rule.marginPercent / 100).toFixed(2));
  const finalTotalBRL = Number((base + embeddedMarginBRL).toFixed(2));

  const discountBRL = Number((finalTotalBRL * discountPercent / 100).toFixed(2));
  const adjustedFinalTotalBRL = Number((finalTotalBRL - discountBRL).toFixed(2));

  const rate = STATIC_RATES[currency] ?? 1;
  const finalTotalDisplay = Number((adjustedFinalTotalBRL * rate).toFixed(2));

  return {
    subtotalBRL,
    embeddedFreightBRL,
    embeddedTaxBRL,
    embeddedLogisticsBRL,
    embeddedMarginBRL,
    finalTotalBRL,
    discountBRL,
    adjustedFinalTotalBRL,
    displayCurrency: currency,
    finalTotalDisplay,
  };
}

// =============================================================================
// Pricing version — deterministic identifier from rule params
// =============================================================================

export function makePricingVersion(freightBRL: number, rule: BagPricingRule): string {
  return `allin_v1:f${freightBRL}:t${rule.taxBRL}:l${rule.logisticsBRL}:m${rule.marginPercent}`;
}

/**
 * Deterministic pricing version for country-first orders.
 * Encodes the country code and the configured rule parameters (taxPercent, not
 * the derived taxBRL) so the string is stable and semantically meaningful.
 * Stored in orders.pricing_version for audit.
 */
export function makeCountryPricingVersion(
  countryCode: string,
  freightBRL: number,
  rule: CountryPricingRule
): string {
  return `country_v1:cc=${countryCode}:f${freightBRL}:tp=${rule.taxPercent}:l=${rule.logisticsBRL}:m=${rule.marginPercent}`;
}

// =============================================================================
// Bag version token — SHA-256 fingerprint of cart contents
// =============================================================================

/**
 * Returns the first 16 hex chars of SHA-256 over sorted "type:id:qty" segments.
 * Used to scope recovery offers to the cart that triggered the abandonment.
 */
export function computeBagVersionToken(
  items: Array<{ type: string; id: string; quantity: number }>
): string {
  const sorted = [...items]
    .sort((a, b) => `${a.type}:${a.id}`.localeCompare(`${b.type}:${b.id}`))
    .map((i) => `${i.type}:${i.id}:${i.quantity}`)
    .join("|");
  return createHash("sha256").update(sorted).digest("hex").slice(0, 16);
}

// =============================================================================
// Offer code validation
// =============================================================================

async function resolveOffer(code: string): Promise<{ discountPercent: number } | null> {
  try {
    const rows = await db`
      SELECT discount_percent
      FROM bag_recovery_offers
      WHERE code = ${code}
        AND is_used = false
        AND valid_until > now()
      LIMIT 1
    `;
    if (rows.length > 0) {
      return { discountPercent: Number(rows[0].discount_percent) };
    }
  } catch {
    // Table may not yet exist — treat as no offer
  }
  return null;
}

// =============================================================================
// simulateBag — main entry point
// =============================================================================

const EMPTY_TOTALS: BagTotals = {
  subtotalBRL: 0,
  embeddedFreightBRL: 0,
  embeddedTaxBRL: 0,
  embeddedLogisticsBRL: 0,
  embeddedMarginBRL: 0,
  finalTotalBRL: 0,
  discountBRL: 0,
  adjustedFinalTotalBRL: 0,
  displayCurrency: "BRL",
  finalTotalDisplay: 0,
};

function blocked(
  region: Region,
  currency: SupportedCurrency,
  issues: string[],
  countryCode: string | null = null
): BagSimulationResult {
  return {
    isValid: false,
    countryCode,
    region,
    currency,
    pricingVersion: "blocked",
    bagVersionToken: "0000000000000000",
    items: [],
    totals: { ...EMPTY_TOTALS, displayCurrency: currency },
    blockingIssues: issues,
    appliedOffer: null,
  };
}

export async function simulateBag(input: unknown): Promise<BagSimulationResult> {
  // ── Schema validation ───────────────────────────────────────────────────
  let parsed: z.infer<typeof simulateRequestSchema>;
  try {
    parsed = simulateRequestSchema.parse(input);
  } catch {
    return blocked("North America", "BRL", ["Dados inválidos na requisição."]);
  }

  const { currency, items, offerCode } = parsed;
  // countryCode takes priority; region is the fallback for legacy callers.
  const countryCode = (parsed.countryCode as CountryCode | undefined) ?? null;
  const region: Region = parsed.region ?? "North America"; // used for display / legacy path
  const blockingIssues: string[] = [];

  // ── Product lookup (batch, deduplicated) ────────────────────────────────
  const productSlugs = [
    ...new Set(
      items
        .filter((i): i is Extract<typeof i, { type: "product" }> => i.type === "product")
        .map((i) => i.productSlug)
    ),
  ];
  const products = productSlugs.length > 0 ? await getProductsBySlug(productSlugs) : [];

  // ── Item validation & normalization ─────────────────────────────────────
  const simulatedItems: BagSimulationResult["items"] = [];

  for (const item of items) {
    if (item.type === "product") {
      const product = products.find((p) => p.slug === item.productSlug);
      if (!product) {
        blockingIssues.push(`Produto não encontrado: ${item.productSlug}`);
        continue;
      }

      const available = item.quantity <= product.stock;
      if (!available) {
        blockingIssues.push(
          `Estoque insuficiente para "${product.name}". Disponível: ${product.stock}.`
        );
      }

      simulatedItems.push({
        type: "product",
        productSlug: product.slug,
        productName: product.name,
        sku: product.sku,
        quantity: item.quantity,
        unitPriceBRL: product.retailPriceBRL,
        lineTotalBRL: Number((product.retailPriceBRL * item.quantity).toFixed(2)),
        weightRange: product.weightRange,
        stock: product.stock,
        available,
      } satisfies BagSimulatedItem);

    } else {
      // gift_kit item
      try {
        const kitRows = await db`
          SELECT id, name, brand, total_amount_brl, total_weight_range
          FROM gift_kits
          WHERE id = ${item.kitId}
          LIMIT 1
        `;
        if (kitRows.length === 0) {
          blockingIssues.push(`Kit não encontrado: ${item.kitId}`);
          continue;
        }
        const kit = kitRows[0];
        const lineTotalBRL = Number(
          (Number(kit.total_amount_brl) * item.quantity).toFixed(2)
        );
        simulatedItems.push({
          type: "gift_kit",
          kitId: item.kitId,
          kitName: kit.name as string,
          brand: kit.brand as string,
          quantity: item.quantity,
          lineTotalBRL,
          weightRange: kit.total_weight_range as WeightRange,
          available: true,
        } satisfies BagSimulatedKitItem);
      } catch {
        blockingIssues.push(`Erro ao carregar kit: ${item.kitId}`);
      }
    }
  }

  if (simulatedItems.length === 0) {
    blockingIssues.push("A bag não contém itens válidos.");
  }

  if (blockingIssues.length > 0) {
    return {
      isValid: false,
      countryCode,
      region,
      currency,
      pricingVersion: "blocked",
      bagVersionToken: "0000000000000000",
      items: simulatedItems,
      totals: { ...EMPTY_TOTALS, displayCurrency: currency },
      blockingIssues,
      appliedOffer: null,
    };
  }

  // ── Bag version token ────────────────────────────────────────────────────
  const tokenItems = simulatedItems.map((i) => ({
    type: i.type,
    id: i.type === "product" ? (i as BagSimulatedItem).productSlug : (i as BagSimulatedKitItem).kitId,
    quantity: i.quantity,
  }));
  const bagVersionToken = computeBagVersionToken(tokenItems);

  // ── Freight calculation ─────────────────────────────────────────────────
  const estimatedWeightRange = resolveOrderWeightRange(
    simulatedItems.map((i) => ({ weightRange: i.weightRange, quantity: i.quantity }))
  );

  let freightBRL = 0;

  if (countryCode) {
    // ── Country-first path (Stage 12) ──────────────────────────────────────
    try {
      const countryFreight = await quoteFreightByCountry(countryCode, estimatedWeightRange);
      freightBRL = countryFreight.amountBRL;
    } catch {
      return {
        isValid: false,
        countryCode,
        region,
        currency,
        pricingVersion: "blocked",
        bagVersionToken,
        items: simulatedItems,
        totals: { ...EMPTY_TOTALS, displayCurrency: currency },
        blockingIssues: ["País não disponível para envio no momento."],
        appliedOffer: null,
      };
    }
  } else {
    // ── Legacy region-based path (Stage 3–11) ──────────────────────────────
    try {
      const freight = await quoteFreight({ region, weightRange: estimatedWeightRange });
      freightBRL = freight.amountBRL;
    } catch {
      return {
        isValid: false,
        countryCode: null,
        region,
        currency,
        pricingVersion: "blocked",
        bagVersionToken,
        items: simulatedItems,
        totals: { ...EMPTY_TOTALS, displayCurrency: currency },
        blockingIssues: ["Região não disponível para envio no momento."],
        appliedOffer: null,
      };
    }
  }

  const subtotalBRL = Number(
    simulatedItems.reduce((s, i) => s + i.lineTotalBRL, 0).toFixed(2)
  );

  // ── Country commerce rule (load early — needed for discount / pricing) ──
  // Loaded here so allowDiscountCodes can gate offer resolution below,
  // and so the rule is available for both pricing and pricingVersion.
  let countryRule: CountryPricingRule | null = null;
  if (countryCode) {
    countryRule = await loadCountryCommerceRule(countryCode);
  }

  // ── Offer code resolution ────────────────────────────────────────────────
  // BLOCO 5: respect allowDiscountCodes per country rule.
  // If the country disables discount codes, the offer is silently ignored.
  let appliedOffer: AppliedOffer | null = null;
  let discountPercent = 0;

  const discountCodesAllowed = !countryCode || !countryRule || countryRule.allowDiscountCodes;

  if (offerCode && discountCodesAllowed) {
    const offer = await resolveOffer(offerCode);
    if (offer) {
      discountPercent = offer.discountPercent;
    }
    // Invalid codes are silently ignored — no blocking issue raised
  }

  // ── All-in pricing ──────────────────────────────────────────────────────
  let rule: BagPricingRule;
  if (countryCode) {
    rule = countryRule
      ? countryRuleToBagPricingRule(countryRule, subtotalBRL)
      : { taxBRL: 0, logisticsBRL: 0, marginPercent: 0, isActive: true };
  } else {
    rule = await loadPricingRule(region);
  }

  const totals = computeAllInTotals(subtotalBRL, freightBRL, rule, currency, discountPercent);

  // BLOCO 2: country-first path gets a semantically correct version string.
  const pricingVersion = countryCode && countryRule
    ? makeCountryPricingVersion(countryCode, freightBRL, countryRule)
    : makePricingVersion(freightBRL, rule);

  if (discountPercent > 0 && totals.discountBRL > 0) {
    appliedOffer = {
      code: offerCode!,
      discountPercent,
      discountBRL: totals.discountBRL,
    };
  }

  return {
    isValid: true,
    countryCode,
    region,
    currency,
    pricingVersion,
    bagVersionToken,
    items: simulatedItems,
    totals,
    blockingIssues: [],
    appliedOffer,
  };
}
