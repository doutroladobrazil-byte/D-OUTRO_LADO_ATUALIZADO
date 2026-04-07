"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import {
  DEFAULT_CURRENCY,
  DEFAULT_LANGUAGE,
  resolvePreferredCurrency,
  resolvePreferredLanguage,
  type SupportedCurrency,
  type SupportedLanguage,
} from "@/lib/i18n";
import { useAuth } from "@/contexts/AuthContext";

// =============================================================================
// Types
// =============================================================================

type LocaleState = {
  /** The currency currently selected for price display. */
  currency: SupportedCurrency;
  /** The language preference for copy/labels. */
  language: SupportedLanguage;
  /** Update the display currency (e.g. from a currency switcher UI). */
  setCurrency: (c: SupportedCurrency) => void;
  /** Update the language preference. */
  setLanguage: (l: SupportedLanguage) => void;
};

// =============================================================================
// Context
// =============================================================================

const LocaleContext = createContext<LocaleState>({
  currency: DEFAULT_CURRENCY,
  language: DEFAULT_LANGUAGE,
  setCurrency: () => {},
  setLanguage: () => {},
});

// =============================================================================
// Provider
// =============================================================================

/**
 * LocaleProvider — wraps the application and provides currency + language
 * preferences to all client components via useLocale().
 *
 * Initialization order:
 * 1. Defaults: BRL / pt
 * 2. Profile preference (loaded from AuthContext when session resolves)
 * 3. User override (stored in localStorage for persistence)
 *
 * Stage 9 contract:
 * - Price display always uses `currency` from this context
 * - formatPrice(brlAmount, currency) handles the conversion
 * - Profile update (PATCH /auth/profile) persists the preference server-side
 */
export function LocaleProvider({ children }: { children: ReactNode }) {
  const { profile } = useAuth();
  const [currency, setCurrencyState] = useState<SupportedCurrency>(DEFAULT_CURRENCY);
  const [language, setLanguageState] = useState<SupportedLanguage>(DEFAULT_LANGUAGE);

  // Hydrate from localStorage on mount
  useEffect(() => {
    try {
      const storedCurrency = localStorage.getItem("dl_currency");
      const storedLanguage = localStorage.getItem("dl_language");
      if (storedCurrency) setCurrencyState(resolvePreferredCurrency(storedCurrency));
      if (storedLanguage) setLanguageState(resolvePreferredLanguage(storedLanguage));
    } catch {
      // localStorage may be unavailable (SSR, privacy mode)
    }
  }, []);

  // Sync from profile once it loads (profile wins over localStorage)
  useEffect(() => {
    if (profile) {
      const profileCurrency = resolvePreferredCurrency(profile.preferredCurrency);
      const profileLanguage = resolvePreferredLanguage(profile.preferredLanguage);
      setCurrencyState(profileCurrency);
      setLanguageState(profileLanguage);
    }
  }, [profile?.preferredCurrency, profile?.preferredLanguage]);

  function setCurrency(c: SupportedCurrency) {
    setCurrencyState(c);
    try { localStorage.setItem("dl_currency", c); } catch { /* ignore */ }
  }

  function setLanguage(l: SupportedLanguage) {
    setLanguageState(l);
    try { localStorage.setItem("dl_language", l); } catch { /* ignore */ }
  }

  return (
    <LocaleContext.Provider value={{ currency, language, setCurrency, setLanguage }}>
      {children}
    </LocaleContext.Provider>
  );
}

// =============================================================================
// Hook
// =============================================================================

/** Primary hook for accessing currency/language preferences in client components. */
export function useLocale(): LocaleState {
  return useContext(LocaleContext);
}
