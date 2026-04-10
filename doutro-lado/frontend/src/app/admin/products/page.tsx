import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { fetchAdminProducts } from "@/lib/admin-api";
import type { AdminProduct } from "@/lib/admin-api";
import {
  AdminPageHeader,
  AdminSection,
  AdminTable,
  BrandChip,
  MetricCard,
  StatusBadge,
  StockIndicator,
} from "@/features/admin/AdminComponents";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Produtos — D'OUTRO LADO Admin" };

export default async function AdminProductsPage() {
  const supabase = await createClient();
  const { data: { session } } = await supabase.auth.getSession();
  const products = (await fetchAdminProducts(session?.access_token ?? "")) ?? [];

  const active = products.filter((p) => p.isActive).length;
  const featured = products.filter((p) => p.isFeatured).length;
  const lowStock = products.filter((p) => p.stock < 5 && p.isActive).length;
  const inactive = products.filter((p) => !p.isActive).length;

  const columns = [
    { key: "brand", label: "Brand", render: (r: AdminProduct) => <BrandChip brand={r.brand} /> },
    { key: "sku", label: "SKU" },
    { key: "name", label: "Produto" },
    { key: "category", label: "Categoria" },
    {
      key: "retailPriceBRL",
      label: "P. Varejo",
      align: "right" as const,
      render: (r: AdminProduct) => <span>R$ {r.retailPriceBRL.toFixed(2)}</span>,
    },
    {
      key: "stock",
      label: "Estoque",
      align: "right" as const,
      render: (r: AdminProduct) => <StockIndicator stock={r.stock} />,
    },
    {
      key: "isActive",
      label: "Status",
      render: (r: AdminProduct) => <StatusBadge status={r.isActive ? "active" : "inactive"} />,
    },
    {
      key: "isFeatured",
      label: "Destaque",
      render: (r: AdminProduct) => r.isFeatured ? <StatusBadge status="active" /> : null,
    },
    {
      key: "id",
      label: "",
      render: (r: AdminProduct) => (
        <Link
          href={`/admin/products/${r.id}`}
          className="rounded-[8px] border border-white/10 bg-white/[0.03] px-3 py-1 text-[11px] text-white/50 transition hover:border-[#C6A96B]/40 hover:text-[#C6A96B]"
        >
          Editar
        </Link>
      ),
    },
  ];

  return (
    <div className="space-y-10">
      <AdminPageHeader
        eyebrow="Gestão de catálogo"
        title="Produtos."
        description="Todos os SKUs cadastrados. Crie novos produtos, edite campos e gerencie imagens."
      />

      <div className="grid gap-4 sm:grid-cols-4">
        <MetricCard label="Ativos" value={active} highlight="green" />
        <MetricCard label="Em destaque" value={featured} highlight="gold" />
        <MetricCard label="Estoque crítico" value={lowStock} highlight={lowStock > 0 ? "red" : "default"} />
        <MetricCard label="Inativos" value={inactive} />
      </div>

      <AdminSection
        title="Catálogo completo"
        eyebrow={`${products.length} SKUs`}
        action={
          <Link
            href="/admin/products/new"
            className="rounded-[12px] bg-[#C6A96B] px-5 py-2 text-sm font-medium text-black transition hover:bg-[#d4b87a]"
          >
            + Novo produto
          </Link>
        }
      >
        <AdminTable
          columns={columns}
          rows={products as AdminProduct[]}
          rowKey={(r) => r.id}
          emptyMessage="Nenhum produto cadastrado. Clique em '+ Novo produto' para começar."
        />
      </AdminSection>
    </div>
  );
}
