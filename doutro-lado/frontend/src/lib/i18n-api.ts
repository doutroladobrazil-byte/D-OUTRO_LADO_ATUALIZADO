/**
 * i18n API helpers — used by frontend for currency/language discovery.
 * These are PUBLIC endpoints — no auth token required.
 */
import { fetchApiData } from "@/lib/api";
import type { SupportedCurrency } from "@/lib/i18n";

export type CurrencyRecord = {
  code: SupportedCurrency;
  symbol: string;
  isActive: boolean;
};

export type LanguageRecord = {
  code: string;
  label: string;
  isActive: boolean;
};

export type ExchangeRates = Partial<Record<SupportedCurrency, number>>;

/** Fetch active currencies from backend (with static fallback). */
export async function fetchCurrencies(): Promise<CurrencyRecord[]> {
  return (
    (await fetchApiData<CurrencyRecord[]>("/i18n/currencies", { revalidate: 3600 })) ?? [
      { code: "BRL", symbol: "R$", isActive: true },
      { code: "USD", symbol: "$", isActive: true },
      { code: "EUR", symbol: "€", isActive: true },
      { code: "AED", symbol: "AED", isActive: true },
    ]
  );
}

/** Fetch active languages from backend (with static fallback). */
export async function fetchLanguages(): Promise<LanguageRecord[]> {
  return (
    (await fetchApiData<LanguageRecord[]>("/i18n/languages", { revalidate: 3600 })) ?? [
      { code: "pt", label: "Português", isActive: true },
      { code: "en", label: "English", isActive: true },
    ]
  );
}

/** Fetch exchange rates from backend (with static fallback). */
export async function fetchExchangeRates(): Promise<ExchangeRates> {
  return (
    (await fetchApiData<ExchangeRates>("/i18n/rates", { revalidate: 3600 })) ?? {
      BRL: 1,
      USD: 0.18,
      EUR: 0.17,
      AED: 0.67,
    }
  );
}
