import { adminOrders, campaigns, freightRates, products } from "@/lib/mock-data";
import { fetchApiData } from "@/lib/api";
import type { AdminOrderRow, AdminOverview, Brand, Campaign, FreightRate, Product } from "@/lib/types";

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

export async function getFreightRates() {
  return (await fetchApiData<FreightRate[]>("/shipping/rates")) ?? freightRates;
}

export async function getAdminDashboard() {
  const token = process.env.API_ADMIN_TOKEN?.trim();
  if (!token) {
    return {
      overview: {
        revenueBRL: adminOrders.reduce((sum, order) => sum + order.totalBRL, 0),
        orders: adminOrders.length,
        averageTicketBRL: Math.round(adminOrders.reduce((sum, order) => sum + order.totalBRL, 0) / adminOrders.length),
        newCustomers: 18,
        alerts: ["Configure API_ADMIN_TOKEN para consumir o backend protegido."]
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
      alerts: ["Backend indisponivel. Exibindo base local de continuidade."]
    },
    orders: orders ?? adminOrders
  };
}
