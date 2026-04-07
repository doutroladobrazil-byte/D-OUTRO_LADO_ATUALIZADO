import { createClient } from "@/lib/supabase/server";
import { getAdminDashboard } from "@/lib/storefront";
import { AdminModulePage } from "@/features/admin/AdminModulePage";

export default async function AdminDashboardPage() {
  const supabase = await createClient();
  const { data: { session } } = await supabase.auth.getSession();

  const { overview, orders } = await getAdminDashboard(session?.access_token ?? "");

  const casaSummary = overview.brandSummaries.find((item) => item.brand === "casa");
  const modaSummary = overview.brandSummaries.find((item) => item.brand === "moda");

  return (
    <AdminModulePage
      eyebrow="Dashboard"
      title="Operacao premium unica, com jornadas separadas por site."
      description="O painel administrativo permanece unico, enquanto Casa e Moda seguem separados para o cliente e segmentados para a operacao."
      metrics={[
        { label: "Faturamento", value: `R$ ${overview.revenueBRL.toFixed(2)}` },
        { label: "Pedidos", value: String(overview.orders) },
        { label: "Casa", value: `${casaSummary?.orders ?? 0} pedidos` },
        { label: "Moda", value: `${modaSummary?.orders ?? 0} pedidos` }
      ]}
      rows={orders.slice(0, 4).map((order) => ({
        label: `${order.id} | ${order.customer} | ${order.brand === "casa" ? "Casa" : "Moda"}`,
        value: `${order.orderStatus} | ${order.paymentStatus}`
      }))}
    />
  );
}
