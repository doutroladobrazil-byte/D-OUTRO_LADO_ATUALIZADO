// =============================================================================
// Internationalization foundation — Stage 9
// =============================================================================
//
// Architecture decision:
//   - BRL is the canonical base price currency (all prices stored in BRL)
//   - Display currency is layered on top via exchange rates (future)
//   - For Stage 9: BRL (R$) is displayed for all storefront; USD displayed for
//     international guests based on profile.preferredCurrency
//   - All price formatting routes through formatPrice() — never raw .toFixed()
//   - Locale affects number grouping (pt-BR for BRL, en-US for USD/EUR/etc.)
//   - Language affects copy strings (en/pt supported; pt-BR is default)
// =============================================================================

// =============================================================================
// Canonical types
// =============================================================================

/** ISO 4217 currency codes supported by the platform. */
export type SupportedCurrency = "BRL" | "USD" | "EUR" | "AED" | "CHF" | "SGD";

/** IETF BCP 47 locale tags supported for display formatting. */
export type SupportedLocale = "pt-BR" | "en-US" | "en-GB" | "ar-AE" | "de-CH" | "zh-SG";

/** Two-letter ISO 639-1 language codes. */
export type SupportedLanguage = "pt" | "en" | "ar" | "de";

/** ISO 3166-1 alpha-2 codes for the 6 MVP destination countries (Stage 12). */
export type CountryCode = "US" | "CH" | "IE" | "DE" | "IS" | "SG";

// =============================================================================
// Constants
// =============================================================================

export const SUPPORTED_CURRENCIES: readonly SupportedCurrency[] = [
  "BRL", "USD", "EUR", "AED", "CHF", "SGD",
] as const;

export const SUPPORTED_LANGUAGES: readonly SupportedLanguage[] = [
  "pt", "en", "ar", "de",
] as const;

/** The 6 MVP destination countries. */
export const COUNTRY_CODES: readonly CountryCode[] = [
  "US", "CH", "IE", "DE", "IS", "SG",
] as const;

/** Map: currency → associated display locale. */
export const CURRENCY_LOCALE_MAP: Record<SupportedCurrency, SupportedLocale> = {
  BRL: "pt-BR",
  USD: "en-US",
  EUR: "en-GB",
  AED: "ar-AE",
  CHF: "de-CH",
  SGD: "zh-SG",
};

/** Map: currency → symbol (for compact usage). */
export const CURRENCY_SYMBOL: Record<SupportedCurrency, string> = {
  BRL: "R$",
  USD: "$",
  EUR: "€",
  AED: "AED",
  CHF: "Fr.",
  SGD: "S$",
};

/**
 * Default display currency per MVP country (Stage 12).
 * IS uses EUR strategically (not ISK) for simplicity.
 */
export const COUNTRY_DEFAULT_CURRENCY: Record<CountryCode, SupportedCurrency> = {
  US: "USD",
  CH: "CHF",
  IE: "EUR",
  DE: "EUR",
  IS: "EUR",
  SG: "SGD",
};

/** Map: language code → display label. */
export const LANGUAGE_LABELS: Record<SupportedLanguage, string> = {
  pt: "Português",
  en: "English",
  ar: "العربية",
};

/** Map: currency → indicative exchange rate FROM BRL (BRL → target).
 *  Stage 9: rates are static placeholders.
 *  Stage 10+: replace with live rate fetch from exchange API.
 *  The canonical contract is always: displayAmount = brlAmount * rate
 */
export const STATIC_EXCHANGE_RATES: Record<SupportedCurrency, number> = {
  BRL: 1,
  USD: 0.18,   // ~1 BRL = 0.18 USD (placeholder)
  EUR: 0.17,   // ~1 BRL = 0.17 EUR (placeholder)
  AED: 0.67,   // ~1 BRL = 0.67 AED (placeholder)
  // Stage 12 — country-first MVP
  CHF: 0.16,   // ~1 BRL = 0.16 CHF (placeholder)
  SGD: 0.24,   // ~1 BRL = 0.24 SGD (placeholder)
};

/**
 * Default (admin) currency — always BRL.
 * Admin backoffice always displays BRL regardless of user preference.
 */
export const ADMIN_CURRENCY: SupportedCurrency = "BRL";

