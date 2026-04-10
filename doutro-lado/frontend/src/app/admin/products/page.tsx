import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { fetchAdminProducts } from "@/lib/admin-api";
import {
  AdminPageHeader,
  AdminSection,
  MetricCard,
} from "@/features/admin/AdminComponents";
import { AdminProductsList } from "@/features/admin/AdminProductsList";
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
        <AdminProductsList products={products} />
      </AdminSection>
    </div>
  );
}
