import { z } from "zod";
import { db } from "../../lib/db.js";
import { getProductsBySlug } from "../../services/catalog.service.js";
import { quoteFreight, resolveOrderWeightRange } from "../freight/freight.service.js";
import { STATIC_RATES } from "../../services/i18n.service.js";
import { REGIONS } from "../../config/constants.js";
import type { Region, SupportedCurrency } from "../../types/domain.js";
import type {
  BagPricingRule,
  BagSimulateRequest,
  BagSimulationResult,
  BagTotals,
} from "./bag.types.js";

// =============================================================================
// Request validation schema
// =============================================================================

export const simulateRequestSchema = z.object({
  region: z.enum(REGIONS as [Region, ...Region[]]),
  currency: z.enum(["BRL", "USD", "EUR", "AED"] as const).default("BRL"),
  items: z
    .array(
      z.object({
        type: z.literal("product"),
        productSlug: z.string().min(1).max(200),
        quantity: z.coerce.number().int().min(1).max(99),
      })
    )
    .min(1),
});

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
 * Compute the all-in totals from subtotal + freight + regional rule.
 *
 * Formula:
 *   base = subtotal + freight + tax + logistics
 *   margin = base * marginPercent / 100
 *   finalTotal = base + margin
 */
export function computeAllInTotals(
  subtotalBRL: number,
  freightBRL: number,
  rule: BagPricingRule,
  currency: SupportedCurrency = "BRL"
): BagTotals {
  const embeddedFreightBRL = freightBRL;
  const embeddedTaxBRL = Number(rule.taxBRL.toFixed(2));
  const embeddedLogisticsBRL = Number(rule.logisticsBRL.toFixed(2));

  const base = Number(
    (subtotalBRL + embeddedFreightBRL + embeddedTaxBRL + embeddedLogisticsBRL).toFixed(2)
  );
  const embeddedMarginBRL = Number((base * rule.marginPercent / 100).toFixed(2));
  const finalTotalBRL = Number((base + embeddedMarginBRL).toFixed(2));

  const rate = STATIC_RATES[currency] ?? 1;
  const finalTotalDisplay = Number((finalTotalBRL * rate).toFixed(2));

  return {
    subtotalBRL,
    embeddedFreightBRL,
    embeddedTaxBRL,
    embeddedLogisticsBRL,
    embeddedMarginBRL,
    finalTotalBRL,
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
  displayCurrency: "BRL",
  finalTotalDisplay: 0,
};

function blocked(
  region: Region,
  currency: SupportedCurrency,
  issues: string[]
): BagSimulationResult {
  return {
    isValid: false,
    region,
    currency,
    pricingVersion: "blocked",
    items: [],
    totals: { ...EMPTY_TOTALS, displayCurrency: currency },
    blockingIssues: issues,
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

  const { region, currency, items } = parsed;
  const blockingIssues: string[] = [];

  // ── Product lookup ──────────────────────────────────────────────────────
  const slugs = [...new Set(items.map((i) => i.productSlug))];
  const products = await getProductsBySlug(slugs);

  // ── Item validation & normalization ─────────────────────────────────────
  const simulatedItems: BagSimulationResult["items"] = [];

  for (const item of items) {
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
    });
  }

  if (simulatedItems.length === 0) {
    blockingIssues.push("A bag não contém itens válidos.");
  }

  if (blockingIssues.length > 0) {
    return {
      isValid: false,
      region,
      currency,
      pricingVersion: "blocked",
      items: simulatedItems,
      totals: { ...EMPTY_TOTALS, displayCurrency: currency },
      blockingIssues,
    };
  }

  // ── Freight calculation ─────────────────────────────────────────────────
  const estimatedWeightRange = resolveOrderWeightRange(
    simulatedItems.map((i) => ({ weightRange: i.weightRange, quantity: i.quantity }))
  );

  let freightBRL = 0;
  try {
    const freight = await quoteFreight({ region, weightRange: estimatedWeightRange });
    freightBRL = freight.amountBRL;
  } catch {
    return {
      isValid: false,
      region,
      currency,
      pricingVersion: "blocked",
      items: simulatedItems,
      totals: { ...EMPTY_TOTALS, displayCurrency: currency },
      blockingIssues: ["Região não disponível para envio no momento."],
    };
  }

  // ── All-in pricing ──────────────────────────────────────────────────────
  const rule = await loadPricingRule(region);
  const subtotalBRL = Number(
    simulatedItems.reduce((s, i) => s + i.lineTotalBRL, 0).toFixed(2)
  );
  const totals = computeAllInTotals(subtotalBRL, freightBRL, rule, currency);
  const pricingVersion = makePricingVersion(freightBRL, rule);

  return {
    isValid: true,
    region,
    currency,
    pricingVersion,
    items: simulatedItems,
    totals,
    blockingIssues: [],
  };
}
