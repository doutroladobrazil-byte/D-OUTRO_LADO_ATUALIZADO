"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import type { BagSimulationResult, Brand, CountryCode, SupportedCountry } from "@/lib/types";
import { useCartStore } from "@/lib/cart-store";
import { getActiveCountries, getBackendCart, simulateBag } from "@/lib/storefront";
import { createClient } from "@/lib/supabase/client";
import { GlassCard } from "@/components/ui/GlassCard";
import { Button } from "@/components/ui/Button";
import { PriceDisplay } from "@/components/ui/PriceDisplay";
import { useLocale } from "@/contexts/LocaleContext";
import { COUNTRY_DEFAULT_CURRENCY } from "@/lib/i18n";
import { useCountryPreference } from "@/hooks/useCountryPreference";

type Props = { brand: Brand };

/** Country flag emojis for the 6 MVP destinations. */
const COUNTRY_FLAGS: Record<CountryCode, string> = {
  US: "🇺🇸",
  CH: "🇨🇭",
  IE: "🇮🇪",
  DE: "🇩🇪",
  IS: "🇮🇸",
  SG: "🇸🇬",
};

export function BrandCheckoutView({ brand }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const status = searchParams.get("status");
  const { currency, setCurrency } = useLocale();

  const offerCode = searchParams.get("offerCode") ?? undefined;

  const getCart = useCartStore((s) => s.getCart);
  const getKitItems = useCartStore((s) => s.getKitItems);
  const clearCart = useCartStore((s) => s.clearCart);
  const setCart = useCartStore((s) => s.setCart);
  const cart = getCart(brand);
  const kitItems = getKitItems(brand);

  const { setCountryCode: persistCountryCode } = useCountryPreference();

  const [countries, setCountries] = useState<SupportedCountry[]>([]);
  const [selectedCountry, setSelectedCountry] = useState<CountryCode | "">("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sim, setSim] = useState<BagSimulationResult | null>(null);
  const [simLoading, setSimLoading] = useState(false);

  useEffect(() => {
    getActiveCountries().then((list) => {
      const active = list.filter((c) => c.checkoutEnabled);
      setCountries(active);
      if (active.length > 0 && !selectedCountry) {
        setSelectedCountry(active[0].code);
      }
    });
  }, []);

  // Hydrate cart from backend on mount when authenticated.
  useEffect(() => {
    async function hydrate() {
      const supabase = createClient();
      const { data } = await supabase.auth.getSession();
      const token = data.session?.access_token ?? null;
      if (!token) return;
      const serverCart = await getBackendCart(brand, token);
      if (serverCart) setCart(brand, serverCart);
    }
    hydrate();
  }, [brand]);

  // Auto-switch display currency and persist country preference when country changes.
  useEffect(() => {
    if (selectedCountry) {
      const countryCurrency = COUNTRY_DEFAULT_CURRENCY[selectedCountry as CountryCode];
      if (countryCurrency) setCurrency(countryCurrency);
      persistCountryCode(selectedCountry as CountryCode);
    }
  }, [selectedCountry]);

  // Clear local cart once backend confirms payment.
  useEffect(() => {
    if (status === "success") clearCart(brand);
  }, [status, brand, clearCart]);

  // Re-simulate whenever country, currency, cart items, kit items, or offerCode change.
  useEffect(() => {
    if (!selectedCountry || (cart.items.length === 0 && kitItems.length === 0)) {
      setSim(null);
      return;
    }

    let cancelled = false;
    setSimLoading(true);

    async function runSim() {
      const supabase = createClient();
      const { data } = await supabase.auth.getSession();
      const token = data.session?.access_token ?? undefined;

      const result = await simulateBag(
        {
          countryCode: selectedCountry as CountryCode,
          currency,
          items: [
            ...cart.items.map((i) => ({
              type: "product" as const,
              productSlug: i.productSlug,
              quantity: i.quantity,
            })),
            ...kitItems.map((k) => ({
              type: "gift_kit" as const,
              kitId: k.kitId,
              quantity: k.quantity,
            })),
          ],
          offerCode,
        },
        token
      );
      if (!cancelled) {
        setSim(result);
        setSimLoading(false);
      }
    }

    runSim();
    return () => { cancelled = true; };
  }, [selectedCountry, currency, cart.items, kitItems, offerCode]);

  // ── Success state ──────────────────────────────────────────────────────────
  if (status === "success") {
    return (
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex min-h-[55vh] flex-col items-center justify-center gap-8 rounded-[28px] border border-[#C6A96B]/25 bg-[linear-gradient(160deg,rgba(198,169,107,0.08),rgba(0,0,0,0.7))] px-8 py-16 text-center"
      >
        <div className="flex size-16 items-center justify-center rounded-full border border-[#C6A96B]/40 bg-[#C6A96B]/10">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#C6A96B" strokeWidth="2">
            <path d="M20 6L9 17l-5-5" />
          </svg>
        </div>
        <div>
          <p className="text-[12px] uppercase tracking-[0.3em] text-[#C6A96B]/70">Pedido confirmado</p>
          <h2 className="mt-3 font-display text-[36px] leading-[1.05] tracking-[-0.5px] text-white">
            Obrigado pela sua compra.
          </h2>
          <p className="mt-4 text-sm text-white/55">
            Você receberá um email de confirmação em breve. Acompanhe o status em Minha Conta.
          </p>
        </div>
        <button
          onClick={() => router.push(`/brands/${brand}`)}
          className="rounded-full border border-white/15 px-8 py-3 text-sm uppercase tracking-[0.18em] text-white/70 hover:text-white"
        >
          Continuar explorando
        </button>
      </motion.div>
    );
  }

  // ── Cancelled state ─────────────────────────────────────────────────────────
  if (status === "cancelled") {
    return (
      <div className="flex min-h-[40vh] flex-col items-center justify-center gap-6 text-center">
        <p className="text-white/55">Pagamento cancelado. Sua bag foi preservada.</p>
        <button
          onClick={() => router.push(`/brands/${brand}/cart`)}
          className="rounded-full border border-white/15 px-6 py-3 text-sm uppercase tracking-[0.18em] text-white/70 hover:text-white"
        >
          Voltar à bag
        </button>
      </div>
    );
  }

  // ── Empty cart guard ─────────────────────────────────────────────────────────
  if (cart.items.length === 0 && kitItems.length === 0) {
    return (
      <div className="flex min-h-[40vh] flex-col items-center justify-center gap-6 text-center">
        <p className="text-white/55">Nenhum item na bag.</p>
        <button
          onClick={() => router.push(`/categories/${brand}`)}
          className="rounded-full border border-[#C6A96B]/60 px-6 py-3 text-sm uppercase tracking-[0.18em] text-[#C6A96B] hover:-translate-y-0.5 transition"
        >
          Ver coleção
        </button>
      </div>
    );
  }

  // ── Checkout form ───────────────────────────────────────────────────────────
  async function handleCheckout() {
    if (!selectedCountry) return;

    // Block checkout if simulation shows invalid bag
    if (sim !== null && !sim.isValid) {
      setError(sim.blockingIssues[0] ?? "Bag inválida. Revise os itens antes de continuar.");
      return;
    }

    setSubmitting(true);
    setError(null);

    const apiBase = process.env.NEXT_PUBLIC_API_URL ?? "/api";

    let token: string | null = null;
    try {
      const { createBrowserClient } = await import("@supabase/ssr");
      const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL ?? "",
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? ""
      );
      const { data } = await supabase.auth.getSession();
      token = data.session?.access_token ?? null;
    } catch {
      // auth not available
    }

    if (!token) {
      setError("Faça login para finalizar o pedido.");
      setSubmitting(false);
      return;
    }

    const payload = {
      brand,
      countryCode: selectedCountry,
      currency,
      items: cart.items.map((i) => ({ productSlug: i.productSlug, quantity: i.quantity })),
      kitItems: kitItems.map((k) => ({ kitId: k.kitId, quantity: k.quantity })),
      offerCode: offerCode ?? undefined,
    };

    const res = await fetch(`${apiBase}/stripe/checkout`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    });

    setSubmitting(false);

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      setError(err.message ?? "Erro ao iniciar o pagamento.");
      return;
    }

    const { data } = await res.json();

    if (data.mode === "stripe" && data.checkoutUrl) {
      window.location.href = data.checkoutUrl;
    } else {
      clearCart(brand);
      router.push(`/brands/${brand}/checkout?status=success`);
    }
  }

  // Total to display: simulation result when available, fallback to local subtotal.
  const kitSubtotalBRL = kitItems.reduce((s, k) => s + k.totalBRL * k.quantity, 0);
  const displayTotalBRL = sim?.totals.adjustedFinalTotalBRL ?? (cart.subtotalBRL + kitSubtotalBRL);
  const hasBlockingIssues = sim !== null && !sim.isValid && sim.blockingIssues.length > 0;
  const appliedOffer = sim?.appliedOffer ?? null;
  const checkoutBlocked = submitting || !selectedCountry || simLoading || (sim !== null && !sim.isValid);

  return (
    <div className="grid gap-8 xl:grid-cols-[1fr_0.45fr]">
      {/* Left — country selection */}
      <div className="space-y-6">
        <GlassCard className="space-y-6">
          <h2 className="font-display text-[28px] tracking-[-0.4px] text-white">Entrega internacional</h2>
          <div className="space-y-3">
            <label className="text-[12px] uppercase tracking-[0.24em] text-white/50">País de destino</label>
            {countries.length === 0 ? (
              <p className="text-sm text-white/30">Carregando países disponíveis…</p>
            ) : (
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {countries.map((country) => (
                  <button
                    key={country.code}
                    onClick={() => setSelectedCountry(country.code)}
                    className={`flex items-center gap-3 rounded-[16px] border px-4 py-4 text-left text-sm transition-all ${
                      selectedCountry === country.code
                        ? "border-[#C6A96B]/60 bg-[rgba(198,169,107,0.08)] text-white"
                        : "border-white/10 bg-white/[0.03] text-white/55 hover:border-white/20"
                    }`}
                  >
                    <span className="text-xl leading-none" aria-hidden>
                      {COUNTRY_FLAGS[country.code] ?? "🌐"}
                    </span>
                    <span className="truncate">{country.name}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
          <div className="rounded-[16px] border border-white/8 bg-black/20 p-4 text-sm text-white/55">
            Entrega com rastreamento internacional. O total exibido já inclui frete, impostos e encargos.
          </div>
        </GlassCard>
      </div>

      {/* Right — order summary */}
      <GlassCard className="h-fit space-y-5">
        <p className="text-[12px] uppercase tracking-[0.28em] text-white/45">Resumo do pedido</p>

        <div className="space-y-3">
          {cart.items.map((item) => (
            <div key={item.productSlug} className="flex items-center justify-between text-sm">
              <span className="truncate text-white/70">
                {item.productName} × {item.quantity}
              </span>
              <PriceDisplay brl={item.lineTotalBRL} className="shrink-0 text-white" />
            </div>
          ))}
        </div>

        <div className="border-t border-white/10 pt-4 space-y-3">
          <div className="flex justify-between text-sm">
            <span className="text-white/55">Total</span>
            {simLoading ? (
              <span className="text-white/30 text-xs">calculando…</span>
            ) : (
              <PriceDisplay brl={displayTotalBRL} className="font-semibold text-white" />
            )}
          </div>
        </div>

        {appliedOffer && (
          <div className="rounded-[14px] border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-300">
            Desconto <strong>{appliedOffer.discountPercent}%</strong> aplicado (código <strong>{appliedOffer.code}</strong>)
          </div>
        )}

        {hasBlockingIssues && (
          <div className="rounded-[14px] border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-300">
            {sim!.blockingIssues[0]}
          </div>
        )}

        {error && (
          <div className="rounded-[14px] border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
            {error}
          </div>
        )}

        <Button
          onClick={handleCheckout}
          disabled={checkoutBlocked}
          className="w-full"
        >
          {submitting ? "Redirecionando..." : "Ir para pagamento"}
        </Button>

        <p className="text-center text-[11px] text-white/30">
          Pagamento seguro via Stripe. Seus dados não são armazenados.
        </p>
      </GlassCard>
    </div>
  );
}
