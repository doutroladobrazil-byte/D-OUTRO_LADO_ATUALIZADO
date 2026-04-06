// =============================================================================
// Scalar / Enum types — mirror backend domain.ts
// =============================================================================

export type Brand = "casa" | "moda";
export type Role = "customer" | "wholesale" | "admin";
export type Region = "North America" | "Europe" | "Middle East";
export type WeightRange = "100g-1kg" | "1-3kg" | "3-5kg" | "5-10kg" | "10-15kg" | "15-20kg";
export type PricingTier = "retail" | "wholesale";
export type OrderStatus = "created" | "processing" | "packing" | "shipped" | "delivered" | "cancelled";
export type PaymentStatus = "pending" | "paid" | "failed" | "refunded";
export type FiscalStatus = "pending" | "in_review" | "issued" | "rejected";

// =============================================================================
// Catalog
// =============================================================================

export type ProductImage = {
  id: string;
  url: string;
  altText?: string;
  position: number;
};

/**
 * Canonical product shape returned by the API.
 * Optional fields may be absent in list contexts.
 * `images` is only populated by getProductBySlug (single-product queries).
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
  images?: ProductImage[];
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

export type AdminOverview = {
  revenueBRL: number;
  orders: number;
  averageTicketBRL: number;
  newCustomers: number;
  alerts: string[];
  brandSummaries: BrandOrderSummary[];
};

// =============================================================================
// API transport
// =============================================================================

export type ApiEnvelope<T> = {
  ok: boolean;
  data: T;
  message?: string;
};
