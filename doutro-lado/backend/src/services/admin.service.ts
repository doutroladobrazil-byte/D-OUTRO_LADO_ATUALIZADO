import { db } from "../lib/db.js";
import type {
  AdminOrderRecord,
  AdminOverview,
  Brand,
  ContentBlockRecord,
  FiscalStatusRecord,
  UserRecord
} from "../types/domain.js";

export async function getAdminOverview(): Promise<AdminOverview> {
  const [stats] = await db`
    SELECT
      COALESCE(SUM(total_brl), 0)  AS revenue_brl,
      COUNT(*)                      AS orders,
      COALESCE(AVG(total_brl), 0)  AS avg_ticket
    FROM orders
  `;

  const brandRows = await db`
    SELECT
      brand,
      COALESCE(SUM(total_brl), 0) AS revenue_brl,
      COUNT(*)                     AS orders
    FROM orders
    GROUP BY brand
  `;

  const [newCustomers] = await db`
    SELECT COUNT(*) AS count
    FROM profiles
    WHERE created_at >= now() - interval '30 days'
  `;

  const [lowStock] = await db`
    SELECT COUNT(*) AS count
    FROM products
    WHERE stock < 5 AND is_active = true
  `;

  const [pendingFiscal] = await db`
    SELECT COUNT(*) AS count
    FROM orders
    WHERE fiscal_status = 'pending' AND order_status != 'created'
  `;

  const alerts: string[] = [];
  if (Number(pendingFiscal.count) > 0)
    alerts.push(`${pendingFiscal.count} pedidos aguardando revisao fiscal`);
  if (Number(lowStock.count) > 0)
    alerts.push(`${lowStock.count} SKUs com estoque critico`);

  return {
    revenueBRL: Number(stats.revenue_brl),
    orders: Number(stats.orders),
    averageTicketBRL: Math.round(Number(stats.avg_ticket)),
    newCustomers: Number(newCustomers.count),
    alerts,
    brandSummaries: brandRows.map((row) => ({
      brand: row.brand as Brand,
      revenueBRL: Number(row.revenue_brl),
      orders: Number(row.orders),
    })),
  };
}

export async function listAdminOrders(): Promise<AdminOrderRecord[]> {
  const rows = await db`
    SELECT
      o.public_id          AS id,
      o.brand,
      o.shipping_region    AS region,
      o.total_brl,
      o.payment_status,
      o.fiscal_status,
      o.order_status,
      o.created_at,
      COALESCE(p.full_name, 'Guest') AS customer
    FROM orders o
    LEFT JOIN profiles p ON p.id = o.profile_id
    ORDER BY o.created_at DESC
    LIMIT 100
  `;

  return rows.map((row) => ({
    id: row.id as string,
    brand: row.brand as Brand,
    customer: row.customer as string,
    region: (row.region as AdminOrderRecord["region"]) ?? "North America",
    totalBRL: Number(row.total_brl),
    paymentStatus: row.payment_status as string,
    fiscalStatus: row.fiscal_status as string,
    orderStatus: row.order_status as string,
    createdAt: new Date(row.created_at as string).toISOString().split("T")[0],
  }));
}

export async function listUsers(): Promise<UserRecord[]> {
  const rows = await db`
    SELECT id, full_name, role
    FROM profiles
    WHERE is_active = true
    ORDER BY full_name
  `;

  return rows.map((row) => ({
    id: row.id as string,
    name: (row.full_name as string) ?? "",
    role: row.role as UserRecord["role"],
  }));
}

export async function listContentBlocks(): Promise<ContentBlockRecord[]> {
  const banners = await db`
    SELECT id::text, brand, 'hero' AS type, is_active
    FROM banners
    ORDER BY position
  `;

  const sliders = await db`
    SELECT id::text, brand, 'slider' AS type, is_active
    FROM sliders
    ORDER BY position
  `;

  return [...banners, ...sliders].map((row) => ({
    id: row.id as string,
    type: row.type as string,
    brand: row.brand as Brand,
    active: row.is_active as boolean,
  }));
}

export async function listFiscalStatuses(): Promise<FiscalStatusRecord[]> {
  const rows = await db`
    SELECT
      o.public_id   AS order_id,
      f.status,
      f.invoice_number,
      f.access_key
    FROM fiscal_records f
    JOIN orders o ON o.id = f.order_id
    ORDER BY f.created_at DESC
  `;

  return rows.map((row) => ({
    orderId: row.order_id as string,
    status: row.status as string,
    invoiceNumber: (row.invoice_number as string | null) ?? null,
    accessKey: (row.access_key as string | null) ?? null,
  }));
}
