"use client";

/**
 * useCountryPreference — Stage 13
 *
 * Persists the user's selected destination country in localStorage so that
 * catalog pages and PDPs can reflect availability without requiring the full
 * checkout flow to be open.
 *
 * Key: "dol_country" (2-letter ISO code, uppercase)
 *
 * Design:
 *  - Read from localStorage on mount (client-side only — SSR returns null).
 *  - BrandCheckoutView writes here when the user changes country in checkout.
 *  - Catalog pages / PDPs read from here to show availability badges.
 *  - No Context / Provider needed — localStorage is the single source of truth.
 */

import { useState, useEffect, useCallback } from "react";
import type { CountryCode } from "@/lib/i18n";

const STORAGE_KEY = "dol_country";

export function useCountryPreference() {
  const [countryCode, setCountryCodeState] = useState<CountryCode | null>(null);

  // Hydrate from localStorage on mount (avoids SSR mismatch)
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) setCountryCodeState(stored as CountryCode);
    } catch {
      // localStorage unavailable (private mode, etc.)
    }
  }, []);

  const setCountryCode = useCallback((code: CountryCode | null) => {
    setCountryCodeState(code);
    try {
      if (code) {
        localStorage.setItem(STORAGE_KEY, code);
      } else {
        localStorage.removeItem(STORAGE_KEY);
      }
    } catch {
      // localStorage unavailable
    }
  }, []);

  return { countryCode, setCountryCode };
}
