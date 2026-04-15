import { requireAdminToken } from "@/lib/admin-server-auth";
import {
  fetchAdminOverview,
  fetchAdminOrders,
} from "@/lib/admin-api";
import {
  AdminPageHeader,
  AdminSection,
  AdminTable,
  AlertBanner,
  MetricCard,
  StatusBadge,
} from "@/features/admin/AdminComponents";
import type { AdminOrderRow, CountryBreakdownRow, TopProductRow } from "@/lib/types";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Dashboard — D'OUTRO LADO Admin" };

export default async function AdminDashboardPage() {
  const token = await requireAdminToken();

  const [overview, orders] = await Promise.all([
    fetchAdminOverview(token),
    fetchAdminOrders(token),
  ]);

  const modaSummary = overview?.brandSummaries.find((b) => b.brand === "moda");

  const orderColumns = [
    { key: "id", label: "Pedido" },
    { key: "customer", label: "Cliente" },
    { key: "region", label: "Regiao" },
    {
      key: "totalBRL",
      label: "Total",
      align: "right" as const,
      render: (r: AdminOrderRow) => <span>R$ {r.totalBRL.toFixed(2)}</span>,
    },
    { key: "paymentStatus", label: "Pagamento", render: (r: AdminOrderRow) => <StatusBadge status={r.paymentStatus} /> },
    { key: "orderStatus", label: "Status", render: (r: AdminOrderRow) => <StatusBadge status={r.orderStatus} /> },
    { key: "createdAt", label: "Data" },
  ];

  const countryColumns = [
    { key: "countryCode", label: "Pais", render: (r: CountryBreakdownRow) => (
      <span>{r.countryName ?? r.countryCode} <span className="text-white/30">({r.countryCode})</span></span>
    )},
    { key: "paidOrders", label: "Pedidos pagos", align: "right" as const },
    { key: "revenueBRL", label: "Receita (BRL)", align: "right" as const,
      render: (r: CountryBreakdownRow) => <span>R$ {r.revenueBRL.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</span> },
    { key: "grossMarginBRL", label: "Margem bruta", align: "right" as const,
      render: (r: CountryBreakdownRow) => r.grossMarginBRL != null
        ? <span className="text-green-400">R$ {r.grossMarginBRL.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</span>
        : <span className="text-white/25">N/D</span> },
    { key: "netMarginBRL", label: "Margem liquida", align: "right" as const,
      render: (r: CountryBreakdownRow) => r.netMarginBRL != null
        ? <span className={r.netMarginBRL >= 0 ? "text-green-400" : "text-red-400"}>
            R$ {r.netMarginBRL.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
          </span>
        : <span className="text-white/25">N/D</span> },
  ];

  const topProductColumns = [
    { key: "sku", label: "SKU" },
    { key: "productName", label: "Produto" },
    { key: "unitsSold", label: "Unidades", align: "right" as const },
    { key: "revenueBRL", label: "Receita (BRL)", align: "right" as const,
      render: (r: TopProductRow) => <span>R$ {r.revenueBRL.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</span> },
  ];

  const hasFinancialData = overview?.grossMarginBRL != null || overview?.netMarginBRL != null;

  return (
    <div className="space-y-10">
      <AdminPageHeader
        eyebrow="Painel administrativo"
        title="Dashboard operacional."
        description="Visao consolidada de receita, margem e pedidos — D'OUTRO LADO Moda."
      />

      {overview?.alerts && <AlertBanner alerts={overview.alerts} />}

      {/* KPIs */}
      <AdminSection title="Metricas globais" eyebrow="Resumo">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <MetricCard
            label="Faturamento total"
            value={`R$ ${(overview?.revenueBRL ?? 0).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`}
            highlight="gold"
          />
          <MetricCard label="Pedidos" value={overview?.orders ?? 0} />
          <MetricCard
            label="Ticket medio"
            value={`R$ ${(overview?.averageTicketBRL ?? 0).toFixed(0)}`}
          />
          <MetricCard label="Novos clientes (30d)" value={overview?.newCustomers ?? 0} highlight="green" />
        </div>
      </AdminSection>

      {/* Financial KPIs — paid orders only */}
      <AdminSection title="Margem financeira" eyebrow="Pedidos pagos — estimativa">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <MetricCard
            label="Receita paga (BRL)"
            value={`R$ ${(overview?.paidRevenueBRL ?? 0).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`}
            highlight="gold"
          />
          <MetricCard
            label="Margem bruta (BRL)"
            value={hasFinancialData && overview?.grossMarginBRL != null
              ? `R$ ${overview.grossMarginBRL.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`
              : "N/D"}
            sub={overview?.grossMarginPct != null ? `${overview.grossMarginPct.toFixed(1)}%` : undefined}
            highlight={hasFinancialData ? "green" : "default"}
          />
          <MetricCard
            label="Margem liquida (BRL)"
            value={hasFinancialData && overview?.netMarginBRL != null
              ? `R$ ${overview.netMarginBRL.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`
              : "N/D"}
            sub={overview?.netMarginPct != null ? `${overview.netMarginPct.toFixed(1)}%` : undefined}
            highlight={hasFinancialData ? (overview?.netMarginBRL != null && overview.netMarginBRL >= 0 ? "green" : "red") : "default"}
          />
          <MetricCard
            label="Fee gateway (est.)"
            value="~3.5%"
            sub="Estimativa Stripe BR — nao precisa"
            highlight="default"
          />
        </div>
        {!hasFinancialData && (
          <p className="mt-3 text-[12px] text-white/30">
            Dados de margem disponíveis somente para pedidos com custo de produto preenchido.
          </p>
        )}
      </AdminSection>

      {/* Country breakdown */}
      {(overview?.countryBreakdown ?? []).length > 0 && (
        <AdminSection title="Por pais de destino" eyebrow="Pedidos pagos">
          <AdminTable
            columns={countryColumns}
            rows={(overview?.countryBreakdown ?? []) as CountryBreakdownRow[]}
            rowKey={(r) => r.countryCode}
            emptyMessage="Nenhum pedido pago com pais de destino."
          />
        </AdminSection>
      )}

      {/* Top products */}
      {(overview?.topProducts ?? []).length > 0 && (
        <AdminSection title="Produtos mais vendidos" eyebrow="Pedidos pagos — top 10">
          <AdminTable
            columns={topProductColumns}
            rows={(overview?.topProducts ?? []) as TopProductRow[]}
            rowKey={(r) => r.sku}
            emptyMessage="Nenhum produto vendido ainda."
          />
        </AdminSection>
      )}

      {/* Moda summary */}
      {modaSummary && (
        <AdminSection title="Moda — Resumo" eyebrow="Colecoes">
          <div className="rounded-[20px] border border-[#C6A96B]/15 bg-[rgba(198,169,107,0.04)] p-5 space-y-3 max-w-sm">
            <p className="text-[10px] uppercase tracking-[0.22em] text-[#C6A96B]">Moda / Couro / Acessorios</p>
            <p className="text-[28px] font-light text-[#C6A96B]">
              R$ {(modaSummary.revenueBRL ?? 0).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
            </p>
            <p className="text-sm text-white/45">{modaSummary.orders ?? 0} pedidos</p>
          </div>
        </AdminSection>
      )}

      {/* Recent orders */}
      <AdminSection title="Pedidos recentes" eyebrow="Ultimos 10">
        <AdminTable
          columns={orderColumns}
          rows={(orders ?? []).slice(0, 10) as AdminOrderRow[]}
          rowKey={(r) => r.id}
          emptyMessage="Nenhum pedido encontrado."
        />
      </AdminSection>
    </div>
  );
}
