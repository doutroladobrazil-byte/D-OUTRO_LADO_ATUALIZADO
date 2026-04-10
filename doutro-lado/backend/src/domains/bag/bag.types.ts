import type { Region, WeightRange } from "../../types/domain.js";
import type { SupportedCurrency } from "../../services/i18n.service.js";

// =============================================================================
// Bag Simulation — Request contract
// =============================================================================

export type BagItemInput = {
  /** Only "product" is supported in v1. "gift_kit" reserved for future stage. */
  type: "product";
  productSlug: string;
  quantity: number;
};

export type BagSimulateRequest = {
  region: Region;
  currency: SupportedCurrency;
  items: BagItemInput[];
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
  /** All-in total in BRL (canonical). Sum of all embedded components + subtotal. */
  finalTotalBRL: number;
  displayCurrency: SupportedCurrency;
  /** All-in total converted to displayCurrency using static exchange rates. */
  finalTotalDisplay: number;
};

export type BagSimulationResult = {
  /** false if any blockingIssues exist — frontend must not proceed to checkout. */
  isValid: boolean;
  region: Region;
  currency: SupportedCurrency;
  /**
   * Deterministic pricing version string.
   * Encodes the rule parameters used, stable across identical inputs.
   * Stored in order metadata for audit.
   */
  pricingVersion: string;
  items: BagSimulatedItem[];
  totals: BagTotals;
  /** Non-empty when isValid is false. Human-readable, shown in frontend. */
  blockingIssues: string[];
};

// =============================================================================
// Pricing rule — loaded from bag_pricing_rules table
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
