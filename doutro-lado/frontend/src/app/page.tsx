import type { Metadata } from "next";
import { headers, cookies } from "next/headers";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { ProductCard } from "@/components/ProductCard";
import { ButtonLink } from "@/components/ui/Button";
import { GlassCard } from "@/components/ui/GlassCard";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { GiftCompositionFeature } from "@/features/home/GiftCompositionFeature";
import { LeadCaptureBlock } from "@/features/home/LeadCaptureBlock";
import { UniverseSlider } from "@/features/home/UniverseSlider";
import { getDictionary } from "@/lib/i18n/home";
import { resolveLocale } from "@/lib/i18n/common";
import { getProductDictionary } from "@/lib/i18n/product";
import { getCampaigns, getProducts } from "@/lib/storefront";

// Ensure locale is resolved per-request — never serve a cached locale to wrong visitor.
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "D'OUTRO LADO — Brazilian Premium Fashion Delivered Internationally",
  description:
    "Brazilian leather, fashion and accessories curated for international customers. Tracked delivery, secure checkout and destination-aware policies for selected destinations.",
  openGraph: {
    title: "D'OUTRO LADO — Brazilian Premium Fashion Delivered Internationally",
    description:
      "Brazilian leather, fashion and accessories curated for international customers. Tracked delivery, secure checkout and destination-aware policies for selected destinations.",
    type: "website",
  },
};

