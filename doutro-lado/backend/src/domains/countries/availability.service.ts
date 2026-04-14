// =============================================================================
// Product country availability — Stage 13
// =============================================================================
//
// Manages the product_country_availability table.
// Design:
//   - Opt-in model: a product is available in a country only when an explicit
//     is_active=true row exists. No row → unavailable.
//   - Backfill at migration time seeds all active products for all 6 MVP countries.
//   - New products start with no rows → admin must enable countries explicitly.
//
// All functions degrade gracefully (return safe defaults) if the table has not
// yet been migrated in the current environment.
// =============================================================================

import { db } from "../../lib/db.js";
import { COUNTRY_CODES } from "../../config/constants.js";

// ---------------------------------------------------------------------------
// Public types
// ---------------------------------------------------------------------------

/** Map of country_code → is_active for a single product. */
export type ProductAvailabilityMap = Record<string, boolean>;

// ---------------------------------------------------------------------------
// Read helpers
// ---------------------------------------------------------------------------

/**
 * Returns the availability map for a single product.
 * Includes all 6 MVP countries. Countries without a row are treated as
 * inactive (is_active: false) — consistent with the opt-in model.
 */
export async function getProductAvailabilityMap(productId: string): Promise<ProductAvailabilityMap> {
  try {
    const rows = await db`
      SELECT country_code, is_active
      FROM product_country_availability
      WHERE product_id = ${productId}
        AND country_code = ANY(${COUNTRY_CODES as string[]})
    `;

    const map: ProductAvailabilityMap = {};
    // Default all MVP countries to false (no row = unavailable)
    for (const code of COUNTRY_CODES) {
      map[code] = false;
    }
    // Override with actual DB values
    for (const row of rows) {
      map[row.country_code as string] = row.is_active as boolean;
    }
    return map;
  } catch {
    // Table not yet migrated — return all available as a safe fallback
    const map: ProductAvailabilityMap = {};
    for (const code of COUNTRY_CODES) map[code] = true;
    return map;
  }
}

/**
 * Given a list of product UUIDs and a destination country code,
 * returns the Set of product IDs that are NOT available in that country
 * (either no row or is_active = false).
 *
 * Used by simulateBag and buildOrder to block unavailable items.
 *
 * Degrades gracefully: returns an empty Set if the table doesn't exist,
 * so orders can still be placed in environments without the migration.
 */
export async function getUnavailableProductIds(
  productIds: string[],
  countryCode: string
): Promise<Set<string>> {
  if (productIds.length === 0) return new Set();

  try {
    const rows = await db`
      SELECT product_id
      FROM product_country_availability
      WHERE product_id = ANY(${productIds})
        AND country_code = ${countryCode}
        AND is_active = true
    `;

    const availableIds = new Set(rows.map((r) => r.product_id as string));
    const unavailableIds = new Set(
      productIds.filter((id) => !availableIds.has(id))
    );
    return unavailableIds;
  } catch {
    // Table not yet migrated — treat all as available
    return new Set();
  }
}

// ---------------------------------------------------------------------------
// Write helpers
// ---------------------------------------------------------------------------

/**
 * Upsert one (product, country) availability row.
 * Safe to call multiple times — uses ON CONFLICT DO UPDATE.
 */
export async function upsertProductCountryAvailability(
  productId: string,
  countryCode: string,
  isActive: boolean
): Promise<void> {
  await db`
    INSERT INTO product_country_availability (product_id, country_code, is_active, updated_at)
    VALUES (${productId}, ${countryCode}, ${isActive}, now())
    ON CONFLICT (product_id, country_code)
    DO UPDATE SET is_active = EXCLUDED.is_active, updated_at = now()
  `;
}

/**
 * Batch-upsert availability for all provided country codes.
 * updates is a Record<countryCode, isActive>.
 * Only MVP country codes are accepted; unknown codes are ignored.
 */
export async function setProductAvailabilities(
  productId: string,
  updates: Record<string, boolean>
): Promise<ProductAvailabilityMap> {
  const mvpCodes = new Set(COUNTRY_CODES as string[]);

  for (const [code, isActive] of Object.entries(updates)) {
    if (!mvpCodes.has(code.toUpperCase())) continue;
    await upsertProductCountryAvailability(productId, code.toUpperCase(), isActive);
  }

  return getProductAvailabilityMap(productId);
}
