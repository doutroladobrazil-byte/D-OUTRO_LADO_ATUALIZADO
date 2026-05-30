"use client";

import { useState } from "react";
import { ShoppingBag, Check } from "lucide-react";
import type { Brand, CartItemLine } from "@/lib/types";
import { useCartStore } from "@/lib/cart-store";

type Props = {
  item: Omit<CartItemLine, "lineTotalBRL" | "id">;
  brand: Brand;
  className?: string;
};

export function AddToCartButton({ item, brand, className }: Props) {
  const addItem = useCartStore((s) => s.addItem);
  const [added, setAdded] = useState(false);

  function handleAdd() {
    addItem(brand, { ...item });
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  }

  return (
    <button
      id={`add-to-cart-${item.productSlug}`}
      onClick={handleAdd}
      className={`flex items-center gap-2 rounded-full border px-5 py-3 text-sm uppercase tracking-[0.18em] transition duration-300 hover:-translate-y-0.5 ${
        added
          ? "border-green-600/50 bg-green-600/10 text-green-700"
          : "border-leather/60 bg-leather/10 text-ink hover:bg-leather/20"
      } ${className ?? ""}`}
    >
      {added ? <Check size={15} /> : <ShoppingBag size={15} />}
      {added ? "Adicionado" : "Adicionar ao carrinho"}
    </button>
  );
}