export default async function HomePage() {
  const [cookieStore, headerStore, campaigns, allProducts] = await Promise.all([
    cookies(),
    headers(),
    getCampaigns(),
    getProducts("moda"),
  ]);

  const locale = resolveLocale(
    headerStore.get("accept-language"),
    cookieStore.get("dl_locale")?.value,
  );
  const dict = getDictionary(locale);
  const productDict = getProductDictionary(locale);

  const featured = allProducts.filter((p) => p.featured);
  const displayProducts = featured.length >= 4 ? featured.slice(0, 4) : allProducts.slice(0, 4);

  return (
    <main>
      {/* ── Announcement strip ────────────────────────────────────────────── */}
      <div className="border-b border-white/8 bg-white/[0.02] px-4 py-3 text-center">
        <p className="text-[11px] uppercase tracking-[0.28em] text-white/40">
          {dict.announcement}
        </p>
      </div>

      {/* ── Hero ──────────────────────────────────────────────────────────── */}
      <section className="px-4 pb-8 pt-8 md:px-6 md:pt-10">
        <div className="mx-auto max-w-luxe">
          <GlassCard className="relative overflow-hidden p-8 md:p-14">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(198,169,107,0.09),transparent_40%),linear-gradient(160deg,rgba(255,255,255,0.05),rgba(0,0,0,0.9))]" />
            <div className="relative grid gap-12 xl:grid-cols-[1fr_0.75fr] xl:items-center">
              {/* Left: copy */}
              <div className="space-y-7">
                {/* TODO: replace with final logo asset */}
                <p className="font-display text-[15px] tracking-[0.18em] text-white/55">
                  D&apos;OUTRO LADO
                </p>
                <p className="text-[11px] uppercase tracking-[0.42em] text-gold/70">
                  {dict.hero.eyebrow}
                </p>
                <h1 className="max-w-2xl font-display text-[34px] leading-[1.02] tracking-[-1px] text-white sm:text-[46px] md:text-[60px]">
                  {dict.hero.h1}
                </h1>
                <p className="max-w-xl text-base leading-[1.88] text-white/55 md:text-[17px]">
                  {dict.hero.subheadline}
                </p>
                <div className="flex flex-wrap gap-3 pt-2">
                  <ButtonLink href="/brands/moda">{dict.hero.ctaPrimary}</ButtonLink>
                  <ButtonLink href="#drop-list" variant="secondary">
                    {dict.hero.ctaSecondary}
                  </ButtonLink>
                </div>
                {/* Mini trust row */}
                <div className="flex flex-wrap gap-x-6 gap-y-2 pt-1">
                  {dict.hero.trust.map((t) => (
                    <p key={t} className="text-[11px] text-white/35">
                      ✓ {t}
                    </p>
                  ))}
                </div>
              </div>

              {/* Right: hero creative slot — visible on xl screens */}
              <div className="hidden xl:block">
                {/* CREATIVE SLOT: hero video/image */}
                <div className="relative flex aspect-[3/4] items-end overflow-hidden rounded-[22px] border border-white/8 bg-gradient-to-br from-white/[0.05] to-black/70">
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(198,169,107,0.13),transparent_55%)]" />
                  <div className="relative w-full border-t border-white/6 p-6">
                    <p className="text-[10px] uppercase tracking-[0.38em] text-white/25">
                      New collection
                    </p>
                    <p className="mt-1 font-display text-[20px] text-white/40">Leather & fashion</p>
                  </div>
                </div>
              </div>
            </div>
          </GlassCard>
        </div>
      </section>

      {/* ── Shop by intent / category shortcuts ───────────────────────────── */}
      <section className="px-4 py-10 md:px-6">
        <div className="mx-auto max-w-luxe space-y-8">
          <SectionHeading
            eyebrow={dict.categories.eyebrow}
            title={dict.categories.title}
            align="center"
          />
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
            {/* TODO: brands/[brand]/page.tsx needs to read searchParams and pass to getProducts()
                Once wired, the sort/category params below will activate live filtering. */}
            {dict.categories.items.map((cat, i) => {
              const HREFS = [
                "/brands/moda?sort=new",              // New In
                "/brands/moda?category=leather-bags", // Leather Bags
                "/brands/moda?category=shoes",        // Shoes
                "/brands/moda?category=accessories",  // Accessories
                "/gift-builder",                      // Gift Sets
                "/brands/moda?sort=best-sellers",     // Best Sellers
              ];
              const href = HREFS[i] ?? "/brands/moda";
              return (
                <Link
                  key={cat.label}
                  href={href}
                  className="group flex flex-col gap-3 rounded-[18px] border border-white/8 bg-white/[0.02] p-5 transition-colors hover:border-gold/30 hover:bg-white/[0.04]"
                >
                  {/* CREATIVE SLOT: category thumbnail image */}
                  <div className="aspect-square rounded-[12px] border border-white/6 bg-gradient-to-br from-white/[0.05] to-transparent" />
                  <div>
                    <p className="text-[13px] font-medium text-white/80 group-hover:text-white">
                      {cat.label}
                    </p>
                    <p className="mt-0.5 text-[11px] text-white/35">{cat.description}</p>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── Featured products ─────────────────────────────────────────────── */}
      <section className="px-4 py-12 md:px-6 md:py-16">
        <div className="mx-auto max-w-luxe">
          <div className="flex items-end justify-between gap-6">
            <SectionHeading
              eyebrow={dict.products.eyebrow}
              title={dict.products.title}
              description={dict.products.description}
            />
            <ButtonLink
              href="/brands/moda"
              variant="ghost"
              className="hidden shrink-0 md:inline-flex"
            >
              {dict.products.cta} <ArrowRight className="ml-2 size-4" />
            </ButtonLink>
          </div>
          <div className="mt-10 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
            {displayProducts.length > 0 ? (
              displayProducts.map((product) => (
                <ProductCard key={product.id} product={product} dict={productDict} />
              ))
            ) : (
              <div className="col-span-full flex flex-col items-center justify-center rounded-[22px] border border-dashed border-gold/20 bg-gold/[0.02] py-20 text-center">
                <div className="mb-4 h-1 w-10 rounded-full bg-gold/30" />
                <p className="text-[13px] uppercase tracking-[0.28em] text-gold/70">
                  {dict.products.empty}
                </p>
                <p className="mt-3 max-w-xs text-sm text-white/35">
                  {dict.products.emptySubtitle}
                </p>
                <ButtonLink href="#drop-list" variant="ghost" className="mt-6">
                  {dict.products.emptyCta}
                </ButtonLink>
              </div>
            )}
          </div>
          <div className="mt-8 text-center md:hidden">
            <ButtonLink href="/brands/moda" variant="ghost">
              {dict.products.cta} <ArrowRight className="ml-2 size-4" />
            </ButtonLink>
          </div>
        </div>
      </section>

      {/* ── International shopping / localized by destination ─────────────── */}
      <section className="px-4 py-12 md:px-6 md:py-16">
        <div className="mx-auto max-w-luxe space-y-10">
          <SectionHeading
            eyebrow={dict.international.eyebrow}
            title={dict.international.title}
            description={dict.international.description}
            align="center"
          />
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {dict.international.cards.map((card) => (
              <GlassCard key={card.label} className="flex flex-col gap-4 p-6">
                <div className="h-10 w-10 rounded-[12px] border border-gold/20 bg-gold/8" />
                <div>
                  <p className="text-[13px] font-medium text-white">{card.label}</p>
                  <p className="mt-2 text-[12px] leading-5 text-white/45">{card.description}</p>
                </div>
              </GlassCard>
            ))}
          </div>
        </div>
      </section>

      {/* ── Editorial slider ──────────────────────────────────────────────── */}
      <section className="px-4 py-12 md:px-6 md:py-16">
        <div className="mx-auto max-w-luxe space-y-10">
          <SectionHeading
            eyebrow={dict.editorial.eyebrow}
            title={dict.editorial.title}
            description={dict.editorial.description}
          />
          <UniverseSlider />
        </div>
      </section>

      {/* ── Campaigns ─────────────────────────────────────────────────────── */}
      {campaigns.length > 0 && (
        <section className="px-4 py-12 md:px-6 md:py-16">
          <div className="mx-auto max-w-luxe space-y-10">
            <SectionHeading eyebrow={dict.campaign.eyebrow} title={dict.campaign.title} />
            <div className="grid gap-6 lg:grid-cols-2">
              {campaigns.map((campaign, index) => (
                <GlassCard
                  key={campaign.id}
                  tone={index % 2 === 0 ? "dark" : "warm"}
                  className="overflow-hidden p-0"
                >
                  <div
                    className={`grid min-h-[340px] md:grid-cols-[0.85fr_1.15fr] ${
                      index % 2 === 0 ? "" : "md:[&>*:first-child]:order-2"
                    }`}
                  >
                    {/* CREATIVE SLOT: lifestyle campaign image */}
                    <div
                      className={
                        index % 2 === 0
                          ? "bg-[radial-gradient(circle_at_top,rgba(245,245,245,0.15),transparent_40%),linear-gradient(135deg,rgba(255,255,255,0.08),rgba(0,0,0,0.82))]"
                          : "bg-[radial-gradient(circle_at_top_left,rgba(245,245,245,0.22),transparent_34%),linear-gradient(135deg,rgba(255,255,255,0.34),rgba(236,236,236,0.96))]"
                      }
                    />
                    <div className="flex flex-col justify-between p-8">
                      <div>
                        <p
                          className={
                            index % 2 === 0
                              ? "text-[12px] uppercase tracking-[0.28em] text-white/38"
                              : "text-[12px] uppercase tracking-[0.28em] text-black/38"
                          }
                        >
                          {campaign.highlight}
                        </p>
                        <h3
                          className={
                            index % 2 === 0
                              ? "mt-4 font-display text-[30px] leading-[1.1] tracking-[-0.5px] text-white"
                              : "mt-4 font-display text-[30px] leading-[1.1] tracking-[-0.5px] text-[#17120d]"
                          }
                        >
                          {campaign.title}
                        </h3>
                        <p
                          className={
                            index % 2 === 0
                              ? "mt-4 text-sm leading-7 text-white/55"
                              : "mt-4 text-sm leading-7 text-black/58"
                          }
                        >
                          {campaign.subtitle}
                        </p>
                      </div>
                      <ButtonLink
                        href={campaign.ctaHref}
                        variant={index % 2 === 0 ? "secondary" : "light"}
                        className="mt-8 w-fit"
                      >
                        {campaign.ctaLabel}
                      </ButtonLink>
                    </div>
                  </div>
                </GlassCard>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── Gift composition ──────────────────────────────────────────────── */}
      <section className="px-4 py-12 md:px-6 md:py-16">
        <div className="mx-auto max-w-luxe">
          <GiftCompositionFeature dict={dict.gift} />
        </div>
      </section>

      {/* ── Lead capture ──────────────────────────────────────────────────── */}
      <section id="drop-list" className="px-4 py-12 md:px-6 md:py-16">
        <div className="mx-auto max-w-luxe">
          <LeadCaptureBlock dict={dict.lead} locale={locale} />
        </div>
      </section>

      {/* ── Trust and policy strip ────────────────────────────────────────── */}
      <section className="px-4 py-10 md:px-6">
        <div className="mx-auto max-w-luxe">
          <div className="rounded-[22px] border border-white/8 bg-white/[0.02] p-8 md:p-10">
            <p className="mb-8 text-center text-[11px] uppercase tracking-[0.32em] text-white/28">
              {dict.trust.eyebrow}
            </p>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {dict.trust.items.map((item) => (
                <div key={item.label} className="text-center">
                  <p className="text-[12px] uppercase tracking-[0.22em] text-white/55">
                    {item.label}
                  </p>
                  <p className="mt-1.5 text-[11px] text-white/28">{item.sub}</p>
                </div>
              ))}
            </div>
            <p className="mt-8 text-center text-[11px] leading-6 text-white/20">
              {dict.trust.footer}
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
