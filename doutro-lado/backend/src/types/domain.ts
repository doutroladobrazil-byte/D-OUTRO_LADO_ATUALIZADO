// =============================================================================
// Scalar / Enum types
// =============================================================================

export type Brand = "casa" | "moda";
export type Role = "customer" | "wholesale" | "admin";
export type Region = "North America" | "Europe" | "Middle East";
/**
 * Operational region — a superset of the legacy Region enum.
 * "Asia Pacific" was added in Stage 13 (country-first) to cover SG.
 * Use this type anywhere that can receive a regionGroup from supported_countries.
 */
export type OperationalRegion = Region | "Asia Pacific";
export type WeightRange = "100g-1kg" | "1-3kg" | "3-5kg" | "5-10kg" | "10-15kg" | "15-20kg";
export type PricingTier = "retail" | "wholesale";
export type OrderStatus = "created" | "processing" | "packing" | "shipped" | "delivered" | "cancelled";
export type PaymentStatus = "pending" | "paid" | "failed" | "refunded";
export type FiscalStatus = "pending" | "in_review" | "issued" | "rejected";
export type MediaType = "image" | "video";

// =============================================================================
// i18n — canonical types (Stage 9)
// =============================================================================

/**
 * ISO 4217 currency codes supported by the platform.
 * BRL is the canonical base. Others are display currencies.
 */
export type SupportedCurrency = "BRL" | "USD" | "EUR" | "AED" | "CHF" | "SGD";

/**
 * ISO 639-1 language codes supported for platform content.
 */
export type SupportedLanguage = "pt" | "en" | "ar" | "de";

/**
 * ISO 3166-1 alpha-2 codes for the 6 MVP destination countries (Stage 12).
 * Used as the primary routing and pricing dimension in the country-first model.
 */
export type CountryCode = "US" | "CH" | "IE" | "DE" | "IS" | "SG";

// =============================================================================
// Auth / Profile
// =============================================================================

/**
 * Canonical profile shape — returned by /api/auth/session and consumed by
 * frontend auth context and admin user management.
 */
export type AuthProfile = {
  id: string;
  authUserId: string | null;
  email: string;
  fullName: string | null;
  role: Role;
  isActive: boolean;
  preferredLanguage: string;
  preferredCurrency: string;
  createdAt: string;
};

// =============================================================================
// Media — Stage 2
// =============================================================================

/**
 * A registered media asset stored in Supabase Storage.
 * Physical file lives in storage; this row holds metadata and the public URL.
 */
export type MediaAsset = {
  id: string;
  brand: Brand;
  mediaType: MediaType;

  // Storage location
  bucket: string;
  storagePath: string;
  publicUrl: string;

  // File metadata
  mimeType?: string;
  fileSizeBytes?: number;

  // Image-specific
  width?: number;
  height?: number;

  // Video-specific
  durationSeconds?: number;
  posterUrl?: string;

  // Presentation
  altText?: string;
  caption?: string;

  isActive: boolean;
  createdAt: string;
};

/**
 * Join record: a media asset attached to a specific product with ordering and
 * primary-selection logic. Consumed by product detail and admin media manager.
 */
export type ProductMedia = {
  id: string;           // product_media.id
  productId: string;
  position: number;
  isPrimary: boolean;
  createdAt: string;
  asset: MediaAsset;    // embedded for convenience
};

// =============================================================================
// Catalog
// =============================================================================

/**
 * @deprecated Use ProductMedia instead. Kept for backward compat during transition.
 */
export type ProductImage = {
  id: string;
  url: string;
  altText?: string;
  position: number;
};

/**
 * Canonical product shape — returned by the API and consumed by the frontend.
 * All optional fields are safe to omit for list contexts (e.g. product grids).
 * `media` is only populated on single-product queries (getProductBySlug).
 */
export type Product = {
  id: string;
  brand: Brand;

  // Category references (IDs for relinking, names for display)
  categoryId?: string;
  category: string;
  subcategoryId?: string;
  subcategory: string;

  // Identity
  name: string;
  slug: string;
  sku: string;

  // Copy
  shortDescription: string;
  longDescription: string;
  seoTitle?: string;
  seoDescription?: string;

  // Physical metadata
  material: string;
  dimensions: string;
  origin?: string;
  careInstructions?: string;

  // Weight — range is required (freight bands); grams is optional (precision)
  weightRange: WeightRange;
  weightGrams?: number;

  // Pricing
  retailPriceBRL: number;
  wholesalePriceBRL: number;
  wholesaleMinQty: number;

  // Stock
  stock: number;

  // Merchandising
  badge?: string;
  featured?: boolean;
  collection?: string;
  tags: string[];
  position?: number;

  // Media — populated only on getProductBySlug
  media?: ProductMedia[];

  /** @deprecated use media instead */
  images?: ProductImage[];

  /**
   * Stage 13 — country availability flag.
   * Set to false when the product is not available in the requested countryCode.
   * Undefined when no countryCode filter was applied.
   */
  availableForCountry?: boolean;
};

