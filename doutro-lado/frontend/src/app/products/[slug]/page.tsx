import { notFound } from "next/navigation";
import { headers, cookies } from "next/headers";
import { ProductCard } from "@/components/ProductCard";
import { ProductGallery } from "@/components/ProductGallery";
import { getBrandCartPath, getBrandCheckoutPath, isBrand } from "@/lib/brand";
import { GlassCard } from "@/components/ui/GlassCard";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { getFreightRates, getProductBySlug, getProducts } from "@/lib/storefront";
import { ProductPurchaseActions } from "@/features/catalog/ProductPurchaseActions";
import { resolveLocale } from "@/lib/i18n/common";
import { getProductDictionary } from "@/lib/i18n/product";

export const dynamic = "force-dynamic";

type PageProps = {
  params: Promise<{ slug: string }>;
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

export default async function ProductPage({ params, searchParams }: PageProps) {
  const [{ slug }, cookieStore, headerStore] = await Promise.all([
    params,
    cookies(),
    headers(),
  ]);
  const resolvedSearchParams = searchParams ? await searchParams : undefined;
  const product = await getProductBySlug(slug);
  if (!product) notFound();

  const locale = resolveLocale(
    headerStore.get("accept-language"),
    cookieStore.get("dl_locale")?.value,
  );
  const dict = getProductDictionary(locale);

  const siteParam = resolvedSearchParams?.site;
  const activeBrand = typeof siteParam === "string" && isBrand(siteParam) ? siteParam : product.brand;
  const cartHref = getBrandCartPath(activeBrand);
  const checkoutHref = getBrandCheckoutPath(activeBrand);

  const [related, freightRates] = await Promise.all([getProducts(product.brand), getFreightRates()]);
  const previewRates = freightRates.filter((rate) => rate.weightRange === product.weightRange).slice(0, 3);
  const relatedProducts = related.filter((item) => item.id !== product.id).slice(0, 3);

  // Dynamic badge: category / subcategory / material
  const badgeLabel = [product.category, product.subcategory].filter(Boolean).join(" / ") || "Moda / Couro";

  return (
    <main className="px-4 py-8 md:px-6 md:py-10">
      <div className="mx-auto max-w-luxe space-y-16">
        <section className="grid gap-8 xl:grid-cols-[1.1fr_0.9fr]">
          {/* ── Gallery ───────────────────────────────────────────────────── */}
          <ProductGallery media={product.media} name={product.name} />

          {/* ── Product info ──────────────────────────────────────────────── */}
          <div className="space-y-5">
            {/* Header */}
            <div className="space-y-4">
              <p className="text-[13px] uppercase tracking-[0.28em] text-white/45">
                {product.category}
                {product.subcategory ? ` / ${product.subcategory}` : ""}
              </p>
              <h1 className="font-display text-[32px] leading-[1.05] tracking-[-0.5px] text-white md:text-[48px]">
                {product.name}
              </h1>
              <p className="max-w-xl text-base leading-8 text-white/60">{product.longDescription}</p>
              <div className="inline-flex rounded-full border border-gold/40 bg-gold/10 px-4 py-2 text-[11px] uppercase tracking-[0.22em] text-white">
                {badgeLabel}
              </div>
            </div>

            {/* Pricing card */}
            <GlassCard tone="warm" className="space-y-5">
              <div className="border-b border-black/10 pb-5">
                <p className="mb-1.5 text-[11px] uppercase tracking-[0.22em] text-black/40">{dict.retailPrice}</p>
                <strong className="text-[30px] font-semibold tracking-[-0.5px] text-[#17120d]">
                  R$ {product.retailPriceBRL.toFixed(2)}
                </strong>
              </div>
              <div className="grid gap-3 text-sm text-black/65 sm:grid-cols-2">
                <div className="rounded-[16px] border border-black/8 bg-white/55 px-4 py-3">
                  <span className="text-[10px] uppercase tracking-[0.2em] text-black/40 block mb-1">{dict.wholesale}</span>
                  {dict.wholesalePrefix} {product.wholesaleMinQty} {dict.wholesaleSuffix}
                </div>
                <div className="rounded-[16px] border border-black/8 bg-white/55 px-4 py-3">
                  <span className="text-[10px] uppercase tracking-[0.2em] text-black/40 block mb-1">{dict.weight}</span>
                  {product.weightRange} — {dict.weightSuffix}
                </div>
                <div className="rounded-[16px] border border-black/8 bg-white/55 px-4 py-3">
                  <span className="text-[10px] uppercase tracking-[0.2em] text-black/40 block mb-1">{dict.material}</span>
                  {product.material}
                </div>
                <div className="rounded-[16px] border border-black/8 bg-white/55 px-4 py-3">
                  <span className="text-[10px] uppercase tracking-[0.2em] text-black/40 block mb-1">{dict.sku}</span>
                  {product.sku}
                </div>
              </div>
              <ProductPurchaseActions
                product={product}
                activeBrand={activeBrand}
                cartHref={cartHref}
                checkoutHref={checkoutHref}
                dict={dict}
              />
            </GlassCard>

            {/* Freight rates */}
            {previewRates.length > 0 && (
              <GlassCard>
                <SectionHeading eyebrow={dict.shipping} title={dict.shippingTitle} />
                <div className="mt-5 space-y-2">
                  {previewRates.map((rate) => (
                    <div
                      key={`${rate.region}-${rate.weightRange}`}
                      className="flex items-center justify-between rounded-[16px] border border-white/8 bg-black/20 px-4 py-3 text-sm"
                    >
                      <span className="text-white/55">{rate.region}</span>
                      <span className="text-white">R$ {rate.amountBRL.toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              </GlassCard>
            )}
          </div>
        </section>

        {/* ── Related products ──────────────────────────────────────────── */}
        {relatedProducts.length > 0 && (
          <section className="space-y-8">
            <SectionHeading
              eyebrow={dict.related}
              title={dict.relatedTitle}
            />
            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              {relatedProducts.map((item) => (
                <ProductCard key={item.id} product={item} brandMode={product.brand} dict={dict} />
              ))}
            </div>
          </section>
        )}
      </div>
    </main>
  );
}