/**
 * Default storefront currency when no profile preference is set.
 */
export const DEFAULT_CURRENCY: SupportedCurrency = "BRL";

/**
 * Default language when no profile preference is set.
 */
export const DEFAULT_LANGUAGE: SupportedLanguage = "pt";

// =============================================================================
// Guards
// =============================================================================

export function isSupportedCurrency(value: unknown): value is SupportedCurrency {
  return typeof value === "string" && (SUPPORTED_CURRENCIES as readonly string[]).includes(value);
}

export function isSupportedLanguage(value: unknown): value is SupportedLanguage {
  return typeof value === "string" && (SUPPORTED_LANGUAGES as readonly string[]).includes(value);
}

// =============================================================================
// Formatting utilities
// =============================================================================

/**
 * Format a BRL-denominated price for display in the given display currency.
 *
 * Stage 9 contract:
 *   - All stored prices are in BRL (source of truth).
 *   - If displayCurrency === "BRL", format in pt-BR with BRL symbol.
 *   - If displayCurrency is a foreign currency, convert using static rate
 *     and format with the appropriate locale.
 *   - Admin always uses BRL.
 *
 * @param brlAmount  - The price in BRL as stored in the database.
 * @param currency   - The currency to display (from profile.preferredCurrency).
 * @returns          - A locale-formatted price string (e.g. "R$ 389,00" / "$ 70.02").
 */
export function formatPrice(
  brlAmount: number,
  currency: SupportedCurrency = DEFAULT_CURRENCY,
): string {
  const rate = STATIC_EXCHANGE_RATES[currency] ?? 1;
  const displayAmount = brlAmount * rate;
  const locale = CURRENCY_LOCALE_MAP[currency] ?? "en-US";

  try {
    return new Intl.NumberFormat(locale, {
      style: "currency",
      currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(displayAmount);
  } catch {
    // Fallback: use compact formatting if Intl fails (e.g. unsupported env)
    const symbol = CURRENCY_SYMBOL[currency] ?? currency;
    return `${symbol} ${displayAmount.toFixed(2)}`;
  }
}

/**
 * Format a BRL amount compactly (e.g. for metric cards, badge displays).
 * Always formats in BRL regardless of currency.
 */
export function formatBRL(amount: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 2,
  }).format(amount);
}

/**
 * Convert a BRL amount to a display currency amount (number only, no formatting).
 */
export function convertFromBRL(brlAmount: number, targetCurrency: SupportedCurrency): number {
  const rate = STATIC_EXCHANGE_RATES[targetCurrency] ?? 1;
  return brlAmount * rate;
}

/**
 * Format the exchange rate context string for display.
 * Example: "1 USD ≈ R$ 5.55"
 */
export function formatRateContext(currency: SupportedCurrency): string {
  if (currency === "BRL") return "";
  const rate = STATIC_EXCHANGE_RATES[currency];
  if (!rate) return "";
  const brlPerUnit = (1 / rate).toFixed(2);
  return `1 ${CURRENCY_SYMBOL[currency]} ≈ R$ ${brlPerUnit}`;
}

// =============================================================================
// Detect preferred currency from profile or Accept-Language
// =============================================================================

/**
 * Coerce a raw string from profile.preferredCurrency into a SupportedCurrency.
 * Falls back to DEFAULT_CURRENCY if the value is unknown.
 */
export function resolvePreferredCurrency(raw: string | null | undefined): SupportedCurrency {
  if (!raw) return DEFAULT_CURRENCY;
  return isSupportedCurrency(raw) ? raw : DEFAULT_CURRENCY;
}

/**
 * Coerce a raw string from profile.preferredLanguage into a SupportedLanguage.
 */
export function resolvePreferredLanguage(raw: string | null | undefined): SupportedLanguage {
  if (!raw) return DEFAULT_LANGUAGE;
  return isSupportedLanguage(raw) ? raw : DEFAULT_LANGUAGE;
}

/**
 * Map region name → default display currency for guests without a profile.
 * Legacy (Stage 3–11): used when country is not yet selected.
 */
export const REGION_DEFAULT_CURRENCY: Record<string, SupportedCurrency> = {
  "North America": "USD",
  "Europe": "EUR",
  "Middle East": "AED",
};
