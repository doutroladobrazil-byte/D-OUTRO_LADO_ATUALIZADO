import { createClient } from "@/lib/supabase/server";
import { fetchAdminOrders } from "@/lib/admin-api";
import Link from "next/link";
import {
  AdminPageHeader,
  AdminSection,
  AdminTable,
  BrandChip,
  MetricCard,
  StatusBadge,
} from "@/features/admin/AdminComponents";
import type { AdminOrderRow } from "@/lib/types";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Pedidos — D'OUTRO LADO Admin" };

export default async function AdminOrdersPage() {
  const supabase = await createClient();
  const { data: { session } } = await supabase.auth.getSession();
  const orders = (await fetchAdminOrders(session?.access_token ?? "")) ?? [];

  const processing = orders.filter((o) => o.orderStatus === "processing").length;
  const paid = orders.filter((o) => o.paymentStatus === "paid").length;
  const shipped = orders.filter((o) => ["shipped", "packing"].includes(o.orderStatus)).length;
  const exceptions = orders.filter((o) => ["failed", "cancelled"].includes(o.paymentStatus) || o.orderStatus === "cancelled").length;

  const columns = [
    {
      key: "id",
      label: "Pedido",
      render: (r: AdminOrderRow) => (
        <Link href={`/admin/orders/${r.id}`} className="text-[#C6A96B] hover:underline underline-offset-2">
          {r.id}
        </Link>
      ),
    },
    { key: "brand", label: "Brand", render: (r: AdminOrderRow) => <BrandChip brand={r.brand} /> },
    { key: "customer", label: "Cliente" },
    { key: "region", label: "Região" },
    {
      key: "totalBRL",
      label: "Total (BRL)",
      align: "right" as const,
      render: (r: AdminOrderRow) => <span>R$ {r.totalBRL.toFixed(2)}</span>,
    },
    { key: "paymentStatus", label: "Pagamento", render: (r: AdminOrderRow) => <StatusBadge status={r.paymentStatus} /> },
    { key: "fiscalStatus", label: "Fiscal", render: (r: AdminOrderRow) => <StatusBadge status={r.fiscalStatus} /> },
    { key: "orderStatus", label: "Operação", render: (r: AdminOrderRow) => <StatusBadge status={r.orderStatus} /> },
    { key: "createdAt", label: "Data" },
  ];

  return (
    <div className="space-y-10">
      <AdminPageHeader
        eyebrow="Gestão de vendas"
        title="Pedidos."
        description="Todos os pedidos recebidos. Atualize status via API ou pelo painel de detalhe."
      />

      <div className="grid gap-4 sm:grid-cols-4">
        <MetricCard label="Em processamento" value={processing} />
        <MetricCard label="Pagos" value={paid} highlight="green" />
        <MetricCard label="Em transporte" value={shipped} />
        <MetricCard label="Exceções" value={exceptions} highlight={exceptions > 0 ? "red" : "default"} />
      </div>

      <AdminSection title="Todos os pedidos" eyebrow={`${orders.length} registros`}>
        <AdminTable
          columns={columns}
          rows={orders as AdminOrderRow[]}
          rowKey={(r) => r.id}
          emptyMessage="Nenhum pedido encontrado."
        />
      </AdminSection>
    </div>
  );
}
