import { db } from "../lib/db.js";
import type {
  AdminOrderRow,
  AdminOverview,
  Brand,
  ContentBlockRecord,
  CountryBreakdownRow,
  FiscalStatusRecord,
  TopProductRow,
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

  // Stage 16 — financial aggregates (paid orders only)
  const [paidStats] = await db`
    SELECT
      COALESCE(SUM(total_brl), 0)                AS paid_revenue_brl,
      SUM(gross_margin_brl_snapshot)             AS gross_margin_brl,
      SUM(net_margin_brl_snapshot)               AS net_margin_brl
    FROM orders
    WHERE payment_status = 'paid'
  `;

  // Country breakdown — paid orders only
  const countryRows = await db`
    SELECT
      destination_country_code                       AS country_code,
      MAX(destination_country_name)                  AS country_name,
      COUNT(*)::int                                  AS paid_orders,
      COALESCE(SUM(total_brl), 0)                   AS revenue_brl,
      SUM(gross_margin_brl_snapshot)                AS gross_margin_brl,
      SUM(net_margin_brl_snapshot)                  AS net_margin_brl
    FROM orders
    WHERE payment_status = 'paid'
      AND destination_country_code IS NOT NULL
    GROUP BY destination_country_code
    ORDER BY revenue_brl DESC
  `;

  // Top products — paid orders, by revenue
  const topProductRows = await db`
    SELECT
      oi.sku,
      oi.product_name,
      SUM(oi.quantity)::int                          AS units_sold,
      COALESCE(SUM(oi.line_total_brl), 0)           AS revenue_brl
    FROM order_items oi
    JOIN orders o ON o.id = oi.order_id
    WHERE o.payment_status = 'paid'
      AND oi.sku IS NOT NULL
    GROUP BY oi.sku, oi.product_name
    ORDER BY revenue_brl DESC
    LIMIT 10
  `;

  const alerts: string[] = [];
  if (Number(pendingFiscal.count) > 0)
    alerts.push(`${pendingFiscal.count} pedidos aguardando revisao fiscal`);
  if (Number(lowStock.count) > 0)
    alerts.push(`${lowStock.count} SKUs com estoque critico`);

  const paidRevenueBRL = Number(paidStats.paid_revenue_brl ?? 0);
  const grossMarginBRL = paidStats.gross_margin_brl != null ? Number(paidStats.gross_margin_brl) : null;
  const netMarginBRL = paidStats.net_margin_brl != null ? Number(paidStats.net_margin_brl) : null;

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
    paidRevenueBRL,
    grossMarginBRL,
    netMarginBRL,
    grossMarginPct: grossMarginBRL != null && paidRevenueBRL > 0
      ? Math.round((grossMarginBRL / paidRevenueBRL) * 1000) / 10
      : null,
    netMarginPct: netMarginBRL != null && paidRevenueBRL > 0
      ? Math.round((netMarginBRL / paidRevenueBRL) * 1000) / 10
      : null,
    countryBreakdown: countryRows.map((row): CountryBreakdownRow => ({
      countryCode: row.country_code as string,
      countryName: (row.country_name as string | null) ?? null,
      paidOrders: row.paid_orders as number,
      revenueBRL: Number(row.revenue_brl),
      grossMarginBRL: row.gross_margin_brl != null ? Number(row.gross_margin_brl) : null,
      netMarginBRL: row.net_margin_brl != null ? Number(row.net_margin_brl) : null,
    })),
    topProducts: topProductRows.map((row): TopProductRow => ({
      sku: row.sku as string,
      productName: row.product_name as string,
      unitsSold: row.units_sold as number,
      revenueBRL: Number(row.revenue_brl),
    })),
  };
}

export async function listAdminOrders(): Promise<AdminOrderRow[]> {
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
    region: (row.region as string) ?? "N/A",
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
