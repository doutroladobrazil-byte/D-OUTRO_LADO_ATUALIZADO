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

// ── helpers ───────────────────────────────────────────────────────────────────

function fmt(n: number) {
  return n.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function coveragePct(covered: number, total: number): string | null {
  if (total === 0) return null;
  return `${Math.round((covered / total) * 100)}%`;
}

// ── page ──────────────────────────────────────────────────────────────────────

export default async function AdminDashboardPage() {
  const token = await requireAdminToken();

  const [overview, orders] = await Promise.all([
    fetchAdminOverview(token),
    fetchAdminOrders(token),
  ]);

  const modaSummary = overview?.brandSummaries.find((b) => b.brand === "moda");

  // Coverage signals
  const orderCoveragePct = coveragePct(
    overview?.paidOrdersCovered ?? 0,
    overview?.paidOrdersTotal ?? 0,
  );
  const revCoveragePct = coveragePct(
    overview?.paidRevenueBRLCovered ?? 0,
    overview?.paidRevenueBRLTotal ?? 0,
  );
  const hasMarginData = overview?.grossMarginBRL != null;

  // ── table columns ─────────────────────────────────────────────────────────

  const orderColumns = [
    { key: "id", label: "Pedido" },
    { key: "customer", label: "Cliente" },
    { key: "region", label: "Região" },
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
    {
      key: "countryCode",
      label: "Pais",
      render: (r: CountryBreakdownRow) => (
        <span>
          {r.countryName ?? r.countryCode}{" "}
          <span className="text-white/30">({r.countryCode})</span>
        </span>
      ),
    },
    {
      key: "paidOrders",
      label: "Pedidos pagos",
      align: "right" as const,
      render: (r: CountryBreakdownRow) => (
        <span>
          {r.paidOrders}
          {r.coveredOrders < r.paidOrders && (
            <span className="ml-1.5 text-white/30 text-[11px]">({r.coveredOrders} cobertos)</span>
          )}
        </span>
      ),
    },
    {
      key: "revenueBRLTotal",
      label: "Receita total",
      align: "right" as const,
      render: (r: CountryBreakdownRow) => <span>R$ {fmt(r.revenueBRLTotal)}</span>,
    },
    {
      key: "grossMarginBRL",
      label: "Margem bruta*",
      align: "right" as const,
      render: (r: CountryBreakdownRow) =>
        r.grossMarginBRL != null ? (
          <span className="text-green-400">
            R$ {fmt(r.grossMarginBRL)}
            {r.grossMarginPctOnCovered != null && (
              <span className="ml-1 text-green-400/60 text-[11px]">({r.grossMarginPctOnCovered.toFixed(1)}%)</span>
            )}
          </span>
        ) : (
          <span className="text-white/25">N/D</span>
        ),
    },
    {
      key: "netMarginBRL",
      label: "Margem líquida*",
      align: "right" as const,
      render: (r: CountryBreakdownRow) =>
        r.netMarginBRL != null ? (
          <span className={r.netMarginBRL >= 0 ? "text-green-400" : "text-red-400"}>
            R$ {fmt(r.netMarginBRL)}
            {r.netMarginPctOnCovered != null && (
              <span className="ml-1 text-[11px] opacity-60">({r.netMarginPctOnCovered.toFixed(1)}%)</span>
            )}
          </span>
        ) : (
          <span className="text-white/25">N/D</span>
        ),
    },
  ];

  const topProductColumns = [
    { key: "sku", label: "SKU" },
    { key: "productName", label: "Produto" },
    { key: "unitsSold", label: "Unidades", align: "right" as const },
    {
      key: "revenueBRL",
      label: "Receita paga (BRL)",
      align: "right" as const,
      render: (r: TopProductRow) => <span>R$ {fmt(r.revenueBRL)}</span>,
    },
  ];

  return (
    <div className="space-y-10">
      <AdminPageHeader
        eyebrow="Painel administrativo"
        title="Dashboard operacional."
        description="Visão consolidada de receita, margem e pedidos — D'OUTRO LADO Moda."
      />

      {overview?.alerts && <AlertBanner alerts={overview.alerts} />}

      {/* KPIs globais */}
      <AdminSection title="Métricas globais" eyebrow="Resumo">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <MetricCard
            label="Faturamento total"
            value={`R$ ${fmt(overview?.revenueBRL ?? 0)}`}
            highlight="gold"
          />
          <MetricCard label="Pedidos" value={overview?.orders ?? 0} />
          <MetricCard
            label="Ticket médio"
            value={`R$ ${(overview?.averageTicketBRL ?? 0).toFixed(0)}`}
          />
          <MetricCard label="Novos clientes (30d)" value={overview?.newCustomers ?? 0} highlight="green" />
        </div>
      </AdminSection>

      {/* Margem financeira */}
      <AdminSection title="Margem financeira" eyebrow="Pedidos pagos — estimativa sobre base coberta">
        {/* Cobertura */}
        <div className="mb-4 rounded-[14px] border border-white/8 bg-white/[0.02] px-5 py-3 flex flex-wrap gap-6 text-sm">
          <span className="text-white/45">
            Pedidos pagos:{" "}
            <span className="text-white font-medium">{overview?.paidOrdersTotal ?? 0}</span>
            {" "}total
            {" · "}
            <span className="text-white font-medium">{overview?.paidOrdersCovered ?? 0}</span>
            {" "}com snapshot financeiro
            {orderCoveragePct && (
              <span className="ml-1 text-white/30">({orderCoveragePct} cobertos)</span>
            )}
          </span>
          <span className="text-white/45">
            Receita paga:{" "}
            <span className="text-white font-medium">R$ {fmt(overview?.paidRevenueBRLTotal ?? 0)}</span>
            {" "}total
            {" · "}
            <span className="text-white font-medium">R$ {fmt(overview?.paidRevenueBRLCovered ?? 0)}</span>
            {" "}coberta
            {revCoveragePct && (
              <span className="ml-1 text-white/30">({revCoveragePct})</span>
            )}
          </span>
        </div>

        {/* Margin cards */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <MetricCard
            label="Receita coberta (BRL)"
            value={`R$ ${fmt(overview?.paidRevenueBRLCovered ?? 0)}`}
            sub={revCoveragePct ? `${revCoveragePct} da receita paga total` : undefined}
            highlight="default"
          />
          <MetricCard
            label="Margem bruta*"
            value={hasMarginData && overview?.grossMarginBRL != null
              ? `R$ ${fmt(overview.grossMarginBRL)}`
              : "N/D"}
            sub={overview?.grossMarginPctOnCovered != null
              ? `${overview.grossMarginPctOnCovered.toFixed(1)}% da receita coberta`
              : undefined}
            highlight={hasMarginData ? "green" : "default"}
          />
          <MetricCard
            label="Margem liquida*"
            value={hasMarginData && overview?.netMarginBRL != null
              ? `R$ ${fmt(overview.netMarginBRL)}`
              : "N/D"}
            sub={overview?.netMarginPctOnCovered != null
              ? `${overview.netMarginPctOnCovered.toFixed(1)}% da receita coberta`
              : undefined}
            highlight={hasMarginData
              ? (overview?.netMarginBRL != null && overview.netMarginBRL >= 0 ? "green" : "red")
              : "default"}
          />
          <MetricCard
            label="Fee gateway (est.)"
            value="~3.5%"
            sub="Estimativa Stripe BR — nao precisa"
            highlight="default"
          />
        </div>

        <p className="mt-3 text-[11px] text-white/30">
          * Margem calculada apenas sobre pedidos com custo de produto preenchido e sem kit.
          Percentuais usam receita coberta como denominador, nao receita total.
          Fee de gateway e estimativa — nao e registro preciso da gateway.
        </p>
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
          <p className="mt-2 text-[11px] text-white/30">
            * Margens e percentuais calculados apenas sobre receita coberta por snapshot financeiro.
            N/D indica ausencia de snapshot (custo nao configurado ou pedido com kit).
          </p>
        </AdminSection>
      )}

      {/* Top products */}
      {(overview?.topProducts ?? []).length > 0 && (
        <AdminSection title="Produtos mais vendidos" eyebrow="Pedidos pagos — receita total — top 10">
          <AdminTable
            columns={topProductColumns}
            rows={(overview?.topProducts ?? []) as TopProductRow[]}
            rowKey={(r) => r.sku}
            emptyMessage="Nenhum produto vendido ainda."
          />
          <p className="mt-2 text-[11px] text-white/30">
            Receita por produto usa todos os pedidos pagos, independente de cobertura financeira.
          </p>
        </AdminSection>
      )}

      {/* Moda summary */}
      {modaSummary && (
        <AdminSection title="Moda — Resumo" eyebrow="Colecoes">
          <div className="rounded-[20px] border border-[#C6A96B]/15 bg-[rgba(198,169,107,0.04)] p-5 space-y-3 max-w-sm">
            <p className="text-[10px] uppercase tracking-[0.22em] text-[#C6A96B]">Moda / Couro / Acessorios</p>
            <p className="text-[28px] font-light text-[#C6A96B]">
              R$ {fmt(modaSummary.revenueBRL ?? 0)}
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
