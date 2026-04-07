"use client";

import { useLocale } from "@/contexts/LocaleContext";
import {
  ADMIN_CURRENCY,
  formatPrice,
  formatRateContext,
  type SupportedCurrency,
} from "@/lib/i18n";

// =============================================================================
// PriceDisplay — universal price display component
// =============================================================================
//
// Usage:
//   <PriceDisplay brl={product.retailPriceBRL} />         // uses locale currency
//   <PriceDisplay brl={product.retailPriceBRL} admin />   // always BRL (admin panel)
//   <PriceDisplay brl={product.retailPriceBRL} currency="USD" /> // explicit override
//
// Contract:
//   - brl prop is always the canonical BRL amount from the database
//   - currency/locale context handles conversion and display formatting
//   - No component should concatenate "R$ " directly anymore
// =============================================================================

type Props = {
  /** The price amount in BRL (canonical database currency). Always required. */
  brl: number;
  /** Force a specific currency, bypassing the locale context. */
  currency?: SupportedCurrency;
  /** If true, always renders in BRL (for admin backoffice). */
  admin?: boolean;
  /** Additional className for the wrapper span. */
  className?: string;
  /** Whether to show the exchange rate context (e.g. "1 USD ≈ R$ 5.55"). */
  showRateContext?: boolean;
};

export function PriceDisplay({
  brl,
  currency,
  admin = false,
  className,
  showRateContext = false,
}: Props) {
  const { currency: localeCurrency } = useLocale();
  const displayCurrency = admin ? ADMIN_CURRENCY : (currency ?? localeCurrency);
  const formatted = formatPrice(brl, displayCurrency);
  const rateContext = showRateContext ? formatRateContext(displayCurrency) : "";

  return (
    <span className={className}>
      {formatted}
      {rateContext && (
        <span className="ml-2 text-[11px] text-white/35">{rateContext}</span>
      )}
    </span>
  );
}

// =============================================================================
// CurrencySwitcher — UI control to change display currency
// =============================================================================

import { SUPPORTED_CURRENCIES, CURRENCY_SYMBOL } from "@/lib/i18n";

export function CurrencySwitcher({ className }: { className?: string }) {
  const { currency, setCurrency } = useLocale();

  return (
    <div className={`flex items-center gap-1.5 ${className ?? ""}`}>
      {SUPPORTED_CURRENCIES.map((c) => (
        <button
          key={c}
          onClick={() => setCurrency(c)}
          className={`rounded-full border px-2.5 py-1 text-[11px] uppercase tracking-[0.18em] transition-all ${
            currency === c
              ? "border-[#C6A96B]/50 bg-[#C6A96B]/10 text-[#C6A96B]"
              : "border-white/12 text-white/40 hover:border-white/25 hover:text-white/65"
          }`}
          title={`Exibir preços em ${c}`}
        >
          {CURRENCY_SYMBOL[c]}
        </button>
      ))}
    </div>
  );
}
