import { notFound } from "next/navigation";
import { requireAdminToken } from "@/lib/admin-server-auth";
import { fetchAdminOrderDetail } from "@/lib/admin-api";
import {
  AdminPageHeader,
  AdminSection,
  AdminTable,
  BrandChip,
  MetricCard,
  StatusBadge,
} from "@/features/admin/AdminComponents";
import { OrderStatusPatcher } from "@/features/admin/OrderStatusPatcher";
import type { AdminOrderDetail } from "@/lib/admin-api";
import type { Brand } from "@/lib/types";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Detalhe do pedido — Admin" };

type Item = AdminOrderDetail["items"][number];

export default async function AdminOrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const token = await requireAdminToken();
  const order = await fetchAdminOrderDetail(token, id);

  if (!order) notFound();

  const itemColumns = [
    { key: "productName", label: "Produto" },
    { key: "sku", label: "SKU" },
    { key: "brand", label: "Brand", render: (r: Item) => <BrandChip brand={r.brand as Brand} /> },
    { key: "quantity", label: "Qtd", align: "right" as const },
    {
      key: "unitPriceBRL",
      label: "Unitário",
      align: "right" as const,
      render: (r: Item) => <span>R$ {r.unitPriceBRL.toFixed(2)}</span>,
    },
    {
      key: "lineTotalBRL",
      label: "Subtotal",
      align: "right" as const,
      render: (r: Item) => <span className="font-medium">R$ {r.lineTotalBRL.toFixed(2)}</span>,
    },
    { key: "weightRange", label: "Peso" },
  ];

  return (
    <div className="space-y-10">
      <AdminPageHeader
        eyebrow={`Pedido ${order.publicId}`}
        title={`${order.customerName}`}
        description={`Moda · ${order.shippingRegion} · ${order.createdAt.split("T")[0]}`}
      />

      {/* Status Trinity */}
      <OrderStatusPatcher
        orderId={order.publicId}
        currentOrderStatus={order.orderStatus}
        currentPaymentStatus={order.paymentStatus}
        currentFiscalStatus={order.fiscalStatus}
      />

      {/* Financial summary */}
      <AdminSection title="Resumo financeiro" eyebrow="Valores">
        <div className="grid gap-4 sm:grid-cols-4">
          <MetricCard label="Subtotal" value={`R$ ${order.subtotalBRL.toFixed(2)}`} />
          <MetricCard label="Frete" value={`R$ ${order.freightBRL.toFixed(2)}`} />
          <MetricCard label="Total" value={`R$ ${order.totalBRL.toFixed(2)}`} highlight="gold" />
          <MetricCard label="Faixa de peso" value={order.estimatedWeightRange} />
        </div>
      </AdminSection>

      {/* Status badges */}
      <AdminSection title="Status atual" eyebrow="Classificações">
        <div className="flex flex-wrap gap-3">
          <StatusBadge status={order.orderStatus} />
          <StatusBadge status={order.paymentStatus} />
          <StatusBadge status={order.fiscalStatus} />
          <BrandChip brand={order.brand} />
        </div>
        {order.stripeSessionId && (
          <p className="mt-3 text-[12px] text-white/30">
            Stripe session: <code className="text-white/50">{order.stripeSessionId}</code>
          </p>
        )}
        {order.notes && (
          <div className="mt-3 rounded-[14px] border border-white/8 bg-white/[0.02] p-4 text-sm text-white/55">
            {order.notes}
          </div>
        )}
      </AdminSection>

      {/* Order items */}
      <AdminSection title="Itens do pedido" eyebrow={`${order.items.length} itens`}>
        <AdminTable
          columns={itemColumns}
          rows={order.items as Item[]}
          rowKey={(r) => r.sku + r.productName}
          emptyMessage="Nenhum item encontrado."
        />
      </AdminSection>
    </div>
  );
}
