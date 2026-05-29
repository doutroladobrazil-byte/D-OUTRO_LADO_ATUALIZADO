import type { Metadata } from "next";
import { headers, cookies } from "next/headers";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { ProductCard } from "@/components/ProductCard";
import { CreativeSlot } from "@/components/CreativeSlot";
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
import { getCreativeSlots } from "@/lib/creative-slots";

// Ensure locale is resolved per-request — never serve a cached locale to wrong visitor.
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "D'OUTRO LADO — Brazilian Leather Goods & Premium Accessories",
  description:
    "Brazilian leather goods, fashion accessories and curated premium pieces for international customers. Secure checkout, tracked delivery and destination-aware policies for selected destinations.",
  openGraph: {
    title: "D'OUTRO LADO — Brazilian Leather Goods & Premium Accessories",
    description:
      "Brazilian leather goods, fashion accessories and curated premium pieces for international customers. Secure checkout, tracked delivery and destination-aware policies for selected destinations.",
    type: "website",
  },
};

// Category hrefs — order must match dict.categories.items (7 items)
const CATEGORY_HREFS = [
  "/brands/moda?sort=new",
  "/brands/moda?category=leather-bags",
  "/brands/moda?category=small-leather-goods",
  "/brands/moda?category=shoes",
  "/brands/moda?category=accessories",
  "/gift-builder",
  "/brands/moda?sort=best-sellers",
] as const;

// Creative slot keys fetched at render time — must match creative-slot-registry.ts
// Index 0 = home.hero (hero section)
// Indices 1–7 = category cards (order matches CATEGORY_HREFS)
// Indices 8–12 = style cards (order matches STYLE_HREFS)
const CREATIVE_SLOT_KEYS = [
  "home.hero",
  "home.category.new-in",
  "home.category.leather-bags",
  "home.category.small-leather-goods",
  "home.category.shoes",
  "home.category.accessories",
  "home.category.gift-sets",
  "home.category.best-sellers",
  "home.style.everyday-carry",
  "home.style.evening-presence",
  "home.style.gift-ready",
  "home.style.travel-work",
  "home.style.minimal-essentials",
] as const;

// Shop-by-style hrefs — order must match dict.shopByStyle.items (5 items)
const STYLE_HREFS = [
  "/brands/moda?category=leather-bags",
  "/brands/moda?category=accessories",
  "/gift-builder",
  "/brands/moda?category=leather-bags",
  "/brands/moda?category=accessories",
] as const;

// Style card gradients — one per style item
const STYLE_GRADIENTS = [
  "bg-[radial-gradient(circle_at_top_left,rgba(198,169,107,0.18),transparent_50%),linear-gradient(145deg,rgba(255,255,255,0.06),rgba(0,0,0,0.88))]",
  "bg-[radial-gradient(circle_at_top_right,rgba(198,169,107,0.22),transparent_48%),linear-gradient(150deg,rgba(255,255,255,0.04),rgba(0,0,0,0.90))]",
  "bg-[radial-gradient(circle_at_bottom_left,rgba(198,169,107,0.14),transparent_52%),linear-gradient(135deg,rgba(255,255,255,0.08),rgba(0,0,0,0.84))]",
  "bg-[radial-gradient(circle_at_top,rgba(198,169,107,0.16),transparent_46%),linear-gradient(155deg,rgba(255,255,255,0.05),rgba(0,0,0,0.92))]",
  "bg-[radial-gradient(circle_at_bottom_right,rgba(198,169,107,0.20),transparent_50%),linear-gradient(140deg,rgba(255,255,255,0.06),rgba(0,0,0,0.86))]",
] as const;

