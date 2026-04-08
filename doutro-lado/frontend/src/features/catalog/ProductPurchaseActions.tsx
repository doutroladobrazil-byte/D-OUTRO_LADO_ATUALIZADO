"use client";

import { useRouter } from "next/navigation";
import { useCartStore } from "@/lib/cart-store";
import { createClient } from "@/lib/supabase/client";
import { syncCartItemToBackend } from "@/lib/storefront";
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

  return (
    <div className="grid gap-3 md:grid-cols-3">
      <button
        onClick={handleAddToCart}
        className="rounded-full border border-gold bg-gold px-5 py-4 text-center text-sm uppercase tracking-[0.18em] text-black transition duration-300 hover:-translate-y-0.5"
      >
        Adicionar ao carrinho
      </button>
      <button
        onClick={handleBuyNow}
        className="rounded-full border border-black/10 bg-black/5 px-5 py-4 text-center text-sm uppercase tracking-[0.18em] text-[#17120d] transition duration-300 hover:-translate-y-0.5 hover:bg-black/10"
      >
        Comprar agora
      </button>
      <button className="rounded-full border border-black/10 bg-transparent px-5 py-4 text-sm uppercase tracking-[0.18em] text-[#17120d] transition duration-300 hover:-translate-y-0.5 hover:bg-black/5">
        Favoritar
      </button>
    </div>
  );
}
