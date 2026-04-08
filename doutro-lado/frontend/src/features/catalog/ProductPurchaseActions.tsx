"use client";

import { useRouter } from "next/navigation";
import { useCartStore } from "@/lib/cart-store";
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
 * Isolated so the parent page can remain a server component.
 *
 * "Adicionar ao carrinho" → adds 1 unit to the Zustand cart, navigates to cart.
 * "Comprar agora"        → adds 1 unit to the Zustand cart, navigates to checkout.
 * "Favoritar"            → preserved with no implementation (future batch).
 */
export function ProductPurchaseActions({ product, activeBrand, cartHref, checkoutHref }: Props) {
  const addItem = useCartStore((s) => s.addItem);
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

  function handleAddToCart() {
    addItem(activeBrand, buildCartItem());
    router.push(cartHref);
  }

  function handleBuyNow() {
    addItem(activeBrand, buildCartItem());
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
