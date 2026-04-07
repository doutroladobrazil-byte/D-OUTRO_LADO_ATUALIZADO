// =============================================================================
// Scalar / Enum types
// =============================================================================

export type Brand = "casa" | "moda";
export type Role = "customer" | "wholesale" | "admin";
export type Region = "North America" | "Europe" | "Middle East";
export type WeightRange = "100g-1kg" | "1-3kg" | "3-5kg" | "5-10kg" | "10-15kg" | "15-20kg";
export type PricingTier = "retail" | "wholesale";
export type OrderStatus = "created" | "processing" | "packing" | "shipped" | "delivered" | "cancelled";
export type PaymentStatus = "pending" | "paid" | "failed" | "refunded";
export type FiscalStatus = "pending" | "in_review" | "issued" | "rejected";
export type MediaType = "image" | "video";

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
  region: Region;
  pricingTier: PricingTier;
  items: BuiltOrderItem[];
  subtotalBRL: number;
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

export type AdminOverview = {
  revenueBRL: number;
  orders: number;
  averageTicketBRL: number;
  newCustomers: number;
  alerts: string[];
  brandSummaries: BrandOrderSummary[];
};

// =============================================================================
// Users & Auth
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
