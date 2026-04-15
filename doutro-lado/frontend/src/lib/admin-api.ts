/**
 * Admin API helpers — server-side fetch wrappers + client-side mutation helpers.
 * Server-side functions (fetchAdmin*) require an admin token from the session.
 * Client-side functions (adminApi.*) call fetch() from the browser.
 */
import { fetchApiData } from "@/lib/api";
import type {
  AdminOrderRow,
  AdminOverview,
  Brand,
  CountryPolicy,
  ProductAvailabilityMap,
  ProductMedia,
} from "@/lib/types";

// =============================================================================
// Types returned by admin endpoints
// =============================================================================

export type AdminProduct = {
  id: string;
  brand: Brand;
  name: string;
  slug: string;
  sku: string;
  category: string;
  retailPriceBRL: number;
  wholesalePriceBRL: number;
  wholesaleMinQty: number;
  stock: number;
  costPriceBRL: number | null;
  weightRange: string;
  badge: string | null;
  isFeatured: boolean;
  isActive: boolean;
  collection: string | null;
  createdAt: string;
};

/** Full product detail — used by the edit form. */
export type AdminProductDetail = {
  id: string;
  brand: Brand;
  name: string;
  slug: string;
  sku: string;
  category: string;
  categoryId: string | null;
  subcategory: string;
  subcategoryId: string | null;
  shortDescription: string;
  longDescription: string;
  seoTitle: string | null;
  seoDescription: string | null;
  material: string;
  dimensions: string;
  origin: string | null;
  careInstructions: string | null;
  weightRange: string;
  weightGrams: number | null;
  retailPriceBRL: number;
  wholesalePriceBRL: number | null;
  wholesaleMinQty: number;
  stock: number;
  costPriceBRL: number | null;
  badge: string | null;
  isFeatured: boolean;
  isActive: boolean;
  collection: string | null;
  tags: string[];
  position: number;
  createdAt: string;
  updatedAt: string;
};

export type AdminOrderDetail = {
  id: string;
  publicId: string;
  brand: Brand;
  currency: string;
  subtotalBRL: number;
  freightBRL: number;
  totalBRL: number;
  shippingRegion: string;
  estimatedWeightRange: string;
  orderStatus: string;
  paymentStatus: string;
  fiscalStatus: string;
  stripeSessionId: string | null;
  notes: string | null;
  customerName: string;
  customerEmail: string | null;
  customerPhone: string | null;
  profileId: string | null;
  isGuest: boolean;
  destinationCountryCode: string | null;
  destinationCountryName: string | null;
  shippingLine1: string | null;
  shippingLine2: string | null;
  shippingCity: string | null;
  shippingStateRegion: string | null;
  shippingPostalCode: string | null;
  // Stage 16 — financial snapshot (null for pre-Stage 16 orders)
  productCostBRLSnapshot: number | null;
  gatewayFeeBRLSnapshot: number | null;
  grossMarginBRLSnapshot: number | null;
  netMarginBRLSnapshot: number | null;
  createdAt: string;
  updatedAt: string;
  items: {
    productName: string;
    sku: string;
    brand: Brand;
    quantity: number;
    unitPriceBRL: number;
    lineTotalBRL: number;
    weightRange: string;
    unitCostBRLSnapshot: number | null;
    lineCostBRLSnapshot: number | null;
    lineMarginBRLSnapshot: number | null;
    isKitItem: boolean;
  }[];
};

export type AdminCustomer = {
  id: string;
  fullName: string;
  role: string;
  isActive: boolean;
  preferredCurrency: string;
  preferredLanguage: string;
  createdAt: string;
};

export type AdminCategory = {
  id: string;
  name: string;
  slug: string;
  brand: Brand;
  subcategories: { id: string; name: string; slug: string }[];
};

export type StockOverview = {
  totalSKUs: number;
  critical: number;
  outOfStock: number;
  healthy: number;
  items: {
    brand: Brand;
    sku: string;
    name: string;
    /** Physical units on shelf */
    stock: number;
    /** Units currently reserved (active, non-expired reservations) */
    reserved: number;
    /** available = stock − reserved */
    available: number;
    isActive: boolean;
  }[];
};

// =============================================================================
// Server-side fetch helpers (require admin token from session)
// =============================================================================

export async function fetchAdminOverview(token: string) {
  return fetchApiData<AdminOverview>("/admin/overview", { token, revalidate: 30 });
}

export async function fetchAdminOrders(token: string) {
  return fetchApiData<AdminOrderRow[]>("/admin/orders", { token, revalidate: 30 });
}

export async function fetchAdminOrderDetail(token: string, publicId: string) {
  return fetchApiData<AdminOrderDetail>(`/admin/orders/${publicId}`, { token, revalidate: 0 });
}

export async function fetchAdminProducts(token: string, options: { brand?: Brand; search?: string } = {}) {
  const params = new URLSearchParams();
  if (options.brand) params.set("brand", options.brand);
  if (options.search) params.set("search", options.search);
  const qs = params.toString();
  return fetchApiData<AdminProduct[]>(`/admin/products${qs ? `?${qs}` : ""}`, { token, revalidate: 0 });
}

export async function fetchAdminProductById(token: string, productId: string) {
  return fetchApiData<AdminProductDetail>(`/admin/products/${productId}`, { token, revalidate: 0 });
}

export async function fetchAdminProductMedia(token: string, productId: string) {
  return fetchApiData<ProductMedia[]>(`/admin/products/${productId}/media`, { token, revalidate: 0 });
}

export async function fetchAdminCustomers(token: string, options: { role?: string; search?: string } = {}) {
  const params = new URLSearchParams();
  if (options.role) params.set("role", options.role);
  if (options.search) params.set("search", options.search);
  const qs = params.toString();
  return fetchApiData<AdminCustomer[]>(`/admin/customers${qs ? `?${qs}` : ""}`, { token, revalidate: 0 });
}

