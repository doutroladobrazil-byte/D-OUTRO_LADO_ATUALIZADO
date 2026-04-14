// =============================================================================
// Countries service — Stage 12 (country-first international MVP)
// =============================================================================
//
// Provides:
//  - listActiveCountries()         — used by the public /api/countries endpoint
//  - getCountryByCode(code)        — used by /api/countries/:code
//  - loadCountryCommerceRule(code) — used by bag simulation and order builder
//  - quoteFreightByCountry(code, weightRange) — per-country freight lookup
//
// Design:
//  All functions fall back gracefully (null / throw with clear message) so that
//  callers can decide whether to fall back to the legacy region-based path or
//  surface an error to the user.
// =============================================================================

import { db } from "../../lib/db.js";
import { COUNTRY_CODES } from "../../config/constants.js";
import type { CountryCode, SupportedCurrency, WeightRange } from "../../types/domain.js";
import type { CountryPricingRule, CountryShippingQuote } from "../bag/bag.types.js";

// ---------------------------------------------------------------------------
// Public country shapes
// ---------------------------------------------------------------------------

export type SupportedCountryRecord = {
  code: CountryCode;
  name: string;
  regionGroup: string;
  defaultCurrency: SupportedCurrency;
  defaultLanguage: string;
  isActive: boolean;
  checkoutEnabled: boolean;
  catalogEnabled: boolean;
  displayPosition: number;
};

export type CountryDetail = SupportedCountryRecord & {
  commerceRule: CountryPricingRule | null;
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function isValidCountryCode(code: string): code is CountryCode {
  return (COUNTRY_CODES as readonly string[]).includes(code.toUpperCase());
}

// ---------------------------------------------------------------------------
// Queries
// ---------------------------------------------------------------------------

/**
 * Returns all countries where is_active = true, ordered by display_position.
 * Used by the public /api/countries endpoint (country selector in checkout).
 */
export async function listActiveCountries(): Promise<SupportedCountryRecord[]> {
  try {
    const rows = await db`
      SELECT code, name, region_group, default_currency, default_language,
             is_active, checkout_enabled, catalog_enabled, display_position
      FROM supported_countries
      WHERE is_active = true
      ORDER BY display_position, code
    `;

    return rows.map((r) => ({
      code: r.code as CountryCode,
      name: r.name as string,
      regionGroup: r.region_group as string,
      defaultCurrency: r.default_currency as SupportedCurrency,
      defaultLanguage: r.default_language as string,
      isActive: r.is_active as boolean,
      checkoutEnabled: r.checkout_enabled as boolean,
      catalogEnabled: r.catalog_enabled as boolean,
      displayPosition: r.display_position as number,
    }));
  } catch {
    // Table not yet migrated in this environment — return empty list.
    return [];
  }
}

/**
 * Returns a single country by ISO code (case-insensitive), or null if not found.
 */
export async function getCountryByCode(code: string): Promise<CountryDetail | null> {
  const upperCode = code.toUpperCase();
  if (!isValidCountryCode(upperCode)) return null;

  try {
    const rows = await db`
      SELECT code, name, region_group, default_currency, default_language,
             is_active, checkout_enabled, catalog_enabled, display_position
      FROM supported_countries
      WHERE code = ${upperCode}
      LIMIT 1
    `;
    if (rows.length === 0) return null;
    const r = rows[0];

    const country: SupportedCountryRecord = {
      code: r.code as CountryCode,
      name: r.name as string,
      regionGroup: r.region_group as string,
      defaultCurrency: r.default_currency as SupportedCurrency,
      defaultLanguage: r.default_language as string,
      isActive: r.is_active as boolean,
      checkoutEnabled: r.checkout_enabled as boolean,
      catalogEnabled: r.catalog_enabled as boolean,
      displayPosition: r.display_position as number,
    };

    const commerceRule = await loadCountryCommerceRule(upperCode as CountryCode);
    return { ...country, commerceRule };
  } catch {
    return null;
  }
}

/**
 * Load the active commerce rule for a country, or null if none configured.
 * Returns the rule in the CountryPricingRule shape used by the bag simulator.
 */
export async function loadCountryCommerceRule(countryCode: CountryCode): Promise<CountryPricingRule | null> {
  try {
    const rows = await db`
      SELECT
        country_code, pricing_currency,
        tax_percent, logistics_brl, margin_percent, minimum_order_brl,
        allow_guest_checkout, allow_discount_codes,
        estimated_delivery_min_days, estimated_delivery_max_days,
        is_active, notes
      FROM country_commerce_rules
      WHERE country_code = ${countryCode}
        AND is_active = true
      LIMIT 1
    `;

    if (rows.length === 0) return null;
    const r = rows[0];

    return {
      countryCode: r.country_code as CountryCode,
      pricingCurrency: r.pricing_currency as SupportedCurrency,
      taxPercent: Number(r.tax_percent),
      logisticsBRL: Number(r.logistics_brl),
      marginPercent: Number(r.margin_percent),
      minimumOrderBrl: Number(r.minimum_order_brl),
      allowGuestCheckout: r.allow_guest_checkout as boolean,
      allowDiscountCodes: r.allow_discount_codes as boolean,
      estimatedDeliveryMinDays: r.estimated_delivery_min_days as number,
      estimatedDeliveryMaxDays: r.estimated_delivery_max_days as number,
      isActive: r.is_active as boolean,
      notes: r.notes as string | null,
    };
  } catch {
    return null;
  }
}

/**
 * Quote freight for a specific country and weight range.
 * Throws if no active rule exists (caller must handle the error).
 */
export async function quoteFreightByCountry(
  countryCode: CountryCode,
  weightRange: WeightRange
): Promise<CountryShippingQuote> {
  const rows = await db`
    SELECT base_amount_brl, carrier_label, sla_min_days, sla_max_days
    FROM country_shipping_rules
    WHERE country_code = ${countryCode}
      AND weight_range = ${weightRange}
      AND is_active = true
    LIMIT 1
  `;

  if (rows.length === 0) {
    throw new Error(
      `No shipping rule found for country "${countryCode}" / weight range "${weightRange}". ` +
        `Ensure country_shipping_rules is seeded.`
    );
  }

  const r = rows[0];
  return {
    countryCode,
    weightRange,
    amountBRL: Number(r.base_amount_brl),
    carrierLabel: r.carrier_label as string,
    slaMinDays: r.sla_min_days as number,
    slaMaxDays: r.sla_max_days as number,
  };
}
