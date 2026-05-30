"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useCartStore } from "@/lib/cart-store";
import { createClient } from "@/lib/supabase/client";
import { syncCartItemToBackend } from "@/lib/storefront";
import { useCountryPreference } from "@/hooks/useCountryPreference";
import type { Brand, WeightRange } from "@/lib/types";
import type { ProductDictionary } from "@/lib/i18n/product";

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
  dict?: ProductDictionary;
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
  dict,
}: Props) {
  const addItem = useCartStore((s) => s.addItem);
  const setCart = useCartStore((s) => s.setCart);
  const router = useRouter();
  const { countryCode } = useCountryPreference();
  const [availableForCountry, setAvailableForCountry] = useState<boolean | null>(null);

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
        <div className="rounded-xl border border-red-500/25 bg-red-50 px-4 py-3 text-sm text-red-600">
          {dict?.notAvailable ?? "Not available for delivery to your selected destination."}
        </div>
      )}
      <div className="grid gap-3 sm:grid-cols-2">
        <button
          onClick={handleAddToCart}
          disabled={unavailable}
          className="rounded-full border border-leather bg-leather px-5 py-4 text-center text-sm uppercase tracking-[0.18em] text-canvas transition duration-300 hover:-translate-y-0.5 hover:bg-leather/85 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:translate-y-0"
        >
          {dict?.addToCart ?? "Add to cart"}
        </button>
        <button
          onClick={handleBuyNow}
          disabled={unavailable}
          className="rounded-full border border-ink/15 bg-ink/8 px-5 py-4 text-center text-sm uppercase tracking-[0.18em] text-ink transition duration-300 hover:-translate-y-0.5 hover:bg-ink/14 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:translate-y-0"
        >
          {dict?.buyNow ?? "Buy now"}
        </button>
      </div>
      {/* Trust signals */}
      <div className="grid grid-cols-2 gap-x-4 gap-y-2 pt-1">
        {[
          { icon: "🔒", text: dict?.secure ?? "Secure payment" },
          { icon: "🌍", text: dict?.delivery ?? "International delivery" },
          { icon: "↩", text: dict?.returns ?? "Returns by destination" },
          { icon: "✦", text: dict?.leather ?? "Brazilian leather" },
        ].map((item) => (
          <div key={item.text} className="flex items-center gap-1.5 text-[11px] text-ink-mid">
            <span className="text-[13px]" aria-hidden>{item.icon}</span>
            {item.text}
          </div>
        ))}
      </div>
    </div>
  );
}
