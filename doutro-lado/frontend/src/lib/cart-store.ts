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
import type { Brand, Cart, CartItemLine, GiftKitCartItem } from "@/lib/types";

// =============================================================================
// Zustand store
// =============================================================================

type BrandCartState = {
  cart: Cart;
  kitItems: GiftKitCartItem[];
};

type CartState = {
  carts: Partial<Record<Brand, BrandCartState>>;
  getCart: (brand: Brand) => Cart;
  getKitItems: (brand: Brand) => GiftKitCartItem[];
  addItem: (brand: Brand, item: Omit<CartItemLine, "lineTotalBRL">) => void;
  updateQuantity: (brand: Brand, productSlug: string, qty: number) => void;
  removeItem: (brand: Brand, productSlug: string) => void;
  addKit: (brand: Brand, kit: GiftKitCartItem) => void;
  removeKit: (brand: Brand, kitId: string) => void;
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

function emptyBrandState(brand: Brand): BrandCartState {
  return { cart: emptyCart(brand), kitItems: [] };
}

function recalculate(items: CartItemLine[]): number {
  return Number(items.reduce((s, i) => s + i.lineTotalBRL, 0).toFixed(2));
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      carts: {},

      getCart: (brand) => get().carts[brand]?.cart ?? emptyCart(brand),

      getKitItems: (brand) => get().carts[brand]?.kitItems ?? [],

      addItem: (brand, rawItem) => {
        set((state) => {
          const bs = state.carts[brand] ?? emptyBrandState(brand);
          const cart = bs.cart;
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
              [brand]: { ...bs, cart: { ...cart, items, subtotalBRL: recalculate(items) } },
            },
          };
        });
      },

      updateQuantity: (brand, productSlug, qty) => {
        set((state) => {
          const bs = state.carts[brand] ?? emptyBrandState(brand);
          const cart = bs.cart;
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
              [brand]: { ...bs, cart: { ...cart, items, subtotalBRL: recalculate(items) } },
            },
          };
        });
      },

      removeItem: (brand, productSlug) => {
        set((state) => {
          const bs = state.carts[brand] ?? emptyBrandState(brand);
          const cart = bs.cart;
          const items = cart.items.filter((i) => i.productSlug !== productSlug);
          return {
            carts: {
              ...state.carts,
              [brand]: { ...bs, cart: { ...cart, items, subtotalBRL: recalculate(items) } },
            },
          };
        });
      },

      addKit: (brand, kit) => {
        set((state) => {
          const bs = state.carts[brand] ?? emptyBrandState(brand);
          const existing = bs.kitItems.find((k) => k.kitId === kit.kitId);
          const kitItems = existing
            ? bs.kitItems.map((k) =>
                k.kitId === kit.kitId ? { ...k, quantity: k.quantity + kit.quantity } : k
              )
            : [...bs.kitItems, kit];
          return { carts: { ...state.carts, [brand]: { ...bs, kitItems } } };
        });
      },

      removeKit: (brand, kitId) => {
        set((state) => {
          const bs = state.carts[brand] ?? emptyBrandState(brand);
          const kitItems = bs.kitItems.filter((k) => k.kitId !== kitId);
          return { carts: { ...state.carts, [brand]: { ...bs, kitItems } } };
        });
      },

      setCart: (brand, cart) => {
        set((state) => {
          const bs = state.carts[brand] ?? emptyBrandState(brand);
          return { carts: { ...state.carts, [brand]: { ...bs, cart } } };
        });
      },

      clearCart: (brand) => {
        set((state) => ({
          carts: { ...state.carts, [brand]: emptyBrandState(brand) },
        }));
      },

      totalItems: (brand) => {
        const bs = get().carts[brand];
        const productQty = (bs?.cart.items ?? []).reduce((s, i) => s + i.quantity, 0);
        const kitQty = (bs?.kitItems ?? []).reduce((s, k) => s + k.quantity, 0);
        return productQty + kitQty;
      },
    }),
    {
      name: "doutro-lado-cart",
      version: 2, // bumped when cart state shape changed to include kitItems
    }
  )
);
