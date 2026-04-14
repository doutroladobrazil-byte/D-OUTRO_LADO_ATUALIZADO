import type { Region, WeightRange } from "../../types/domain.js";
import type { SupportedCurrency } from "../../services/i18n.service.js";

// =============================================================================
// Bag Simulation — Request contract
// =============================================================================

export type BagProductItemInput = {
  type: "product";
  productSlug: string;
  quantity: number;
};

export type BagGiftKitItemInput = {
  type: "gift_kit";
  /** UUID of a saved gift_kit row. */
  kitId: string;
  quantity: number;
};

export type BagItemInput = BagProductItemInput | BagGiftKitItemInput;

export type BagSimulateRequest = {
  region: Region;
  currency: SupportedCurrency;
  items: BagItemInput[];
  /** Optional recovery offer code — validated and applied as discount if valid. */
  offerCode?: string;
};

// =============================================================================
// Bag Simulation — Response contract
// =============================================================================

export type BagSimulatedItem = {
  type: "product";
  productSlug: string;
  productName: string;
  sku: string;
  quantity: number;
  unitPriceBRL: number;
  lineTotalBRL: number;
  weightRange: WeightRange;
  stock: number;
  /** false when quantity > stock (still included in items for UI feedback) */
  available: boolean;
};

export type BagSimulatedKitItem = {
  type: "gift_kit";
  kitId: string;
  kitName: string;
  brand: string;
  quantity: number;
  /** All-in kit total in BRL (subtotal + packaging surcharge) */
  lineTotalBRL: number;
  weightRange: WeightRange;
  /** Composite weight range of all kit items. */
  available: boolean;
};

export type BagTotals = {
  subtotalBRL: number;
  /** Freight is embedded in finalTotalBRL — exposed here for internal audit only. */
  embeddedFreightBRL: number;
  /** Regional tax component — zero if no rule configured. */
  embeddedTaxBRL: number;
  /** Logistics surcharge component — zero if no rule configured. */
  embeddedLogisticsBRL: number;
  /** Margin component applied on top of (subtotal + freight + tax + logistics). */
  embeddedMarginBRL: number;
  /** All-in total BEFORE discount in BRL (canonical). */
  finalTotalBRL: number;
  /** Discount amount in BRL — zero if no offer applied. */
  discountBRL: number;
  /** Final total after discount in BRL. */
  adjustedFinalTotalBRL: number;
  displayCurrency: SupportedCurrency;
  /** adjustedFinalTotalBRL converted to displayCurrency. */
  finalTotalDisplay: number;
};

export type AppliedOffer = {
  code: string;
  discountPercent: number;
  discountBRL: number;
};

export type BagSimulationResult = {
  /** false if any blockingIssues exist — frontend must not proceed to checkout. */
  isValid: boolean;
  /**
   * Destination country code (ISO 3166-1 alpha-2) — set when the simulation
   * was routed via the country-first path (Stage 12). Null for legacy region calls.
   */
  countryCode: string | null;
  region: Region;
  currency: SupportedCurrency;
  /**
   * Deterministic pricing version string.
   * Encodes the rule parameters used, stable across identical inputs.
   * Stored in order metadata for audit.
   */
  pricingVersion: string;
  /**
   * SHA-256 fingerprint of sorted item slugs + quantities (first 16 hex chars).
   * Used for recovery offer scoping — offer is only valid for the cart that
   * generated the abandonment event.
   */
  bagVersionToken: string;
  items: (BagSimulatedItem | BagSimulatedKitItem)[];
  totals: BagTotals;
  /** Non-empty when isValid is false. Human-readable, shown in frontend. */
  blockingIssues: string[];
  /** Present when a valid offer code was applied to this simulation. */
  appliedOffer: AppliedOffer | null;
};

// =============================================================================
// Pricing rule — loaded from bag_pricing_rules table (legacy region-based)
// =============================================================================

export type BagPricingRule = {
  region: Region;
  /** Flat tax component in BRL. Default: 0. */
  taxBRL: number;
  /** Flat logistics surcharge in BRL. Default: 0. */
  logisticsBRL: number;
  /** Margin percentage applied on top of (subtotal + freight + tax + logistics). Default: 0. */
  marginPercent: number;
  isActive: boolean;
};

// =============================================================================
// Country-first pricing rule — Stage 12 (loaded from country_commerce_rules)
// =============================================================================

export type CountryPricingRule = {
  countryCode: string;
  pricingCurrency: SupportedCurrency;
  /** Tax percentage applied to subtotal (e.g. 7.7 for Swiss VAT). */
  taxPercent: number;
  /** Flat BRL logistics surcharge per order. */
  logisticsBRL: number;
  /** Percentage margin on top of (subtotal + freight + tax + logistics). */
  marginPercent: number;
  minimumOrderBrl: number;
  allowGuestCheckout: boolean;
  allowDiscountCodes: boolean;
  estimatedDeliveryMinDays: number;
  estimatedDeliveryMaxDays: number;
  isActive: boolean;
  notes: string | null;
};

// =============================================================================
// Country shipping quote — Stage 12 (from country_shipping_rules)
// =============================================================================

export type CountryShippingQuote = {
  countryCode: string;
  weightRange: WeightRange;
  amountBRL: number;
  carrierLabel: string;
  slaMinDays: number;
  slaMaxDays: number;
};
