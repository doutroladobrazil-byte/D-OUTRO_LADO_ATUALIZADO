import { requireAdminToken } from "@/lib/admin-server-auth";
import { fetchAdminStock } from "@/lib/admin-api";
import type { StockOverview } from "@/lib/admin-api";
import {
  AdminPageHeader,
  AdminSection,
  AdminTable,
  BrandChip,
  MetricCard,
  StatusBadge,
  StockIndicator,
} from "@/features/admin/AdminComponents";
import type { Brand } from "@/lib/types";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Estoque — D'OUTRO LADO Admin" };

type StockItem = StockOverview["items"][number];

export default async function AdminInventoryPage() {
  const token = await requireAdminToken();
  const overview = await fetchAdminStock(token);

  // Sort: critical first by available stock
  const items = (overview?.items ?? []).slice().sort((a, b) => a.available - b.available);

  const columns = [
    { key: "brand", label: "Brand", render: (r: StockItem) => <BrandChip brand={r.brand} /> },
    { key: "sku", label: "SKU" },
    { key: "name", label: "Produto" },
    {
      key: "stock",
      label: "Físico",
      align: "right" as const,
      render: (r: StockItem) => <StockIndicator stock={r.stock} />,
    },
    {
      key: "reserved",
      label: "Reservado",
      align: "right" as const,
      render: (r: StockItem) => (
        <span className={r.reserved > 0 ? "text-amber-400 font-mono text-sm" : "text-white/30 font-mono text-sm"}>
          {r.reserved}
        </span>
      ),
    },
    {
      key: "available",
      label: "Disponível",
      align: "right" as const,
      render: (r: StockItem) => <StockIndicator stock={r.available} />,
    },
    {
      key: "isActive",
      label: "Status",
      render: (r: StockItem) => <StatusBadge status={r.isActive ? "active" : "inactive"} />,
    },
  ];

  return (
    <div className="space-y-10">
      <AdminPageHeader
        eyebrow="Controle de inventário"
        title="Estoque."
        description="Visão completa de disponibilidade por SKU. SKUs com menos de 5 unidades estão em estado crítico."
      />

      <div className="grid gap-4 sm:grid-cols-4">
        <MetricCard label="Total de SKUs" value={overview?.totalSKUs ?? 0} />
        <MetricCard
          label="Críticos (< 5)"
          value={overview?.critical ?? 0}
          highlight={(overview?.critical ?? 0) > 0 ? "red" : "default"}
        />
        <MetricCard
          label="Sem estoque"
          value={overview?.outOfStock ?? 0}
          highlight={(overview?.outOfStock ?? 0) > 0 ? "red" : "default"}
        />
        <MetricCard label="Saudáveis (≥ 20)" value={overview?.healthy ?? 0} highlight="green" />
      </div>

      <AdminSection title="Todos os SKUs" eyebrow="Ordenado por criticidade">
        <AdminTable
          columns={columns}
          rows={(items ?? []) as StockItem[]}
          rowKey={(r) => r.sku}
          emptyMessage="Nenhum SKU encontrado."
        />
      </AdminSection>
    </div>
  );
}
