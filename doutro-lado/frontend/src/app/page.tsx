import { ArrowRight } from "lucide-react";
import { ProductCard } from "@/components/ProductCard";
import { ButtonLink } from "@/components/ui/Button";
import { GlassCard } from "@/components/ui/GlassCard";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { GiftCompositionFeature } from "@/features/home/GiftCompositionFeature";
import { UniverseSlider } from "@/features/home/UniverseSlider";
import { getCampaigns, getProducts } from "@/lib/storefront";

export default async function HomePage() {
  const [campaigns, allProducts] = await Promise.all([getCampaigns(), getProducts("moda")]);
  const featured = allProducts.filter((p) => p.featured);
  const displayProducts = featured.length >= 4 ? featured.slice(0, 4) : allProducts.slice(0, 4);

  return (
    <main>
      {/* ── Hero ──────────────────────────────────────────────────────────── */}
      <section className="px-4 pb-8 pt-8 md:px-6 md:pt-10">
        <div className="mx-auto max-w-luxe">
          <GlassCard className="relative overflow-hidden p-8 md:p-14">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(198,169,107,0.09),transparent_40%),linear-gradient(160deg,rgba(255,255,255,0.05),rgba(0,0,0,0.9))]" />
            <div className="relative grid gap-12 xl:grid-cols-[1fr_0.7fr] xl:items-end">
              <div className="space-y-8">
                <p className="text-[11px] uppercase tracking-[0.42em] text-white/35">
                  Moda premium — origem brasileira
                </p>
                <h1 className="max-w-3xl font-display text-[36px] leading-[1.02] tracking-[-1px] text-white sm:text-[48px] md:text-[74px]">
                  Couro, moda
                  <br />
                  e presença.
                </h1>
                <p className="max-w-xl text-base leading-[1.88] text-white/55 md:text-[17px]">
                  Acessórios, bolsas, sapatos e vestuário com curadoria editorial e materialidade de referência. Feito no Brasil, para o mundo.
                </p>
                <div className="flex flex-wrap gap-3 pt-2">
                  <ButtonLink href="/brands/moda">Explorar coleções</ButtonLink>
                  <ButtonLink href="/gift-builder" variant="secondary">
                    Montar presente
                  </ButtonLink>
                </div>
              </div>
              <div className="hidden xl:grid xl:gap-3 xl:pb-1">
                {[
                  "Couro bovino premium",
                  "Séries limitadas",
                  "Envio internacional",
                  "Atacado disponível",
                ].map((item) => (
                  <div
                    key={item}
                    className="rounded-[16px] border border-white/8 bg-white/[0.03] px-5 py-3"
                  >
                    <p className="text-[12px] uppercase tracking-[0.22em] text-white/42">{item}</p>
                  </div>
                ))}
              </div>
            </div>
          </GlassCard>
        </div>
      </section>

      {/* ── Trust strip ───────────────────────────────────────────────────── */}
      <section className="px-4 py-6 md:px-6">
        <div className="mx-auto max-w-luxe">
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
            {[
              { label: "Envio mundial", sub: "CH · IE · DE · IS · SG · US" },
              { label: "Pagamento seguro", sub: "Stripe · criptografado" },
              { label: "Devoluções", sub: "Política por destino" },
              { label: "Couro certificado", sub: "Origem brasileira" },
            ].map((item) => (
              <div
                key={item.label}
                className="rounded-[18px] border border-white/8 bg-white/[0.02] px-4 py-4 text-center"
              >
                <p className="text-[11px] uppercase tracking-[0.22em] text-white/60">{item.label}</p>
                <p className="mt-1 text-[11px] text-white/30">{item.sub}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Editorial slider ──────────────────────────────────────────────── */}
      <section className="px-4 py-12 md:px-6 md:py-16">
        <div className="mx-auto max-w-luxe space-y-10">
          <SectionHeading
            eyebrow="Coleções"
            title="Moda, couro e acessórios com narrativa própria."
            description="Peças selecionadas por materialidade, exclusividade e leitura editorial para o mercado internacional."
          />
          <UniverseSlider />
        </div>
      </section>

      {/* ── Gift composition ──────────────────────────────────────────────── */}
      <section className="px-4 py-12 md:px-6 md:py-16">
        <div className="mx-auto max-w-luxe">
          <GiftCompositionFeature />
        </div>
      </section>

      {/* ── Featured products ─────────────────────────────────────────────── */}
      <section className="px-4 py-12 md:px-6 md:py-16">
        <div className="mx-auto max-w-luxe">
          <div className="flex items-end justify-between gap-6">
            <SectionHeading
              eyebrow="Seleção da semana"
              title="Peças com acabamento premium e leitura internacional."
            />
            <ButtonLink
              href="/brands/moda"
              variant="ghost"
              className="hidden shrink-0 md:inline-flex"
            >
              Explorar catálogo <ArrowRight className="ml-2 size-4" />
            </ButtonLink>
          </div>
          <div className="mt-10 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
            {displayProducts.length > 0 ? (
              displayProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))
            ) : (
              <div className="col-span-full flex flex-col items-center justify-center rounded-[22px] border border-dashed border-white/10 py-16 text-center">
                <p className="text-sm text-white/35">Coleção em breve.</p>
                <ButtonLink href="/brands/moda" variant="ghost" className="mt-4">
                  Ver catálogo
                </ButtonLink>
              </div>
            )}
          </div>
          <div className="mt-8 text-center md:hidden">
            <ButtonLink href="/brands/moda" variant="ghost">
              Explorar catálogo <ArrowRight className="ml-2 size-4" />
            </ButtonLink>
          </div>
        </div>
      </section>

      {/* ── Campaigns ─────────────────────────────────────────────────────── */}
      {campaigns.length > 0 && (
        <section className="px-4 py-12 md:px-6 md:py-16">
          <div className="mx-auto max-w-luxe space-y-10">
            <SectionHeading
              eyebrow="Editorial"
              title="Campanhas desenhadas para descoberta e conversão."
            />
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
    </main>
  );
}
