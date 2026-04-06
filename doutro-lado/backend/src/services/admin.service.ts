import { adminOrders, contentBlocks, fiscalStatuses, users } from "../data/mock-store.js";
import type { AdminOverview, Brand } from "../types/domain.js";

export function getAdminOverview(): AdminOverview {
  const revenueBRL = adminOrders.reduce((sum, order) => sum + order.totalBRL, 0);
  const brandSummaries = (["casa", "moda"] as Brand[]).map((brand) => {
    const brandOrders = adminOrders.filter((order) => order.brand === brand);
    return {
      brand,
      revenueBRL: brandOrders.reduce((sum, order) => sum + order.totalBRL, 0),
      orders: brandOrders.length
    };
  });

  return {
    revenueBRL,
    orders: adminOrders.length,
    averageTicketBRL: Math.round(revenueBRL / adminOrders.length),
    newCustomers: 18,
    alerts: ["3 pedidos aguardando revisao fiscal", "2 SKUs com estoque critico"],
    brandSummaries
  };
}

export function listAdminOrders() {
  return adminOrders;
}

export function listUsers() {
  return users;
}

export function listContentBlocks() {
  return contentBlocks;
}

export function listFiscalStatuses() {
  return fiscalStatuses;
}
