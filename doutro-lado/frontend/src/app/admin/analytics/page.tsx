import { createClient } from "@/lib/supabase/server";
import { fetchAdminOverview, fetchAdminOrders } from "@/lib/admin-api";
import {
  AdminPageHeader,
  AdminSection,
  MetricCard,
} from "@/features/admin/AdminComponents";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Analytics — D'OUTRO LADO Admin" };

export default async function AdminAnalyticsPage() {
  const supabase = await createClient();
  const { data: { session } } = await supabase.auth.getSession();
  const token = session?.access_token ?? "";

  const [overview, orders] = await Promise.all([
    fetchAdminOverview(token),
    fetchAdminOrders(token),
  ]);

  const ordersByStatus = (orders ?? []).reduce<Record<string, number>>((acc, o) => {
    acc[o.orderStatus] = (acc[o.orderStatus] ?? 0) + 1;
    return acc;
  }, {});

  const paidOrders = (orders ?? []).filter((o) => o.paymentStatus === "paid");
  const conversionRate = orders?.length
    ? ((paidOrders.length / orders.length) * 100).toFixed(1)
    : "0.0";

  return (
    <div className="space-y-10">
      <AdminPageHeader
        eyebrow="Métricas de negócio"
        title="Analytics."
        description="Dados de receita, conversão e volume de pedidos. Derivados do pipeline transacional em tempo real."
      />

      {/* Global KPIs */}
      <AdminSection title="KPIs globais" eyebrow="Plataforma">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <MetricCard
            label="Receita total"
            value={`R$ ${(overview?.revenueBRL ?? 0).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`}
            highlight="gold"
          />
          <MetricCard label="Pedidos totais" value={overview?.orders ?? 0} />
          <MetricCard
            label="Ticket médio"
            value={`R$ ${(overview?.averageTicketBRL ?? 0).toFixed(0)}`}
          />
          <MetricCard label="Conversão" value={`${conversionRate}%`} highlight="green" />
        </div>
      </AdminSection>

      {/* Orders by status */}
      <AdminSection title="Pedidos por status operacional" eyebrow="Distribuição">
        <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-6">
          {["created", "processing", "packing", "shipped", "delivered", "cancelled"].map((s) => (
            <MetricCard key={s} label={s} value={ordersByStatus[s] ?? 0} />
          ))}
        </div>
      </AdminSection>

      {/* Brand breakdown */}
      <AdminSection title="Por marca" eyebrow="Segmentação">
        <div className="grid gap-4 sm:grid-cols-2">
          {(overview?.brandSummaries ?? []).map((b) => (
            <div key={b.brand} className="rounded-[20px] border border-white/8 bg-white/[0.02] p-5 space-y-3">
              <p className="text-[11px] uppercase tracking-[0.26em] text-white/38">{b.brand === "casa" ? "Casa" : "Moda"}</p>
              <p className="text-[28px] font-light text-white">
                R$ {b.revenueBRL.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
              </p>
              <p className="text-sm text-white/40">{b.orders} pedidos</p>
              <p className="text-sm text-white/40">
                Ticket médio: R$ {b.orders > 0 ? (b.revenueBRL / b.orders).toFixed(0) : 0}
              </p>
            </div>
          ))}
        </div>
      </AdminSection>
    </div>
  );
}
