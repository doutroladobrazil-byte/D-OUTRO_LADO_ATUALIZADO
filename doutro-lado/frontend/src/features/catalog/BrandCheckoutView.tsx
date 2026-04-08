"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import type { Brand, Region } from "@/lib/types";
import { useCartStore } from "@/lib/cart-store";
import { getBackendCart, getShippingRegions } from "@/lib/storefront";
import { createClient } from "@/lib/supabase/client";
import { GlassCard } from "@/components/ui/GlassCard";
import { Button } from "@/components/ui/Button";
import { PriceDisplay } from "@/components/ui/PriceDisplay";
import { useLocale } from "@/contexts/LocaleContext";
import { REGION_DEFAULT_CURRENCY } from "@/lib/i18n";

type Props = { brand: Brand };

const REGION_LABELS: Record<Region, string> = {
  "North America": "América do Norte",
  "Europe": "Europa",
  "Middle East": "Oriente Médio",
};

export function BrandCheckoutView({ brand }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const status = searchParams.get("status");
  const { currency, setCurrency } = useLocale();

  const getCart = useCartStore((s) => s.getCart);
  const clearCart = useCartStore((s) => s.clearCart);
  const setCart = useCartStore((s) => s.setCart);
  const cart = getCart(brand);

  const [regions, setRegions] = useState<Region[]>([]);
  const [selectedRegion, setSelectedRegion] = useState<Region | "">("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getShippingRegions().then((r) => {
      setRegions(r);
      if (r.length > 0 && !selectedRegion) setSelectedRegion(r[0]);
    });
  }, []);

  // Hydrate cart from backend on mount when authenticated.
  // Ensures the checkout summary is consistent with the server cart even when
  // the user navigates here directly (without visiting the cart page first).
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

  // Auto-switch display currency when region changes
  useEffect(() => {
    if (selectedRegion) {
      const regionCurrency = REGION_DEFAULT_CURRENCY[selectedRegion];
      if (regionCurrency) setCurrency(regionCurrency);
    }
  }, [selectedRegion]);

  // Clear local cart once backend confirms payment (webhook does the rest)
  useEffect(() => {
    if (status === "success") {
      clearCart(brand);
    }
  }, [status, brand, clearCart]);

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
        <p className="text-white/55">Pagamento cancelado. Seu carrinho foi preservado.</p>
        <button
          onClick={() => router.push(`/brands/${brand}/cart`)}
          className="rounded-full border border-white/15 px-6 py-3 text-sm uppercase tracking-[0.18em] text-white/70 hover:text-white"
        >
          Voltar ao carrinho
        </button>
      </div>
    );
  }

  // ── Empty cart guard ─────────────────────────────────────────────────────────
  if (cart.items.length === 0) {
    return (
      <div className="flex min-h-[40vh] flex-col items-center justify-center gap-6 text-center">
        <p className="text-white/55">Nenhum item no carrinho.</p>
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
    if (!selectedRegion) return;
    setSubmitting(true);
    setError(null);

    const apiBase = process.env.NEXT_PUBLIC_API_URL ?? "/api";

    // Read Supabase session token for auth
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
      // guest checkout not supported (auth required by backend)
    }

    if (!token) {
      setError("Faça login para finalizar o pedido.");
      setSubmitting(false);
      return;
    }

    const payload = {
      brand,
      region: selectedRegion,
      currency,  // send the user's display currency preference to order metadata
      items: cart.items.map((i) => ({ productSlug: i.productSlug, quantity: i.quantity })),
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
      // Redirect to Stripe hosted checkout
      window.location.href = data.checkoutUrl;
    } else {
      // Mock mode — simulate success
      clearCart(brand);
      router.push(`/brands/${brand}/checkout?status=success`);
    }
  }

  const freightEstimate = selectedRegion
    ? `Calculado para ${REGION_LABELS[selectedRegion as Region] ?? selectedRegion}`
    : "Selecione a região";

  return (
    <div className="grid gap-8 xl:grid-cols-[1fr_0.45fr]">
      {/* Left — region selection */}
      <div className="space-y-6">
        <GlassCard className="space-y-6">
          <h2 className="font-display text-[28px] tracking-[-0.4px] text-white">Entrega internacional</h2>
          <div className="space-y-3">
            <label className="text-[12px] uppercase tracking-[0.24em] text-white/50">Região de destino</label>
            <div className="grid gap-3 sm:grid-cols-3">
              {regions.map((region) => (
                <button
                  key={region}
                  onClick={() => setSelectedRegion(region)}
                  className={`rounded-[16px] border px-4 py-4 text-left text-sm transition-all ${
                    selectedRegion === region
                      ? "border-[#C6A96B]/60 bg-[rgba(198,169,107,0.08)] text-white"
                      : "border-white/10 bg-white/[0.03] text-white/55 hover:border-white/20"
                  }`}
                >
                  {REGION_LABELS[region] ?? region}
                </button>
              ))}
            </div>
          </div>
          <div className="rounded-[16px] border border-white/8 bg-black/20 p-4 text-sm text-white/55">
            O valor do frete é calculado deterministicamente por faixa de peso do pedido. Será exibido
            no resumo do Stripe antes da confirmação do pagamento.
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
          <div className="flex justify-between text-sm text-white/55">
            <span>Subtotal</span>
            <PriceDisplay brl={cart.subtotalBRL} />
          </div>
          <div className="flex justify-between text-sm text-white/55">
            <span>Frete</span>
            <span>{freightEstimate}</span>
          </div>
        </div>

        {error && (
          <div className="rounded-[14px] border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
            {error}
          </div>
        )}

        <Button
          onClick={handleCheckout}
          disabled={submitting || !selectedRegion}
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
