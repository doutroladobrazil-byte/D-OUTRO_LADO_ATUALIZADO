import { adminOrders, campaigns, freightRates, products } from "@/lib/mock-data";
import { fetchApiData } from "@/lib/api";
import type {
  AdminOrderRow,
  AdminOverview,
  BagSimulateRequest,
  BagSimulationResult,
  Brand,
  Campaign,
  Cart,
  CreateGiftKitPayload,
  FreightRate,
  FreightQuote,
  GiftKit,
  PackagingOption,
  Product,
  Region,
  WeightRange,
} from "@/lib/types";

function getFallbackBrandSummaries() {
  return (["casa", "moda"] as const).map((brand) => {
    const brandOrders = adminOrders.filter((order) => order.brand === brand);
    return {
      brand,
      revenueBRL: brandOrders.reduce((sum, order) => sum + order.totalBRL, 0),
      orders: brandOrders.length
    };
  });
}

export async function getCampaigns() {
  return (await fetchApiData<Campaign[]>("/campaigns")) ?? campaigns;
}

export type GetProductsOptions = {
  brand?: Brand;
  category?: string;
  search?: string;
  sort?: string;
};

export async function getProducts(options?: Brand | GetProductsOptions) {
  // Support legacy behavior where first param is just Brand string
  const opts = typeof options === "string" ? { brand: options } : options || {};
  
  const params = new URLSearchParams();
  if (opts.brand) params.set("brand", opts.brand);
  if (opts.category) params.set("category", opts.category);
  if (opts.search) params.set("search", opts.search);
  if (opts.sort) params.set("sort", opts.sort);

  const query = params.toString() ? `?${params.toString()}` : "";
  
  return (await fetchApiData<Product[]>(`/products${query}`)) ?? products.filter((product) => {
    // Basic mock fallback filtering
    if (opts.brand && product.brand !== opts.brand) return false;
    if (opts.category && product.category.toLowerCase() !== opts.category.toLowerCase()) return false;
    if (opts.search) {
      const s = opts.search.toLowerCase();
      if (!product.name.toLowerCase().includes(s) && !product.shortDescription.toLowerCase().includes(s)) return false;
    }
    return true;
  });
}

export async function getProductBySlug(slug: string) {
  return (await fetchApiData<Product>(`/products/${slug}`)) ?? products.find((product) => product.slug === slug) ?? null;
}

export async function getFreightRates(weightRange?: WeightRange) {
  const query = weightRange ? `?weightRange=${weightRange}` : "";
  return (await fetchApiData<FreightRate[]>(`/freight/rates${query}`)) ?? freightRates;
}

export async function getFreightQuote(region: Region, weightRange: WeightRange) {
  return (await fetchApiData<FreightQuote>(`/freight/quote?region=${encodeURIComponent(region)}&weightRange=${encodeURIComponent(weightRange)}`));
}

export async function getShippingRegions() {
  return (await fetchApiData<Region[]>("/freight/regions")) ?? ["North America", "Europe", "Middle East"];
}

/**
 * Fetches the admin dashboard data using the authenticated user's JWT.
 * The token is obtained from the server-side Supabase session in admin/page.tsx.
 * Falls back to mock data only if the backend is unreachable.
 */
export async function getAdminDashboard(token: string) {
  const fallbackRevenueBRL = adminOrders.reduce((sum, order) => sum + order.totalBRL, 0);
  const fallbackOverview: AdminOverview = {
    revenueBRL: fallbackRevenueBRL,
    orders: adminOrders.length,
    averageTicketBRL: Math.round(fallbackRevenueBRL / adminOrders.length),
    newCustomers: 0,
    alerts: ["Backend indisponivel. Dados locais para continuidade."],
    brandSummaries: getFallbackBrandSummaries()
  };

  const [overview, orders] = await Promise.all([
    fetchApiData<AdminOverview>("/admin/overview", { token, revalidate: 30 }),
    fetchApiData<AdminOrderRow[]>("/admin/orders", { token, revalidate: 30 })
  ]);

  return {
    overview: overview ?? fallbackOverview,
    orders: orders ?? adminOrders
  };
}