export async function fetchAdminStock(token: string) {
  return fetchApiData<StockOverview>("/admin/stock", { token, revalidate: 30 });
}

export async function fetchAdminCategories(token: string, brand: Brand = "moda") {
  return fetchApiData<AdminCategory[]>(`/admin/categories?brand=${brand}`, { token, revalidate: 300 });
}

/** Stage 13 — fetch country availability map for a product (server-side). */
export async function fetchProductAvailability(token: string, productId: string) {
  return fetchApiData<ProductAvailabilityMap>(
    `/admin/products/${productId}/availability`,
    { token, revalidate: 0 }
  );
}

// =============================================================================
// Client-side mutation helpers
// These call fetch() from the browser with the Bearer token.
// =============================================================================

type MutationResult<T> =
  | { ok: true; data: T }
  | { ok: false; message: string };

async function callApi<T>(
  path: string,
  method: string,
  token: string,
  body?: unknown
): Promise<MutationResult<T>> {
  const base = process.env.NEXT_PUBLIC_API_URL ?? "/api";
  const res = await fetch(`${base}${path}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const json = await res.json().catch(() => ({ ok: false, message: "Resposta inválida do servidor" }));
  if (!res.ok) return { ok: false, message: json.message ?? `Erro ${res.status}` };
  return { ok: true, data: json.data as T };
}

export const adminApi = {
  /** Create a new product. Returns the created row (id, slug, brand, ...). */
  createProduct(token: string, body: Record<string, unknown>) {
    return callApi<{ id: string; brand: string; name: string; slug: string; sku: string }>(
      "/admin/products",
      "POST",
      token,
      body
    );
  },

  /** Update a product (any subset of fields). */
  patchProduct(token: string, productId: string, body: Record<string, unknown>) {
    return callApi<AdminProductDetail>(`/admin/products/${productId}`, "PATCH", token, body);
  },

  /** Soft-delete a product (sets is_active = false). */
  deleteProduct(token: string, productId: string) {
    return callApi<{ id: string; is_active: boolean }>(`/admin/products/${productId}`, "DELETE", token);
  },

  /** Get a signed upload URL for a product media file. */
  getUploadUrl(
    token: string,
    productId: string,
    brand: string,
    mediaType: "image" | "video",
    filename: string
  ) {
    return callApi<{ signedUrl: string; storagePath: string; bucket: string; publicUrl: string }>(
      "/admin/media/upload-url",
      "POST",
      token,
      { productId, brand, mediaType, filename }
    );
  },

  /** Register a media asset after it has been uploaded. */
  registerMedia(
    token: string,
    payload: {
      productId: string;
      brand: string;
      mediaType: "image" | "video";
      bucket: string;
      storagePath: string;
      publicUrl: string;
      mimeType?: string;
      fileSizeBytes?: number;
      isPrimary?: boolean;
    }
  ) {
    return callApi<import("@/lib/types").ProductMedia>("/admin/media/register", "POST", token, payload);
  },

  /** Set a media item as the primary image for its product. */
  setPrimary(token: string, productId: string, pmId: string) {
    return callApi<{ primary: string }>(
      `/admin/products/${productId}/media/${pmId}/primary`,
      "PATCH",
      token
    );
  },

  /** Delete a media asset from a product. */
  deleteMedia(token: string, assetId: string, productId: string) {
    return callApi<{ deleted: string }>(
      `/admin/media/${assetId}?productId=${encodeURIComponent(productId)}`,
      "DELETE",
      token
    );
  },

  /** Load media for a product (client-side). */
  async listMedia(token: string, productId: string) {
    return callApi<import("@/lib/types").ProductMedia[]>(
      `/admin/products/${productId}/media`,
      "GET",
      token
    );
  },

  /** Reorder media for a product. orderedIds = product_media.id[] in desired order. */
  reorderMedia(token: string, productId: string, orderedIds: string[]) {
    return callApi<{ ok: boolean }>(
      `/admin/products/${productId}/media/reorder`,
      "PATCH",
      token,
      { orderedIds }
    );
  },

  /** List categories for a brand (client-side). */
  listCategories(token: string, brand = "moda") {
    return callApi<AdminCategory[]>(`/admin/categories?brand=${brand}`, "GET", token);
  },

  /** Stage 13 — get country availability map for a product (client-side). */
  getProductAvailability(token: string, productId: string) {
    return callApi<ProductAvailabilityMap>(
      `/admin/products/${productId}/availability`,
      "GET",
      token
    );
  },

  /** Stage 13 — update country availability flags for a product. */
  patchProductAvailability(token: string, productId: string, updates: ProductAvailabilityMap) {
    return callApi<ProductAvailabilityMap>(
      `/admin/products/${productId}/availability`,
      "PATCH",
      token,
      updates
    );
  },

  /** Bloco 10A — patch editable metadata on a media asset (altText, caption, posterUrl). */
  patchMedia(
    token: string,
    assetId: string,
    body: { altText?: string | null; caption?: string | null; posterUrl?: string | null }
  ) {
    return callApi<import("@/lib/types").MediaAsset>(`/admin/media/${assetId}`, "PATCH", token, body);
  },

  /** Stage 17 — get country policy (client-side). */
  getCountryPolicy(token: string, code: string) {
    return callApi<CountryPolicy>(`/admin/countries/${code}/policy`, "GET", token);
  },

  /** Stage 17 — update country policy (client-side). */
  patchCountryPolicy(token: string, code: string, body: Partial<CountryPolicy>) {
    return callApi<CountryPolicy>(`/admin/countries/${code}/policy`, "PATCH", token, body);
  },
};
