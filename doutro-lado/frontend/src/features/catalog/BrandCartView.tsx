"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Trash2, Minus, Plus } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import type { Brand } from "@/lib/types";
import { useCartStore } from "@/lib/cart-store";
import { getBrandCheckoutPath } from "@/lib/brand";
import { GlassCard } from "@/components/ui/GlassCard";
import { PriceDisplay } from "@/components/ui/PriceDisplay";
import { createClient } from "@/lib/supabase/client";
import { getBackendCart, syncCartItemToBackend, removeBackendCartItem } from "@/lib/storefront";

type Props = { brand: Brand };

export function BrandCartView({ brand }: Props) {
  const getCart = useCartStore((s) => s.getCart);
  const updateQuantity = useCartStore((s) => s.updateQuantity);
  const removeItem = useCartStore((s) => s.removeItem);
  const setCart = useCartStore((s) => s.setCart);

  const cart = getCart(brand);
  const isModa = brand === "moda";
  const textClass = isModa ? "text-white" : "text-[#17120d]";
  const subtleClass = isModa ? "text-white/50" : "text-black/50";

  // Auth token — resolved once on mount.
  // Null = guest: only local Zustand cart is used.
  const [authToken, setAuthToken] = useState<string | null>(null);

  // On mount: resolve auth token and hydrate cart from backend when authenticated.
  // Zustand/localStorage provides the immediate render; server cart merges after.
  useEffect(() => {
    async function init() {
      const supabase = createClient();
      const { data } = await supabase.auth.getSession();
      const token = data.session?.access_token ?? null;
      setAuthToken(token);
      if (!token) return;
      const serverCart = await getBackendCart(brand, token);
      if (serverCart) setCart(brand, serverCart);
    }
    init();
  }, [brand]);

  // Quantity change — update local immediately, then sync backend for auth users.
  async function handleUpdateQuantity(productSlug: string, newQty: number) {
    updateQuantity(brand, productSlug, newQty);
    if (!authToken) return;
    // qty ≤ 0 means removal; backend PUT requires min=1 so use DELETE instead
    const serverCart =
      newQty <= 0
        ? await removeBackendCartItem(brand, productSlug, authToken)
        : await syncCartItemToBackend(brand, productSlug, newQty, authToken);
    if (serverCart) setCart(brand, serverCart);
  }

  // Item removal — update local immediately, then sync backend for auth users.
  async function handleRemoveItem(productSlug: string) {
    removeItem(brand, productSlug);
    if (!authToken) return;
    const serverCart = await removeBackendCartItem(brand, productSlug, authToken);
    if (serverCart) setCart(brand, serverCart);
  }

  if (cart.items.length === 0) {
    return (
      <div className="flex min-h-[40vh] flex-col items-center justify-center gap-6 px-4 py-20 text-center">
        <p className={`text-[14px] ${subtleClass}`}>Seu carrinho está vazio.</p>
        <Link
          href={`/categories/${brand}`}
          className="rounded-full border border-[#C6A96B]/60 px-6 py-3 text-sm uppercase tracking-[0.18em] text-[#C6A96B] transition hover:-translate-y-0.5"
        >
          Explorar coleção
        </Link>
      </div>
    );
  }

  return (
    <div className="grid gap-8 xl:grid-cols-[1fr_0.42fr]">
      {/* Items list */}
      <div className="space-y-4">
        <AnimatePresence>
          {cart.items.map((item) => (
            <motion.div
              key={item.productSlug}
              layout
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="flex items-center justify-between gap-5 rounded-[22px] border border-white/10 bg-white/[0.03] p-5"
            >
              <div className="flex items-center gap-5">
                <div className="h-20 w-16 shrink-0 rounded-[16px] bg-[linear-gradient(135deg,rgba(255,255,255,0.1),rgba(0,0,0,0.7))]" />
                <div>
                  <p className={`font-medium ${textClass}`}>{item.productName}</p>
                  <p className={`mt-1 text-[12px] uppercase tracking-wider ${subtleClass}`}>{item.sku}</p>
                </div>
              </div>

              <div className="flex shrink-0 items-center gap-4">
                {/* Qty controls */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleUpdateQuantity(item.productSlug, item.quantity - 1)}
                    className={`flex size-7 items-center justify-center rounded-full border border-white/15 ${subtleClass} hover:text-white`}
                  >
                    <Minus size={12} />
                  </button>
                  <span className={`w-4 text-center text-sm ${textClass}`}>{item.quantity}</span>
                  <button
                    onClick={() =>
                      handleUpdateQuantity(item.productSlug, Math.min(item.quantity + 1, item.stock))
                    }
                    className={`flex size-7 items-center justify-center rounded-full border border-white/15 ${subtleClass} hover:text-white`}
                  >
                    <Plus size={12} />
                  </button>
                </div>

                <PriceDisplay
                  brl={item.lineTotalBRL}
                  className={`min-w-[80px] text-right text-sm font-medium ${textClass}`}
                />

                <button
                  onClick={() => handleRemoveItem(item.productSlug)}
                  className="text-red-400/50 hover:text-red-400"
                  aria-label={`Remover ${item.productName}`}
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Summary */}
      <GlassCard className="h-fit space-y-5">
        <div className="flex items-center justify-between text-sm text-white/55">
          <span>Subtotal ({cart.items.reduce((s, i) => s + i.quantity, 0)} itens)</span>
          <PriceDisplay brl={cart.subtotalBRL} className="font-medium text-white" />
        </div>
        <div className="flex items-center justify-between text-sm text-white/55">
          <span>Frete</span>
          <span>Calculado no checkout</span>
        </div>
        <div className="border-t border-white/10 pt-4">
          <Link
            href={getBrandCheckoutPath(brand)}
            className="block rounded-full border border-[#C6A96B] bg-[#C6A96B] px-5 py-4 text-center text-sm uppercase tracking-[0.18em] text-black transition duration-300 hover:-translate-y-0.5"
          >
            Checkout
          </Link>
        </div>
        <Link
          href={`/categories/${brand}`}
          className="block text-center text-[12px] text-white/35 underline-offset-2 hover:text-white/60 hover:underline"
        >
          Continuar comprando
        </Link>
      </GlassCard>
    </div>
  );
}
