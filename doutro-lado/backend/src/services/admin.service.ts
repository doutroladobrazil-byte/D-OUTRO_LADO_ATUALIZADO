import { adminOrders, contentBlocks, fiscalStatuses, users } from "../data/mock-store.js";

export function getAdminOverview() {
  const revenueBRL = adminOrders.reduce((sum, order) => sum + order.totalBRL, 0);

  return {
    revenueBRL,
    orders: adminOrders.length,
    averageTicketBRL: Math.round(revenueBRL / adminOrders.length),
    newCustomers: 18,
    alerts: ["3 pedidos aguardando revisao fiscal", "2 SKUs com estoque critico"]
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
