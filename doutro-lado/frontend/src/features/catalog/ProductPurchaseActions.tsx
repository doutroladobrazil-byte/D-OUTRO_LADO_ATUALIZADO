"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useCartStore } from "@/lib/cart-store";
import { createClient } from "@/lib/supabase/client";
import { syncCartItemToBackend } from "@/lib/storefront";
import { useCountryPreference } from "@/hooks/useCountryPreference";
import type { Brand, WeightRange } from "@/lib/types";

type ProductForCart = {
  id: string;
  slug: string;
  name: string;
  sku: string;
  retailPriceBRL: number;
  weightRange: WeightRange;
  stock: number;
};

type Props = {
  product: ProductForCart;
  activeBrand: Brand;
  cartHref: string;
  checkoutHref: string;
};

/**
 * Client-side purchase CTAs for the PDP.
 * Isolated so the parent page remains a server component.
 *
 * Behaviour:
 *   - Local Zustand cart is updated immediately (optimistic UX).
 *   - If the user is authenticated, the backend cart is synced via PUT /cart/items.
 *     Backend response replaces the local cart (single source of truth for auth users).
 *   - Navigation happens immediately after the local update — sync is fire-and-forget.
 *
 * "Adicionar ao carrinho" → add 1 unit → navigate to cart.
 * "Comprar agora"        → add 1 unit → navigate to checkout.
 * "Favoritar"            → preserved as no-op (future batch).
 */
export function ProductPurchaseActions({
  product,
  activeBrand,
  cartHref,
  checkoutHref,
}: Props) {
  const addItem = useCartStore((s) => s.addItem);
  const setCart = useCartStore((s) => s.setCart);
  const router = useRouter();
  const { countryCode } = useCountryPreference();
  const [availableForCountry, setAvailableForCountry] = useState<boolean | null>(null);

  // Check availability client-side when a country preference is stored.
  useEffect(() => {
    if (!countryCode) {
      setAvailableForCountry(null);
      return;
    }
    const base = process.env.NEXT_PUBLIC_API_URL ?? "/api";
    fetch(`${base}/products/${product.slug}?countryCode=${countryCode}`)
      .then((r) => r.json())
      .then((j) => {
        const avail = j?.data?.availableForCountry;
        setAvailableForCountry(typeof avail === "boolean" ? avail : null);
      })
      .catch(() => setAvailableForCountry(null));
  }, [countryCode, product.slug]);

  function buildCartItem() {
    return {
      productId: product.id,
      productSlug: product.slug,
      productName: product.name,
      sku: product.sku,
      brand: activeBrand,
      quantity: 1,
      unitPriceBRL: product.retailPriceBRL,
      weightRange: product.weightRange,
      stock: product.stock,
    };
  }

  /** Fire-and-forget backend sync — does not block navigation. */
  async function syncToBackend() {
    try {
      const supabase = createClient();
      const { data } = await supabase.auth.getSession();
      const token = data.session?.access_token ?? null;
      if (!token) return;
      const serverCart = await syncCartItemToBackend(activeBrand, product.slug, 1, token);
      if (serverCart) setCart(activeBrand, serverCart);
    } catch {
      // Sync failure is non-fatal — local Zustand cart is already updated.
    }
  }

  function handleAddToCart() {
    addItem(activeBrand, buildCartItem());
    syncToBackend();
    router.push(cartHref);
  }

  function handleBuyNow() {
    addItem(activeBrand, buildCartItem());
    syncToBackend();
    router.push(checkoutHref);
  }

  const unavailable = availableForCountry === false;

  return (
    <div className="space-y-4">
      {unavailable && (
        <div className="rounded-xl border border-red-400/25 bg-red-400/10 px-4 py-3 text-sm text-red-300">
          Not available for delivery to your selected country.
        </div>
      )}
      <div className="grid gap-3 sm:grid-cols-2">
        <button
          onClick={handleAddToCart}
          disabled={unavailable}
          className="rounded-full border border-gold bg-gold px-5 py-4 text-center text-sm uppercase tracking-[0.18em] text-black transition duration-300 hover:-translate-y-0.5 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:translate-y-0"
        >
          Adicionar ao carrinho
        </button>
        <button
          onClick={handleBuyNow}
          disabled={unavailable}
          className="rounded-full border border-black/15 bg-black/8 px-5 py-4 text-center text-sm uppercase tracking-[0.18em] text-[#17120d] transition duration-300 hover:-translate-y-0.5 hover:bg-black/14 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:translate-y-0"
        >
          Comprar agora
        </button>
      </div>
      {/* Trust signals */}
      <div className="grid grid-cols-2 gap-x-4 gap-y-2 pt-1">
        {[
          { icon: "🔒", text: "Secure checkout" },
          { icon: "🌍", text: "International shipping" },
          { icon: "↩", text: "Returns by policy" },
          { icon: "✦", text: "Brazilian leather" },
        ].map((item) => (
          <div key={item.text} className="flex items-center gap-1.5 text-[11px] text-black/45">
            <span className="text-[13px]" aria-hidden>{item.icon}</span>
            {item.text}
          </div>
        ))}
      </div>
    </div>
  );
}