// =============================================================================
// Gift Kits — Stage 6
// =============================================================================

/**
 * Fetch available packaging options from the backend.
 * Renders as a selector in GiftBuilderStudio.
 */
export async function getPackagingOptions(): Promise<PackagingOption[]> {
  const fallback: PackagingOption[] = [
    { type: "standard", label: "Standard Box", descriptionPT: "Caixa com papel de seda e laço simples.", surchargeMultiplier: 0 },
    { type: "premium", label: "Premium Box", descriptionPT: "Caixa rígida com fita de cetim e papel especial.", surchargeMultiplier: 0.05 },
    { type: "signature", label: "Signature Box", descriptionPT: "Caixa artesanal numerada com cartão editorial personalizado.", surchargeMultiplier: 0.10 },
  ];
  return (await fetchApiData<PackagingOption[]>("/gift-kits/packaging-options", { revalidate: 3600 })) ?? fallback;
}

/**
 * Create a gift kit (authenticated).
 * Must be called client-side with a bearer token.
 */
export async function createGiftKit(payload: CreateGiftKitPayload, token: string): Promise<GiftKit | null> {
  const apiBaseUrl = typeof window === "undefined"
    ? (process.env.INTERNAL_API_URL ?? process.env.NEXT_PUBLIC_API_URL ?? "http://127.0.0.1:4000/api")
    : (process.env.NEXT_PUBLIC_API_URL ?? "/api");

  const res = await fetch(`${apiBaseUrl}/gift-kits`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });
  if (!res.ok) return null;
  const envelope = await res.json();
  return envelope.ok ? envelope.data : null;
}

/**
 * List the authenticated user's gift kits.
 */
export async function getMyGiftKits(token: string): Promise<GiftKit[]> {
  return (await fetchApiData<GiftKit[]>("/gift-kits/mine", { token })) ?? [];
}

// =============================================================================
// Cart sync — Phase 3
// These helpers call the existing backend cart endpoints.
// They are safe to call from both server and client contexts (fetchApiData
// selects the correct base URL per environment).
// Guest callers (no token) should use the local Zustand store only.
// =============================================================================

/**
 * Fetch the backend cart for the authenticated user and brand.
 * Returns null for guests or on network failure.
 */
export async function getBackendCart(brand: Brand, token: string): Promise<Cart | null> {
  return fetchApiData<Cart>(`/cart?brand=${brand}`, { token, revalidate: 0 });
}

/**
 * Upsert one item in the backend cart.
 * quantity must be ≥ 1 (backend validates min=1).
 * Returns the updated cart or null on failure.
 */
export async function syncCartItemToBackend(
  brand: Brand,
  productSlug: string,
  quantity: number,
  token: string
): Promise<Cart | null> {
  return fetchApiData<Cart>("/cart/items", {
    token,
    method: "PUT",
    body: { brand, productSlug, quantity },
  });
}

// =============================================================================
// Bag simulation — Stage 11
// =============================================================================

/**
 * POST /api/bag/simulate — public endpoint, no auth required.
 * Returns an all-in BagSimulationResult with isValid + totals.
 * Frontend must check isValid before allowing checkout.
 *
 * Pass token when available (authenticated users) for future per-profile
 * pricing extensions. Safe to call with token = undefined for guests.
 */
export async function simulateBag(
  payload: BagSimulateRequest,
  token?: string
): Promise<BagSimulationResult | null> {
  return fetchApiData<BagSimulationResult>("/bag/simulate", {
    method: "POST",
    body: payload,
    token,
    revalidate: 0,
  });
}

/**
 * Remove one item from the backend cart via DELETE.
 * Returns the updated cart or null on failure.
 */
export async function removeBackendCartItem(
  brand: Brand,
  productSlug: string,
  token: string
): Promise<Cart | null> {
  return fetchApiData<Cart>(
    `/cart/items/${encodeURIComponent(productSlug)}?brand=${brand}`,
    { token, method: "DELETE" }
  );
}
