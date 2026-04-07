// =============================================================================
// Cart — domain types (Stage 7)
// =============================================================================

import type { Brand, WeightRange } from "../../types/domain.js";

export type CartItemLine = {
  id: string;           // cart_items.id
  productId: string;
  productSlug: string;
  productName: string;
  sku: string;
  brand: Brand;
  quantity: number;
  unitPriceBRL: number;
  lineTotalBRL: number;
  weightRange: WeightRange;
  stock: number;        // for UI validation
};

export type Cart = {
  id: string;
  profileId: string | null;
  brand: Brand;
  currency: string;
  items: CartItemLine[];
  subtotalBRL: number;
  createdAt: string;
  updatedAt: string;
};

// =============================================================================
// Input contracts
// =============================================================================

export type UpsertCartItemInput = {
  brand: Brand;
  productSlug: string;
  quantity: number;     // desired final quantity (0 = remove)
};
