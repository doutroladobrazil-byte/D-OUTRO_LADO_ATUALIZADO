import { createClient } from "@/lib/supabase/server";
import {
  fetchAdminOverview,
  fetchAdminOrders,
} from "@/lib/admin-api";
import {
  AdminPageHeader,
  AdminSection,
  AdminTable,
  AlertBanner,
  BrandChip,
  MetricCard,
  StatusBadge,
} from "@/features/admin/AdminComponents";
import type { AdminOrderRow } from "@/lib/types";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Dashboard — D'OUTRO LADO Admin" };

export default async function AdminDashboardPage() {
  const supabase = await createClient();
  const { data: { session } } = await supabase.auth.getSession();
  const token = session?.access_token ?? "";

  const [overview, orders] = await Promise.all([
    fetchAdminOverview(token),
    fetchAdminOrders(token),
  ]);

  const casaSummary = overview?.brandSummaries.find((b) => b.brand === "casa");
  const modaSummary = overview?.brandSummaries.find((b) => b.brand === "moda");

  const orderColumns = [
    { key: "id", label: "Pedido" },
    { key: "brand", label: "Brand", render: (r: AdminOrderRow) => <BrandChip brand={r.brand} /> },
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

  return (
    <div className="space-y-10">
      <AdminPageHeader
        eyebrow="Painel administrativo"
        title="Dashboard operacional."
        description="Visão consolidada de receita, pedidos e alertas para ambas as marcas."
      />

      {overview?.alerts && <AlertBanner alerts={overview.alerts} />}

      {/* KPIs */}
      <AdminSection title="Métricas globais" eyebrow="Resumo">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <MetricCard
            label="Faturamento total"
            value={`R$ ${(overview?.revenueBRL ?? 0).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`}
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

      {/* Brand breakdown */}
      <AdminSection title="Por marca" eyebrow="Segmentação">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-[20px] border border-[#D9DDE3]/10 bg-white/[0.025] p-5 space-y-3">
            <BrandChip brand="casa" />
            <p className="text-[28px] font-light text-white">
              R$ {(casaSummary?.revenueBRL ?? 0).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
            </p>
            <p className="text-sm text-white/45">{casaSummary?.orders ?? 0} pedidos</p>
          </div>
          <div className="rounded-[20px] border border-[#C6A96B]/15 bg-[rgba(198,169,107,0.04)] p-5 space-y-3">
            <BrandChip brand="moda" />
            <p className="text-[28px] font-light text-[#C6A96B]">
              R$ {(modaSummary?.revenueBRL ?? 0).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
            </p>
            <p className="text-sm text-white/45">{modaSummary?.orders ?? 0} pedidos</p>
          </div>
        </div>
      </AdminSection>

      {/* Recent orders */}
      <AdminSection title="Pedidos recentes" eyebrow="Últimos 10">
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
