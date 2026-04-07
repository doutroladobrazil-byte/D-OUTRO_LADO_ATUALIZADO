"use client";

/**
 * Client-side cart store (Stage 7)
 * 
 * Architecture:
 * - One cart per brand, stored in localStorage for guests.
 * - On checkout, the cart items are sent to the backend to create the order.
 * - Implements the same brand isolation rule as the backend.
 * - When the user is authenticated, the server cart is the source of truth.
 *   The local state mirrors it for optimistic UX.
 */

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Brand, Cart, CartItemLine } from "@/lib/types";

// =============================================================================
// Zustand store
// =============================================================================

type CartState = {
  carts: Partial<Record<Brand, Cart>>;
  getCart: (brand: Brand) => Cart;
  addItem: (brand: Brand, item: Omit<CartItemLine, "lineTotalBRL">) => void;
  updateQuantity: (brand: Brand, productSlug: string, qty: number) => void;
  removeItem: (brand: Brand, productSlug: string) => void;
  setCart: (brand: Brand, cart: Cart) => void;
  clearCart: (brand: Brand) => void;
  totalItems: (brand: Brand) => number;
};

function emptyCart(brand: Brand): Cart {
  return {
    id: null,
    profileId: null,
    brand,
    currency: "BRL",
    items: [],
    subtotalBRL: 0,
  };
}

function recalculate(items: CartItemLine[]): number {
  return Number(items.reduce((s, i) => s + i.lineTotalBRL, 0).toFixed(2));
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      carts: {},

      getCart: (brand) => get().carts[brand] ?? emptyCart(brand),

      addItem: (brand, rawItem) => {
        set((state) => {
          const cart = state.carts[brand] ?? emptyCart(brand);
          const existing = cart.items.find((i) => i.productSlug === rawItem.productSlug);
          let items: CartItemLine[];
          if (existing) {
            const newQty = Math.min(existing.quantity + rawItem.quantity, rawItem.stock);
            items = cart.items.map((i) =>
              i.productSlug === rawItem.productSlug
                ? {
                    ...i,
                    quantity: newQty,
                    lineTotalBRL: Number((i.unitPriceBRL * newQty).toFixed(2)),
                  }
                : i
            );
          } else {
            const lineTotalBRL = Number((rawItem.unitPriceBRL * rawItem.quantity).toFixed(2));
            items = [...cart.items, { ...rawItem, lineTotalBRL }];
          }
          return {
            carts: {
              ...state.carts,
              [brand]: { ...cart, items, subtotalBRL: recalculate(items) },
            },
          };
        });
      },

      updateQuantity: (brand, productSlug, qty) => {
        set((state) => {
          const cart = state.carts[brand] ?? emptyCart(brand);
          const items =
            qty <= 0
              ? cart.items.filter((i) => i.productSlug !== productSlug)
              : cart.items.map((i) =>
                  i.productSlug === productSlug
                    ? {
                        ...i,
                        quantity: qty,
                        lineTotalBRL: Number((i.unitPriceBRL * qty).toFixed(2)),
                      }
                    : i
                );
          return {
            carts: {
              ...state.carts,
              [brand]: { ...cart, items, subtotalBRL: recalculate(items) },
            },
          };
        });
      },

      removeItem: (brand, productSlug) => {
        set((state) => {
          const cart = state.carts[brand] ?? emptyCart(brand);
          const items = cart.items.filter((i) => i.productSlug !== productSlug);
          return {
            carts: {
              ...state.carts,
              [brand]: { ...cart, items, subtotalBRL: recalculate(items) },
            },
          };
        });
      },

      setCart: (brand, cart) => {
        set((state) => ({ carts: { ...state.carts, [brand]: cart } }));
      },

      clearCart: (brand) => {
        set((state) => ({
          carts: { ...state.carts, [brand]: emptyCart(brand) },
        }));
      },

      totalItems: (brand) => {
        return (get().carts[brand]?.items ?? []).reduce((s, i) => s + i.quantity, 0);
      },
    }),
    {
      name: "doutro-lado-cart",
    }
  )
);
