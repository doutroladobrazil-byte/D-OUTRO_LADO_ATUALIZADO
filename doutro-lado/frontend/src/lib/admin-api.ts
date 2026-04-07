/**
 * Admin API helpers — server-side only (require admin token).
 * Used by Next.js Server Components in /app/admin/* pages.
 */
import { fetchApiData } from "@/lib/api";
import type {
  AdminOrderRow,
  AdminOverview,
  Brand,
  Product,
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
  weightRange: string;
  badge: string | null;
  isFeatured: boolean;
  isActive: boolean;
  collection: string | null;
  createdAt: string;
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
  profileId: string | null;
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

export type StockOverview = {
  totalSKUs: number;
  critical: number;
  outOfStock: number;
  healthy: number;
  items: {
    brand: Brand;
    sku: string;
    name: string;
    stock: number;
    isActive: boolean;
  }[];
};

// =============================================================================
// API fetch helpers
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
