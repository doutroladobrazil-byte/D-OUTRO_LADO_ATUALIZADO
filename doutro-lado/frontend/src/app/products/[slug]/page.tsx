import { notFound } from "next/navigation";
import { ProductCard } from "@/components/ProductCard";
import { ProductGallery } from "@/components/ProductGallery";
import { getBrandCartPath, getBrandCheckoutPath, isBrand } from "@/lib/brand";
import { GlassCard } from "@/components/ui/GlassCard";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { getFreightRates, getProductBySlug, getProducts } from "@/lib/storefront";
import { ProductPurchaseActions } from "@/features/catalog/ProductPurchaseActions";

type PageProps = {
  params: Promise<{ slug: string }>;
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

export default async function ProductPage({ params, searchParams }: PageProps) {
  const { slug } = await params;
  const resolvedSearchParams = searchParams ? await searchParams : undefined;
  const product = await getProductBySlug(slug);
  if (!product) notFound();

  const siteParam = resolvedSearchParams?.site;
  const activeBrand = typeof siteParam === "string" && isBrand(siteParam) ? siteParam : product.brand;
  const cartHref = getBrandCartPath(activeBrand);
  const checkoutHref = getBrandCheckoutPath(activeBrand);

  const [related, freightRates] = await Promise.all([getProducts(product.brand), getFreightRates()]);
  const previewRates = freightRates.filter((rate) => rate.weightRange === product.weightRange).slice(0, 3);

  return (
    <main className="px-6 py-10">
      <div className="mx-auto max-w-luxe space-y-16">
        <section className="grid gap-8 xl:grid-cols-[1.1fr_0.9fr]">
          {/* ── Gallery — Stage 2 (replaces static GlassCard placeholders) ── */}
          <ProductGallery media={product.media} name={product.name} />

          {/* ── Product info ──────────────────────────────────────────────── */}
          <div className="space-y-6">
            <div className="space-y-4">
              <p className="text-[13px] uppercase tracking-[0.28em] text-white/45">{product.category} / {product.subcategory}</p>
              <h1 className="font-display text-[48px] leading-[1.05] tracking-[-0.5px] text-white">{product.name}</h1>
              <p className="max-w-xl text-base leading-8 text-white/60">{product.longDescription}</p>
              <div className="inline-flex rounded-full border border-gold/40 bg-gold/10 px-4 py-2 text-[11px] uppercase tracking-[0.22em] text-white">
                Moda / Couro / Acessorios
              </div>
            </div>
            <GlassCard tone="warm" className="space-y-5">
              <div className="flex items-center justify-between border-b border-white/8 pb-4">
                <span className="text-black/52">Preco varejo</span>
                <strong className="text-2xl text-[#17120d]">R$ {product.retailPriceBRL.toFixed(2)}</strong>
              </div>
              <div className="grid gap-4 text-sm text-black/65 md:grid-cols-2">
                <div className="rounded-[18px] border border-black/8 bg-white/55 p-4">Atacado a partir de {product.wholesaleMinQty} unidades</div>
                <div className="rounded-[18px] border border-black/8 bg-white/55 p-4">Peso {product.weightRange} para frete automatico</div>
                <div className="rounded-[18px] border border-black/8 bg-white/55 p-4">Material {product.material}</div>
                <div className="rounded-[18px] border border-black/8 bg-white/55 p-4">SKU {product.sku}</div>
              </div>
              <ProductPurchaseActions
                product={product}
                activeBrand={activeBrand}
                cartHref={cartHref}
                checkoutHref={checkoutHref}
              />
            </GlassCard>
            <GlassCard>
              <SectionHeading eyebrow="Frete internacional" title="Calculo automatico por peso e regiao." />
              <div className="mt-6 space-y-3">
                {previewRates.map((rate) => (
                  <div key={`${rate.region}-${rate.weightRange}`} className="flex items-center justify-between rounded-[18px] border border-white/8 bg-black/20 px-4 py-4 text-sm">
                    <span className="text-white/55">{rate.region}</span>
                    <span className="text-white">R$ {rate.amountBRL.toFixed(2)}</span>
                  </div>
                ))}
              </div>
            </GlassCard>
          </div>
        </section>

        <section className="space-y-8">
          <SectionHeading
            eyebrow="Relacionados"
            title="Recomendacoes elegantes para continuar a narrativa."
            description="Base pronta para personalizacao inteligente, comportamento do usuario e mix premium por contexto."
          />
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {related.filter((item) => item.id !== product.id).slice(0, 3).map((item) => (
              <ProductCard key={item.id} product={item} brandMode={product.brand} />
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
