import { getAdminDashboard } from "@/lib/storefront";
import { AdminModulePage } from "@/features/admin/AdminModulePage";

export default async function AdminDashboardPage() {
  const { overview, orders } = await getAdminDashboard();

  return (
    <AdminModulePage
      eyebrow="Dashboard"
      title="Operacao premium com clareza executiva."
      description="Uma leitura inspirada em Linear, Stripe e Notion para faturamento, pedidos, atendimento e ritmo da operacao internacional."
      metrics={[
        { label: "Faturamento", value: `R$ ${overview.revenueBRL.toFixed(2)}` },
        { label: "Pedidos", value: String(overview.orders) },
        { label: "Ticket medio", value: `R$ ${overview.averageTicketBRL.toFixed(2)}` },
        { label: "Novos clientes", value: String(overview.newCustomers) }
      ]}
      rows={orders.slice(0, 4).map((order) => ({
        label: `${order.id} • ${order.customer}`,
        value: `${order.orderStatus} • ${order.paymentStatus}`
      }))}
    />
  );
}