export default async function HomePage() {
  const [cookieStore, headerStore, campaigns, allProducts, creatives] = await Promise.all([
    cookies(),
    headers(),
    getCampaigns(),
    getProducts("moda"),
    getCreativeSlots([...CREATIVE_SLOT_KEYS]),
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
      {/* ── 1. Announcement strip ─────────────────────────────────────────── */}
      <div className="border-b border-white/8 bg-white/[0.02] px-4 py-3 text-center">
        <p className="text-[11px] uppercase tracking-[0.28em] text-white/40">
          {dict.announcement}
        </p>
      </div>

      {/* ── 2. Hero ───────────────────────────────────────────────────────── */}
      <section className="px-4 pb-8 pt-8 md:px-6 md:pt-10">
        <div className="mx-auto max-w-luxe">
          <GlassCard className="relative overflow-hidden p-8 md:p-14">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(198,169,107,0.09),transparent_40%),linear-gradient(160deg,rgba(255,255,255,0.05),rgba(0,0,0,0.9))]" />
            <div className="relative grid gap-12 xl:grid-cols-[1fr_0.75fr] xl:items-center">
              {/* Left: copy */}
              <div className="space-y-7">
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
                  <ButtonLink href="/brands/moda?sort=new">{dict.hero.ctaPrimary}</ButtonLink>
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

              {/* Right: hero creative slot */}
              <div className="hidden xl:block">
                <div className="relative aspect-[3/4] overflow-hidden rounded-[22px] border border-white/8">
                  <CreativeSlot
                    creative={creatives.get("home.hero")}
                    priority
                    sizes="(min-width: 1280px) 35vw, 0vw"
                    fallback={
                      <div className="flex h-full w-full items-end bg-gradient-to-br from-white/[0.05] to-black/70">
                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(198,169,107,0.13),transparent_55%)]" />
                        <div className="relative w-full border-t border-white/6 p-6">
                          <p className="text-[10px] uppercase tracking-[0.38em] text-white/25">New collection</p>
                          <p className="mt-1 font-display text-[20px] text-white/40">Leather &amp; fashion</p>
                        </div>
                      </div>
                    }
                  />
                </div>
              </div>
            </div>
          </GlassCard>
        </div>
      </section>

      {/* ── 3. Featured products (product-led — above the fold) ───────────── */}
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

      {/* ── 4. Shop by category ───────────────────────────────────────────── */}
      <section className="px-4 py-10 md:px-6">
        <div className="mx-auto max-w-luxe space-y-8">
          <SectionHeading
            eyebrow={dict.categories.eyebrow}
            title={dict.categories.title}
            align="center"
          />
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-7">
            {dict.categories.items.map((cat, i) => {
              const href = CATEGORY_HREFS[i] ?? "/brands/moda";
              const slotKey = CREATIVE_SLOT_KEYS[i + 1] as string | undefined;
              const creative = slotKey ? creatives.get(slotKey) : undefined;
              return (
                <Link
                  key={cat.label}
                  href={href}
                  className="group flex flex-col gap-3 rounded-[18px] border border-white/8 bg-white/[0.02] p-5 transition-colors hover:border-gold/30 hover:bg-white/[0.04]"
                >
                  <div className="relative aspect-square overflow-hidden rounded-[12px] border border-white/6">
                    <CreativeSlot
                      creative={creative}
                      sizes="(min-width: 1280px) 12vw, (min-width: 640px) 20vw, 40vw"
                      fallback={<div className="h-full w-full bg-gradient-to-br from-white/[0.05] to-transparent" />}
                    />
                  </div>
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

      {/* ── 5. Shop by style / purpose ────────────────────────────────────── */}
      <section className="px-4 py-12 md:px-6 md:py-16">
        <div className="mx-auto max-w-luxe space-y-8">
          <SectionHeading
            eyebrow={dict.shopByStyle.eyebrow}
            title={dict.shopByStyle.title}
            align="center"
          />
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-5">
            {dict.shopByStyle.items.map((item, i) => {
              const href = STYLE_HREFS[i] ?? "/brands/moda";
              const styleKeys = ["home.style.everyday-carry","home.style.evening-presence","home.style.gift-ready","home.style.travel-work","home.style.minimal-essentials"] as const;
              const creative = creatives.get(styleKeys[i] ?? "");
              return (
                <Link
                  key={item.label}
                  href={href}
                  className="group flex flex-col overflow-hidden rounded-[20px] border border-white/8 bg-white/[0.02] transition-all duration-300 hover:border-gold/25 hover:shadow-luxe"
                >
                  <div className="relative aspect-[3/4] w-full overflow-hidden">
                    <CreativeSlot
                      creative={creative}
                      sizes="(min-width: 1024px) 18vw, 45vw"
                      fallback={<div className={`h-full w-full ${STYLE_GRADIENTS[i]}`} />}
                    />
                  </div>
                  <div className="flex flex-col gap-2 p-4">
                    <p className="text-[13px] font-medium text-white/85 group-hover:text-white">
                      {item.label}
                    </p>
                    <p className="text-[11px] leading-5 text-white/38">{item.description}</p>
                    <span className="mt-1 text-[11px] uppercase tracking-[0.18em] text-gold/60 group-hover:text-gold/80">
                      {item.cta} →
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── 6. International service block ────────────────────────────────── */}
      <section className="px-4 py-12 md:px-6 md:py-16">
        <div className="mx-auto max-w-luxe space-y-10">
          <SectionHeading
            eyebrow={dict.services.eyebrow}
            title={dict.services.title}
            align="center"
          />
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {dict.services.items.map((item) => (
              <GlassCard key={item.label} className="flex flex-col gap-4 p-6">
                <div className="h-10 w-10 rounded-[12px] border border-gold/20 bg-gold/[0.08]" />
                <div>
                  <p className="text-[13px] font-medium text-white">{item.label}</p>
                  <p className="mt-2 text-[12px] leading-5 text-white/45">{item.description}</p>
                </div>
              </GlassCard>
            ))}
          </div>
        </div>
      </section>

      {/* ── 7. Editorial slider ───────────────────────────────────────────── */}
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

      {/* ── 8. Campaigns ──────────────────────────────────────────────────── */}
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

      {/* ── 9. Gift composition ───────────────────────────────────────────── */}
      <section className="px-4 py-12 md:px-6 md:py-16">
        <div className="mx-auto max-w-luxe">
          <GiftCompositionFeature dict={dict.gift} />
        </div>
      </section>

      {/* ── 10. Lead capture ──────────────────────────────────────────────── */}
      <section id="drop-list" className="px-4 py-12 md:px-6 md:py-16">
        <div className="mx-auto max-w-luxe">
          <LeadCaptureBlock dict={dict.lead} locale={locale} />
        </div>
      </section>

      {/* ── 11. Trust strip ───────────────────────────────────────────────── */}
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
