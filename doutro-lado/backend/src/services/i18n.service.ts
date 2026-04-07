// =============================================================================
// Internationalization foundation — Stage 9 (backend)
// =============================================================================
//
// Architecture:
//   - BRL is the canonical stored currency for ALL prices (source of truth)
//   - `currencies` and `languages` tables exist in schema (Stage 9 seeded)
//   - Orders store `currency` field = the user's display currency at checkout time
//   - All financial calculations (freight, totals) remain in BRL
//   - Frontend converts BRL → display currency via static exchange rates
//   - Backend does NOT convert: it stores BRL and exposes the rate table
// =============================================================================

import { db } from "../lib/db.js";

// =============================================================================
// Canonical types
// =============================================================================

export type SupportedCurrency = "BRL" | "USD" | "EUR" | "AED";
export type SupportedLanguage = "pt" | "en" | "ar";

export type CurrencyRecord = {
  code: SupportedCurrency;
  symbol: string;
  isActive: boolean;
};

export type LanguageRecord = {
  code: SupportedLanguage;
  label: string;
  isActive: boolean;
};

// =============================================================================
// Static configuration (used for validation + seeding)
// =============================================================================

export const SUPPORTED_CURRENCIES: CurrencyRecord[] = [
  { code: "BRL", symbol: "R$",  isActive: true },
  { code: "USD", symbol: "$",   isActive: true },
  { code: "EUR", symbol: "€",   isActive: true },
  { code: "AED", symbol: "AED", isActive: true },
];

export const SUPPORTED_LANGUAGES: LanguageRecord[] = [
  { code: "pt", label: "Português", isActive: true },
  { code: "en", label: "English",   isActive: true },
  { code: "ar", label: "العربية",   isActive: false }, // right-to-left: future stage
];

/**
 * Indicative static exchange rates: 1 BRL → target currency.
 * Stage 9: static placeholders. Stage 10+: replace with live feed from
 * an exchange rate API (e.g. Open Exchange Rates, Frankfurter, or internal table).
 *
 * Contract invariant: ALL financial calculations on the backend use BRL.
 * These rates are for DISPLAY ONLY on the frontend.
 */
export const STATIC_RATES: Record<SupportedCurrency, number> = {
  BRL: 1,
  USD: 0.18,
  EUR: 0.17,
  AED: 0.67,
};

// =============================================================================
// Guards
// =============================================================================

const CURRENCY_CODES = new Set<string>(["BRL", "USD", "EUR", "AED"]);
const LANGUAGE_CODES = new Set<string>(["pt", "en", "ar"]);

export function isSupportedCurrency(code: string): code is SupportedCurrency {
  return CURRENCY_CODES.has(code);
}

export function isSupportedLanguage(code: string): code is SupportedLanguage {
  return LANGUAGE_CODES.has(code);
}

// =============================================================================
// i18n API queries (read from currencies + languages tables)
// =============================================================================

export async function listActiveCurrencies(): Promise<CurrencyRecord[]> {
  try {
    const rows = await db`
      SELECT code, symbol, is_active
      FROM currencies
      WHERE is_active = true
      ORDER BY code
    `;
    if (rows.length === 0) return SUPPORTED_CURRENCIES.filter((c) => c.isActive);
    return rows.map((r) => ({
      code: r.code as SupportedCurrency,
      symbol: r.symbol as string,
      isActive: r.is_active as boolean,
    }));
  } catch {
    // Fallback if table is not yet seeded
    return SUPPORTED_CURRENCIES.filter((c) => c.isActive);
  }
}

export async function listActiveLanguages(): Promise<LanguageRecord[]> {
  try {
    const rows = await db`
      SELECT code, label, is_active
      FROM languages
      WHERE is_active = true
      ORDER BY code
    `;
    if (rows.length === 0) return SUPPORTED_LANGUAGES.filter((l) => l.isActive);
    return rows.map((r) => ({
      code: r.code as SupportedLanguage,
      label: r.label as string,
      isActive: r.is_active as boolean,
    }));
  } catch {
    return SUPPORTED_LANGUAGES.filter((l) => l.isActive);
  }
}

/**
 * Get site configuration value by key.
 * Returns null if the key does not exist (graceful — site_settings is optional operational data).
 */
export async function getSiteSetting(key: string): Promise<unknown | null> {
  try {
    const rows = await db`SELECT value FROM site_settings WHERE key = ${key} LIMIT 1`;
    return rows.length > 0 ? rows[0].value : null;
  } catch {
    return null;
  }
}

/**
 * Upsert a site configuration value. Admin-only operation.
 */
export async function setSiteSetting(key: string, value: unknown): Promise<void> {
  await db`
    INSERT INTO site_settings (key, value, updated_at)
    VALUES (${key}, ${JSON.stringify(value)}, now())
    ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = now()
  `;
}
