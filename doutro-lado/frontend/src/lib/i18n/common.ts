// =============================================================================
// Shared i18n foundation — locale types, resolution, and common utilities.
// Used by home, catalog, product, checkout and all public pages.
// Cookie key: dl_locale  |  Supported: en / de / fr / pt  |  Fallback: en
// =============================================================================

export type AppLocale = "en" | "de" | "fr" | "pt";

const APP_LOCALES: readonly AppLocale[] = ["en", "de", "fr", "pt"];

export function isAppLocale(value: unknown): value is AppLocale {
  return typeof value === "string" && (APP_LOCALES as string[]).includes(value);
}

/**
 * Resolve display locale from the dl_locale cookie and Accept-Language header.
 * Language controls UI text only — market/destination controls commerce rules.
 *
 * Resolution order:
 * 1. Cookie `dl_locale` (explicit user preference)
 * 2. `Accept-Language` header primary tag
 * 3. Fallback `en`
 */
export function resolveLocale(
  acceptLanguage: string | null,
  cookieLocale: string | null | undefined,
): AppLocale {
  if (cookieLocale && isAppLocale(cookieLocale)) return cookieLocale;
  const primary = (acceptLanguage ?? "")
    .split(",")[0]
    .split("-")[0]
    .toLowerCase()
    .trim();
  if (isAppLocale(primary)) return primary as AppLocale;
  return "en";
}
