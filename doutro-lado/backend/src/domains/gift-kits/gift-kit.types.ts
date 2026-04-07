// =============================================================================
// Gift Kit — domain types (Stage 6)
// =============================================================================

import type { Brand, WeightRange } from "../../types/domain.js";

/**
 * Structured packaging options — not free text.
 * These are the three premium tiers offered by the platform.
 */
export type PackagingType = "standard" | "premium" | "signature";

export const PACKAGING_OPTIONS: Record<PackagingType, { label: string; descriptionPT: string; surchargeMultiplier: number }> = {
  standard: {
    label: "Standard Box",
    descriptionPT: "Caixa com papel de seda e laço simples.",
    surchargeMultiplier: 0,       // no surcharge
  },
  premium: {
    label: "Premium Box",
    descriptionPT: "Caixa rígida com fita de cetim e papel especial.",
    surchargeMultiplier: 0.05,    // +5% of subtotal
  },
  signature: {
    label: "Signature Box",
    descriptionPT: "Caixa artesanal numerada com cartão editorial personalizado.",
    surchargeMultiplier: 0.10,    // +10% of subtotal
  },
};

// =============================================================================
// Input/Output contracts
// =============================================================================

export type GiftKitItemInput = {
  productSlug: string;
  quantity: number;
};

export type CreateGiftKitInput = {
  brand: Brand;
  name: string;
  message?: string;
  packagingType: PackagingType;
  items: GiftKitItemInput[];
};

export type UpdateGiftKitInput = {
  name?: string;
  message?: string | null;
  packagingType?: PackagingType;
  items?: GiftKitItemInput[];
};

// =============================================================================
// Response / computed shapes
// =============================================================================

export type GiftKitItem = {
  id: string;
  productId: string;
  productSlug: string;
  productName: string;
  brand: Brand;
  quantity: number;
  unitPriceBRL: number;
  lineTotalBRL: number;
  weightRange: WeightRange;
};

export type GiftKit = {
  id: string;
  profileId: string | null;
  brand: Brand;
  name: string;
  message: string | null;
  packagingType: PackagingType;
  packagingLabel: string;
  items: GiftKitItem[];
  subtotalBRL: number;
  packagingSurchargeBRL: number;
  totalBRL: number;
  estimatedWeightRange: WeightRange;
  createdAt: string;
  updatedAt: string;
};
