import type { Brand, CountryCode, Region, SupportedCurrency, WeightRange } from "../types/domain.js";

/**
 * BRANDS — lista de marcas ativas para operacao publica.
 * D'OUTRO LADO opera exclusivamente como plataforma de moda.
 * "casa" e mantido nos tipos por compatibilidade com dados historicos no banco,
 * mas nao e mais uma brand publica ativa.
 */
export const BRANDS: readonly Brand[] = ["moda"] as const;

export const REGIONS: readonly Region[] = [
  "North America",
  "Europe",
  "Middle East"
] as const;

export const WEIGHT_RANGES: readonly WeightRange[] = [
  "100g-1kg",
  "1-3kg",
  "3-5kg",
  "5-10kg",
  "10-15kg",
  "15-20kg"
] as const;

export const weightRangeUpperBoundsKg: Record<WeightRange, number> = {
  "100g-1kg": 1,
  "1-3kg": 3,
  "3-5kg": 5,
  "5-10kg": 10,
  "10-15kg": 15,
  "15-20kg": 20
};

// =============================================================================
// Stage 12 — Country-first MVP constants
// =============================================================================

/** The 6 MVP destination countries (ISO 3166-1 alpha-2). */
export const COUNTRY_CODES: readonly CountryCode[] = [
  "US", "CH", "IE", "DE", "IS", "SG"
] as const;

/**
 * Default display currency per MVP country.
 * IS uses EUR strategically (not ISK) to avoid additional complexity.
 */
export const COUNTRY_DEFAULT_CURRENCY: Record<CountryCode, SupportedCurrency> = {
  US: "USD",
  CH: "CHF",
  IE: "EUR",
  DE: "EUR",
  IS: "EUR",
  SG: "SGD",
};
