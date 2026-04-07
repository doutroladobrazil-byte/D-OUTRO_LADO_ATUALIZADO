import { db } from "../../lib/db.js";
import { z } from "zod";
import { REGIONS, WEIGHT_RANGES, weightRangeUpperBoundsKg } from "../../config/constants.js";
import type { FreightRate, FreightQuote, Region, WeightRange } from "../../types/domain.js";

// =============================================================================
// Validation schema (shared with controller + orders.service)
// =============================================================================

export const freightQuoteSchema = z.object({
  region: z.enum(REGIONS as [Region, ...Region[]]),
  weightRange: z.enum(WEIGHT_RANGES as [WeightRange, ...WeightRange[]]),
});

export type FreightQuoteInput = z.infer<typeof freightQuoteSchema>;

// =============================================================================
// DB queries
// =============================================================================

/**
 * Return all active freight rates, optionally filtered by weightRange.
 * Moved here from catalog.service — freight is its own domain.
 */
export async function listFreightRates(weightRange?: WeightRange): Promise<FreightRate[]> {
  const rows = weightRange
    ? await db`
        SELECT sr.name AS region, s.weight_range, s.amount_brl
        FROM shipping_rates s
        JOIN shipping_regions sr ON sr.id = s.shipping_region_id
        WHERE s.weight_range = ${weightRange} AND sr.is_active = true
        ORDER BY sr.name
      `
    : await db`
        SELECT sr.name AS region, s.weight_range, s.amount_brl
        FROM shipping_rates s
        JOIN shipping_regions sr ON sr.id = s.shipping_region_id
        WHERE sr.is_active = true
        ORDER BY sr.name, s.weight_range
      `;

  return rows.map((row) => ({
    region: row.region as Region,
    weightRange: row.weight_range as WeightRange,
    amountBRL: Number(row.amount_brl),
  }));
}

/**
 * Return distinct active shipping regions.
 * Used by cart/checkout to present region selection to the customer.
 */
export async function listShippingRegions(): Promise<Region[]> {
  const rows = await db`
    SELECT name FROM shipping_regions WHERE is_active = true ORDER BY name
  `;
  return rows.map((row) => row.name as Region);
}

// =============================================================================
// Quote logic
// =============================================================================

/**
 * Deterministic freight quote.
 * Rules:
 *  - One rate lookup per (region, weightRange) pair — no per-item surcharges.
 *  - weightRange here is already the *estimated total* range for the order.
 *  - Returns a typed FreightQuote snapshot ready for order persistence.
 */
export async function quoteFreight(input: FreightQuoteInput): Promise<FreightQuote> {
  const rates = await listFreightRates(input.weightRange);
  const rate = rates.find((entry) => entry.region === input.region);

  if (!rate) {
    throw new Error(
      `Freight rate not found for region "${input.region}" / weight range "${input.weightRange}". ` +
        `Ensure shipping_rates table is seeded.`
    );
  }

  return {
    region: input.region,
    weightRange: input.weightRange,
    amountBRL: rate.amountBRL,
  };
}

// =============================================================================
// Weight aggregation helper (used by orders.service)
// =============================================================================

/**
 * Given a list of items with weight ranges and quantities,
 * compute the estimated total order weight range.
 *
 * Uses upper bounds as a conservative estimate — ensures we never under-charge freight.
 */
export function resolveOrderWeightRange(
  items: { weightRange: WeightRange; quantity: number }[]
): WeightRange {
  const totalKg = items.reduce(
    (sum, item) => sum + weightRangeUpperBoundsKg[item.weightRange] * item.quantity,
    0
  );
  return (
    WEIGHT_RANGES.find((range) => totalKg <= weightRangeUpperBoundsKg[range]) ?? "15-20kg"
  );
}
