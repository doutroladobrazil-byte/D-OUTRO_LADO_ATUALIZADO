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

  const countryLabel = order.destinationCountryName
    ? `${order.destinationCountryName} (${order.destinationCountryCode})`
    : order.shippingRegion;

  return (
    <div className="space-y-10">
      <AdminPageHeader
        eyebrow={`Pedido ${order.publicId}`}
        title={`${order.customerName}`}
        description={`${order.isGuest ? "Guest" : "Autenticado"} · ${countryLabel} · ${order.createdAt.split("T")[0]}`}
      />

      {/* Status Trinity */}
      <OrderStatusPatcher
        orderId={order.publicId}
        currentOrderStatus={order.orderStatus}
        currentPaymentStatus={order.paymentStatus}
        currentFiscalStatus={order.fiscalStatus}
        adminToken={token}
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

      {/* Financial snapshot — Stage 16 */}
      <AdminSection title="Snapshot de margem" eyebrow="Calculado na criacao do pedido">
        {order.grossMarginBRLSnapshot != null ? (
          <>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <MetricCard
                label="Custo produtos (BRL)"
                value={`R$ ${order.productCostBRLSnapshot!.toFixed(2)}`}
              />
              <MetricCard
                label="Fee gateway (est.)"
                value={`R$ ${order.gatewayFeeBRLSnapshot!.toFixed(2)}`}
                sub="~3.5% do total — estimativa"
              />
              <MetricCard
                label="Margem bruta"
                value={`R$ ${order.grossMarginBRLSnapshot.toFixed(2)}`}
                sub={`${((order.grossMarginBRLSnapshot / order.totalBRL) * 100).toFixed(1)}% sobre total do pedido`}
                highlight="green"
              />
              <MetricCard
                label="Margem liquida"
                value={`R$ ${order.netMarginBRLSnapshot!.toFixed(2)}`}
                sub={`${((order.netMarginBRLSnapshot! / order.totalBRL) * 100).toFixed(1)}% sobre total do pedido`}
                highlight={order.netMarginBRLSnapshot! >= 0 ? "green" : "red"}
              />
            </div>
            <p className="mt-3 text-[11px] text-white/30">
              Fee de gateway é estimativa (~3.5% Stripe BR) — não é registro preciso da gateway.
              Snapshot capturado no momento da criação do pedido.
            </p>
          </>
        ) : (() => {
          const hasKitItem = order.items.some((i) => i.isKitItem);
          const reason = hasKitItem
            ? "Pedido contém kit — custo de componentes não consolidado (política MVP: snapshot nulo para pedidos com kit)."
            : "Custo de produto não configurado para um ou mais itens, ou pedido criado antes do Stage 16.";
          return (
            <div className="rounded-[14px] border border-white/8 bg-white/[0.02] px-5 py-4">
              <p className="text-[11px] uppercase tracking-[0.2em] text-white/30 mb-2">N/D — sem snapshot financeiro</p>
              <p className="text-[13px] text-white/45">{reason}</p>
            </div>
          );
        })()}
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

      {/* Contact + Shipping */}
      <AdminSection title="Contato e entrega" eyebrow={order.isGuest ? "Pedido Guest" : "Pedido Autenticado"}>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-[16px] border border-white/8 bg-white/[0.02] p-4 space-y-2 text-sm">
            <p className="text-[11px] uppercase tracking-[0.2em] text-white/35 mb-3">Contato</p>
            <p className="text-white">{order.customerName}</p>
            {order.customerEmail && <p className="text-white/60">{order.customerEmail}</p>}
            {order.customerPhone && <p className="text-white/60">{order.customerPhone}</p>}
            {order.isGuest && (
              <span className="inline-block mt-1 rounded-full border border-amber-400/30 bg-amber-400/10 px-2 py-0.5 text-[10px] uppercase tracking-[0.15em] text-amber-300">
                Guest
              </span>
            )}
          </div>
          <div className="rounded-[16px] border border-white/8 bg-white/[0.02] p-4 space-y-1 text-sm">
            <p className="text-[11px] uppercase tracking-[0.2em] text-white/35 mb-3">Endereço de entrega</p>
            {order.shippingLine1 ? (
              <>
                <p className="text-white">{order.shippingLine1}</p>
                {order.shippingLine2 && <p className="text-white/70">{order.shippingLine2}</p>}
                <p className="text-white/70">
                  {[order.shippingCity, order.shippingStateRegion, order.shippingPostalCode].filter(Boolean).join(", ")}
                </p>
                <p className="text-white/70">{order.destinationCountryName ?? order.destinationCountryCode}</p>
              </>
            ) : (
              <p className="text-white/30">Endereço não disponível (pedido pré-Stage 14)</p>
            )}
          </div>
        </div>
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
