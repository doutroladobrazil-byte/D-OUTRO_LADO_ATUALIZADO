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
export type MediaType = "image" | "video";

// =============================================================================
// i18n — re-exported for convenience (source of truth: @/lib/i18n)
// =============================================================================

export type { SupportedCurrency, SupportedLanguage, SupportedLocale } from "@/lib/i18n";

// =============================================================================
// Auth / Profile — mirror backend AuthProfile
// =============================================================================

/**
 * Canonical profile shape returned by GET /api/auth/session.
 * Consumed by AuthContext and all account/admin UI.
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
 * Physical file lives in storage; this holds metadata and the public CDN URL.
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
 * Join record binding a media asset to a product with ordering + primary flag.
 * This is the shape returned by GET /products/:slug  (media[]).
 */
export type ProductMedia = {
  id: string;           // product_media.id
  productId: string;
  position: number;
  isPrimary: boolean;
  createdAt: string;
  asset: MediaAsset;
};

// =============================================================================
// Catalog
// =============================================================================

/**
 * @deprecated Use ProductMedia instead. Kept for backward compat.
 */
export type ProductImage = {
  id: string;
  url: string;
  altText?: string;
  position: number;
};

/**
 * Canonical product shape returned by the API.
 * Optional fields may be absent in list contexts.
 * `media` is only populated by getProductBySlug (single-product queries).
 */
export type Product = {
  id: string;
  brand: Brand;

  // Category references
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

  // Weight
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

  /** @deprecated Use media instead */
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

export type FreightQuote = {
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

// =============================================================================
// Gift Kits — Stage 6
// =============================================================================

export type PackagingType = "standard" | "premium" | "signature";

export type PackagingOption = {
  type: PackagingType;
  label: string;
  descriptionPT: string;
  surchargeMultiplier: number;
};

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

export type CreateGiftKitPayload = {
  brand: Brand;
  name: string;
  message?: string;
  packagingType: PackagingType;
  items: { productSlug: string; quantity: number }[];
};

// =============================================================================
// Cart & Checkout — Stage 7
// =============================================================================

export type CartItemLine = {
  id?: string;      // undefined in local-only state; set after server sync
  productId: string;
  productSlug: string;
  productName: string;
  sku: string;
  brand: Brand;
  quantity: number;
  unitPriceBRL: number;
  lineTotalBRL: number;
  weightRange: WeightRange;
  stock: number;
};

export type Cart = {
  id: string | null;
  profileId: string | null;
  brand: Brand;
  currency: string;
  items: CartItemLine[];
  subtotalBRL: number;
};

export type CheckoutPayload = {
  brand: Brand;
  region: Region;
  currency?: string;
  items: { productSlug: string; quantity: number }[];
};

export type CheckoutResult = {
  mode: "stripe" | "mock";
  sessionId: string;
  checkoutUrl: string | null;
  orderPreview: {
    publicId: string;
    brand: Brand;
    region: Region;
    subtotalBRL: number;
    freightBRL: number;
    totalBRL: number;
    estimatedWeightRange: WeightRange;
  };
};

// =============================================================================
// Fiscal & Content — admin records
// =============================================================================

export type FiscalStatusRecord = {
  orderId: string;
  status: FiscalStatus;
  invoiceNumber: string | null;
  accessKey: string | null;
};

export type ContentBlockRecord = {
  id: string;
  type: string;
  brand: Brand;
  active: boolean;
};
