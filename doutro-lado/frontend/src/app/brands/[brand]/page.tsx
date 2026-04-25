import { notFound, redirect } from "next/navigation";
import { headers, cookies } from "next/headers";
import { ArrowRight } from "lucide-react";
import { ProductCard } from "@/components/ProductCard";
import { ButtonLink } from "@/components/ui/Button";
import { GlassCard } from "@/components/ui/GlassCard";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { isBrand } from "@/lib/brand";
import { getProducts } from "@/lib/storefront";
import { resolveLocale } from "@/lib/i18n/common";
import { getCatalogDictionary } from "@/lib/i18n/catalog";
import { getProductDictionary } from "@/lib/i18n/product";

export const dynamic = "force-dynamic";

type PageProps = {
  params: Promise<{ brand: string }>;
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

export default async function BrandPage({ params, searchParams }: PageProps) {
  const [{ brand }, cookieStore, headerStore] = await Promise.all([
    params,
    cookies(),
    headers(),
  ]);

  if (!isBrand(brand)) notFound();
  if (brand === "casa") redirect("/brands/moda");

  const locale = resolveLocale(
    headerStore.get("accept-language"),
    cookieStore.get("dl_locale")?.value,
  );
  const dict = getCatalogDictionary(locale);
  const productDict = getProductDictionary(locale);

  const resolvedSearch = searchParams ? await searchParams : undefined;
  const categoryParam = typeof resolvedSearch?.category === "string" ? resolvedSearch.category : "";
  const sortParam = typeof resolvedSearch?.sort === "string" ? resolvedSearch.sort : "";

  let products = await getProducts("moda");

  // Category filter — multi-keyword: "small-leather-goods" → tries each word
  if (categoryParam) {
    const keywords = categoryParam.toLowerCase().replace(/-/g, " ").split(" ").filter(Boolean);
    const filtered = products.filter((p) =>
      keywords.some(
        (kw) =>
          p.category?.toLowerCase().includes(kw) ||
          p.subcategory?.toLowerCase().includes(kw),
      ),
    );
    if (filtered.length > 0) products = filtered;
  }

  // Sort — "new" uses position ascending (lower = featured first), "best-sellers" filters featured
  if (sortParam === "new") {
    products = [...products].sort((a, b) => (a.position ?? 999) - (b.position ?? 999));
  } else if (sortParam === "best-sellers") {
    products = products.filter((p) => p.featured);
  }

  const filterKey = categoryParam || (sortParam ? sortParam : "");
  const pageTitle = dict.filterTitles[filterKey] ?? dict.filterTitles[""];

  const featured = products.filter((p) => p.featured).slice(0, 4);
  const displayProducts = featured.length >= 2 ? featured : products.slice(0, 4);

  return (
    <main>
      {/* ── Hero ──────────────────────────────────────────────────────────── */}
      <section className="px-4 pb-8 pt-8 md:px-6 md:pt-10">
        <div className="mx-auto max-w-luxe">
          <GlassCard className="relative overflow-hidden p-8 md:p-14">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(198,169,107,0.12),transparent_38%),linear-gradient(160deg,rgba(255,255,255,0.04),rgba(0,0,0,0.92))]" />
            <div className="relative grid gap-12 xl:grid-cols-[1fr_0.7fr] xl:items-end">
              <div className="space-y-8">
                <p className="text-[11px] uppercase tracking-[0.42em] text-white/35">
                  {dict.hero.eyebrow}
                </p>
                <h1 className="max-w-3xl font-display text-[36px] leading-[1.02] tracking-[-1px] text-white sm:text-[48px] md:text-[72px]">
                  {dict.hero.h1Lines[0]}
                  <br />
                  {dict.hero.h1Lines[1]}
                </h1>
                <p className="max-w-xl text-base leading-[1.88] text-white/55 md:text-[17px]">
                  {dict.hero.subheadline}
                </p>
                <div className="flex flex-wrap gap-3 pt-2">
                  <ButtonLink href="#products">{dict.hero.ctaPrimary}</ButtonLink>
                  <ButtonLink href="/gift-builder" variant="secondary">
                    {dict.hero.ctaSecondary}
                  </ButtonLink>
                </div>
              </div>
              <div className="hidden xl:grid xl:gap-3">
                {dict.hero.badges.map((badge) => (
                  <div
                    key={badge}
                    className="rounded-[16px] border border-[#C6A96B]/20 bg-[rgba(198,169,107,0.06)] px-5 py-3"
                  >
                    <p className="text-[12px] uppercase tracking-[0.22em] text-[#C6A96B]/70">{badge}</p>
                  </div>
                ))}
              </div>
            </div>
          </GlassCard>
        </div>
      </section>

      {/* ── Editorial ─────────────────────────────────────────────────────── */}
      <section className="px-4 py-12 md:px-6 md:py-16">
        <div className="mx-auto max-w-luxe">
          <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
            <div className="grid gap-4">
              {dict.hero.qualities.map((item, i) => (
                <div
                  key={item.label}
                  className={`flex items-center gap-4 rounded-[20px] border px-6 py-5 ${
                    i % 2 === 0
                      ? "border-[#C6A96B]/20 bg-[rgba(198,169,107,0.06)]"
                      : "border-white/8 bg-white/[0.03]"
                  }`}
                >
                  <div className="size-2 shrink-0 rounded-full bg-[#C6A96B]/60" />
                  <div>
                    <p className="text-[11px] uppercase tracking-[0.3em] text-white/35">{item.label}</p>
                    <p className="mt-1 text-sm text-white/60">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
            <GlassCard className="flex flex-col justify-between p-8 md:p-12">
              <SectionHeading
                eyebrow={dict.editorial.eyebrow}
                title={dict.editorial.title}
                description={dict.editorial.description}
              />
              <ButtonLink
                href="#products"
                variant="ghost"
                className="mt-8 w-fit"
              >
                {dict.editorial.cta} <ArrowRight className="ml-2 size-4" />
              </ButtonLink>
            </GlassCard>
          </div>
        </div>
      </section>

      {/* ── Products ──────────────────────────────────────────────────────── */}
      <section id="products" className="px-4 py-12 md:px-6 md:py-16">
        <div className="mx-auto max-w-luxe">
          <div className="flex items-end justify-between gap-6">
            <SectionHeading
              eyebrow={dict.products.eyebrow}
              title={pageTitle}
            />
            <ButtonLink
              href="/brands/moda"
              variant="ghost"
              className="hidden shrink-0 md:inline-flex"
            >
              {dict.products.viewAll} <ArrowRight className="ml-2 size-4" />
            </ButtonLink>
          </div>
          <div className="mt-10 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
            {displayProducts.length > 0 ? (
              displayProducts.map((product) => (
                <ProductCard key={product.id} product={product} brandMode="moda" dict={productDict} />
              ))
            ) : (
              <div className="col-span-full flex flex-col items-center justify-center rounded-[22px] border border-dashed border-gold/20 bg-gold/[0.02] py-20 text-center">
                <div className="mb-4 h-1 w-10 rounded-full bg-gold/30" />
                <p className="text-[13px] uppercase tracking-[0.28em] text-gold/70">
                  {dict.products.emptyTitle}
                </p>
                <p className="mt-3 max-w-xs text-sm text-white/35">
                  {dict.products.emptyBody}
                </p>
                <ButtonLink href="/#drop-list" variant="ghost" className="mt-6">
                  {dict.products.emptyCta}
                </ButtonLink>
              </div>
            )}
          </div>
          <div className="mt-8 text-center md:hidden">
            <ButtonLink href="/brands/moda" variant="ghost">
              {dict.products.viewAll} <ArrowRight className="ml-2 size-4" />
            </ButtonLink>
          </div>
        </div>
      </section>

      {/* ── Gift builder CTA ──────────────────────────────────────────────── */}
      <section className="px-4 pb-12 md:px-6 md:pb-16">
        <div className="mx-auto max-w-luxe">
          <GlassCard tone="warm" className="overflow-hidden p-8 md:p-10">
            <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
              <div className="space-y-3">
                <p className="text-[11px] uppercase tracking-[0.38em] text-black/32">{dict.gift.eyebrow}</p>
                <h3 className="font-display text-[24px] leading-[1.08] tracking-[-0.5px] text-[#17120d] md:text-[34px]">
                  {dict.gift.title}
                </h3>
                <p className="max-w-lg text-sm leading-7 text-black/55">
                  {dict.gift.description}
                </p>
              </div>
              <ButtonLink href="/gift-builder" variant="light" className="w-fit shrink-0">
                {dict.gift.cta} <ArrowRight className="ml-2 size-4" />
              </ButtonLink>
            </div>
          </GlassCard>
        </div>
      </section>
    </main>
  );
}