export type Campaign = {
  id: string;
  brand: Brand;
  title: string;
  subtitle: string;
  ctaLabel: string;
  ctaHref: string;
  highlight: string;
};

export type FreightRate = {
  region: Region;
  weightRange: WeightRange;
  amountBRL: number;
};

/**
 * Typed snapshot of a freight quote — persisted in order records.
 * Created by quoteFreight() and stored in BuiltOrder.
 * region uses OperationalRegion so the country-first path (which derives
 * region from supported_countries.region_group) can include "Asia Pacific".
 */
export type FreightQuote = {
  region: OperationalRegion;
  weightRange: WeightRange;
  amountBRL: number;
};

// =============================================================================
// Orders — backend-internal build types
// =============================================================================

export type OrderItemInput = {
  productSlug: string;
  quantity: number;
};

export type BuiltOrderItem = {
  productId: string;
  brand: Brand;
  slug: string;
  sku: string;
  name: string;
  quantity: number;
  unitPriceBRL: number;
  lineTotalBRL: number;
  weightRange: WeightRange;
};

export type BuiltOrder = {
  publicId: string;
  brand: Brand;
  currency: string;
  /** Operational region — uses OperationalRegion to include "Asia Pacific" for SG. */
  region: OperationalRegion;
  pricingTier: PricingTier;
  items: BuiltOrderItem[];
  subtotalBRL: number;
  /** Full typed freight snapshot — use this for UI display and payment metadata. */
  freight: FreightQuote;
  /** Convenience alias for freight.amountBRL. */
  freightBRL: number;
  totalBRL: number;
  paymentStatus: "pending";
  orderStatus: "created";
  fiscalStatus: "pending";
  estimatedWeightRange: WeightRange;
};


// =============================================================================
// Admin
// =============================================================================

export type AdminOrderRow = {
  id: string;
  brand: Brand;
  customer: string;
  region: string;
  totalBRL: number;
  paymentStatus: string;
  fiscalStatus: string;
  orderStatus: string;
  createdAt: string;
};

export type BrandOrderSummary = {
  brand: Brand;
  revenueBRL: number;
  orders: number;
};

export type CountryBreakdownRow = {
  countryCode: string;
  countryName: string | null;
  // Total paid orders for this country
  paidOrders: number;
  // Orders covered by financial snapshot (gross_margin_brl_snapshot IS NOT NULL)
  coveredOrders: number;
  // Total revenue across ALL paid orders for this country
  revenueBRLTotal: number;
  // Revenue covered by financial snapshot only
  revenueBRLCovered: number;
  // Margin figures — summed only over covered orders
  grossMarginBRL: number | null;
  netMarginBRL: number | null;
  // Percentages calculated over covered revenue only (null when no coverage)
  grossMarginPctOnCovered: number | null;
  netMarginPctOnCovered: number | null;
};

export type TopProductRow = {
  sku: string;
  productName: string;
  unitsSold: number;
  revenueBRL: number;
};

export type AdminOverview = {
  revenueBRL: number;
  orders: number;
  averageTicketBRL: number;
  newCustomers: number;
  alerts: string[];
  brandSummaries: BrandOrderSummary[];
  // Stage 16 — financial snapshot aggregates
  // Total = all paid orders; Covered = only paid orders with gross_margin_brl_snapshot IS NOT NULL
  paidOrdersTotal: number;
  paidOrdersCovered: number;
  paidRevenueBRLTotal: number;
  paidRevenueBRLCovered: number;
  // Margin figures — summed only over covered orders
  grossMarginBRL: number | null;
  netMarginBRL: number | null;
  // Percentages calculated over covered revenue only (null when no coverage)
  grossMarginPctOnCovered: number | null;
  netMarginPctOnCovered: number | null;
  countryBreakdown: CountryBreakdownRow[];
  topProducts: TopProductRow[];
};

// =============================================================================
// Users & Auth (legacy shapes — kept for admin service compat)
// =============================================================================

export type UserRecord = {
  id: string;
  name: string;
  role: Role;
};

// =============================================================================
// Content
// =============================================================================

export type ContentBlockRecord = {
  id: string;
  type: string;
  brand: Brand;
  active: boolean;
};

// =============================================================================
// Fiscal
// =============================================================================

export type FiscalStatusRecord = {
  orderId: string;
  status: string;
  invoiceNumber: string | null;
  accessKey: string | null;
};
