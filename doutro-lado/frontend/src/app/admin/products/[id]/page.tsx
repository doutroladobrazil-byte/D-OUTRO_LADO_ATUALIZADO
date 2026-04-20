import { notFound } from "next/navigation";
import { requireAdminToken } from "@/lib/admin-server-auth";
import { fetchAdminProductById, fetchProductAvailability, fetchAdminProductMedia } from "@/lib/admin-api";
import { AdminPageHeader } from "@/features/admin/AdminComponents";
import { ProductForm } from "@/features/admin/ProductForm";
import { ProductMediaManager } from "@/features/admin/ProductMediaManager";
import { ProductCountryAvailability } from "@/features/admin/ProductCountryAvailability";
import { getSkuReadiness } from "@/features/admin/skuReadiness";
import type { Metadata } from "next";

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  return { title: `Editar Produto — D'OUTRO LADO Admin` };
}

export default async function EditProductPage({ params }: Props) {
  const { id } = await params;

  const token = await requireAdminToken();
  const product = await fetchAdminProductById(token, id);
  if (!product) notFound();

  const [availability, mediaList] = await Promise.all([
    fetchProductAvailability(token, product.id),
    fetchAdminProductMedia(token, product.id),
  ]);
  const countriesEnabled = availability
    ? Object.values(availability).filter(Boolean).length
    : 0;
  const mediaCount = mediaList?.length ?? 0;
  const readiness = getSkuReadiness({
    isActive: product.isActive,
    countriesEnabled,
    mediaCount,
    stock: product.stock,
  });

  const readinessBannerColor: Record<string, string> = {
    "sem-paises": "border-red-400/25 bg-red-400/5 text-red-300",
    "sem-midia": "border-amber-400/25 bg-amber-400/5 text-amber-300",
    "sem-estoque": "border-orange-400/25 bg-orange-400/5 text-orange-300",
    "inativo": "border-white/10 bg-white/[0.03] text-white/40",
  };
  const bannerColor = readinessBannerColor[readiness.status];

  return (
    <div className="space-y-12">
      {/* Header */}
      <AdminPageHeader
        eyebrow={`Catálogo / ${product.sku}`}
        title={product.name}
        description={`${product.isActive ? "Ativo" : "Inativo"} · ${product.brand} · Estoque: ${product.stock}`}
      />

      {/* Readiness banner */}
      {readiness.status !== "pronto" && (
        <div className={`max-w-4xl flex items-center gap-3 rounded-[12px] border px-5 py-3 ${bannerColor}`}>
          <span className="text-sm font-semibold">{readiness.label}</span>
          <span className="text-sm opacity-80">{readiness.hint}</span>
          {readiness.status === "sem-paises" && (
            <a href="#countries" className="ml-auto shrink-0 text-sm text-[#C6A96B] underline underline-offset-2 hover:text-[#d4b87a]">
              Configurar países ↓
            </a>
          )}
          {readiness.status === "sem-midia" && (
            <a href="#media" className="ml-auto shrink-0 text-sm text-[#C6A96B] underline underline-offset-2 hover:text-[#d4b87a]">
              Adicionar mídia ↓
            </a>
          )}
        </div>
      )}

      {/* Form */}
      <div className="max-w-4xl">
        <ProductForm mode="edit" product={product} adminToken={token} />
      </div>

      {/* Divider */}
      <div className="border-t border-white/5" />

      {/* Media manager */}
      <div id="media" className="max-w-4xl">
        <ProductMediaManager productId={product.id} productBrand={product.brand} adminToken={token} />
      </div>

      {/* Divider */}
      <div className="border-t border-white/5" />

      {/* Country availability — Stage 13 */}
      <div id="countries" className="max-w-4xl">
        <ProductCountryAvailability productId={product.id} token={token} />
      </div>
    </div>
  );
}
