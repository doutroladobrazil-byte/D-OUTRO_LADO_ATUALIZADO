import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { fetchAdminProductById } from "@/lib/admin-api";
import { AdminPageHeader } from "@/features/admin/AdminComponents";
import { ProductForm } from "@/features/admin/ProductForm";
import { ProductMediaManager } from "@/features/admin/ProductMediaManager";
import type { Metadata } from "next";

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  return { title: `Editar Produto — D'OUTRO LADO Admin` };
}

export default async function EditProductPage({ params }: Props) {
  const { id } = await params;

  const supabase = await createClient();
  const { data: { session } } = await supabase.auth.getSession();
  const token = session?.access_token ?? process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";

  const product = await fetchAdminProductById(token, id);
  if (!product) notFound();

  return (
    <div className="space-y-12">
      {/* Header */}
      <AdminPageHeader
        eyebrow={`Catálogo / ${product.sku}`}
        title={product.name}
        description={`${product.isActive ? "Ativo" : "Inativo"} · ${product.brand} · Estoque: ${product.stock}`}
      />

      {/* Form */}
      <div className="max-w-4xl">
        <ProductForm mode="edit" product={product} />
      </div>

      {/* Divider */}
      <div className="border-t border-white/5" />

      {/* Media manager */}
      <div className="max-w-4xl">
        <ProductMediaManager productId={product.id} productBrand={product.brand} />
      </div>
    </div>
  );
}
