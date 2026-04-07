import { adminOrders, campaigns, freightRates, products } from "@/lib/mock-data";
import { fetchApiData } from "@/lib/api";
import type { AdminOrderRow, AdminOverview, Brand, Campaign, FreightRate, FreightQuote, Product, Region, WeightRange } from "@/lib/types";

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

export async function getProducts(brand?: Brand) {
  const query = brand ? `?brand=${brand}` : "";
  return (await fetchApiData<Product[]>(`/products${query}`)) ?? (brand ? products.filter((product) => product.brand === brand) : products);
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

export async function getAdminDashboard() {
  const token = process.env.API_ADMIN_TOKEN?.trim();
  if (!token) {
    const fallbackRevenueBRL = adminOrders.reduce((sum, order) => sum + order.totalBRL, 0);
    return {
      overview: {
        revenueBRL: fallbackRevenueBRL,
        orders: adminOrders.length,
        averageTicketBRL: Math.round(fallbackRevenueBRL / adminOrders.length),
        newCustomers: 18,
        alerts: ["Configure API_ADMIN_TOKEN para consumir o backend protegido."],
        brandSummaries: getFallbackBrandSummaries()
      },
      orders: adminOrders
    };
  }

  const [overview, orders] = await Promise.all([
    fetchApiData<AdminOverview>("/admin/overview", { token, revalidate: 30 }),
    fetchApiData<AdminOrderRow[]>("/admin/orders", { token, revalidate: 30 })
  ]);

  return {
    overview: overview ?? {
      revenueBRL: adminOrders.reduce((sum, order) => sum + order.totalBRL, 0),
      orders: adminOrders.length,
      averageTicketBRL: Math.round(adminOrders.reduce((sum, order) => sum + order.totalBRL, 0) / adminOrders.length),
      newCustomers: 18,
      alerts: ["Backend indisponivel. Exibindo base local de continuidade."],
      brandSummaries: getFallbackBrandSummaries()
    },
    orders: orders ?? adminOrders
  };
}
