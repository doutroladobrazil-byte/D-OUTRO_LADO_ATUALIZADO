import { ArrowRight } from "lucide-react";
import { ProductCard } from "@/components/ProductCard";
import { ButtonLink } from "@/components/ui/Button";
import { GlassCard } from "@/components/ui/GlassCard";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { GiftCompositionFeature } from "@/features/home/GiftCompositionFeature";
import { UniverseSlider } from "@/features/home/UniverseSlider";
import { getCampaigns, getProducts } from "@/lib/storefront";

export default async function HomePage() {
  const [campaigns, products] = await Promise.all([getCampaigns(), getProducts()]);

  return (
    <main>
      <section className="px-6 pb-8 pt-10">
        <div className="mx-auto max-w-luxe">
          <GlassCard className="relative overflow-hidden p-8 md:p-12">
            <div className="absolute inset-0 bg-grain-dark opacity-80" />
            <div className="relative grid gap-10 xl:grid-cols-[0.95fr_1.05fr]">
              <div className="space-y-6">
                <p className="text-[13px] uppercase tracking-[0.3em] text-white/45">Luxury platform / Casa + Couro</p>
                <h1 className="max-w-4xl font-display text-[48px] leading-[1.05] tracking-[-0.5px] text-white md:text-[68px]">
                  Dois universos premium com entrada editorial e navegacao sensorial.
                </h1>
                <p className="max-w-2xl text-base leading-8 text-white/60">
                  A home agora funciona como ponto de decisao elegante: o usuario pode entrar no universo de casa e decoracao ou no universo de couro, bolsas e sapatos com microinteracoes e leitura limpa.
                </p>
                <div className="flex flex-wrap gap-3">
                  <ButtonLink href="/brands/casa" variant="secondary">Casa e decoracao</ButtonLink>
                  <ButtonLink href="/brands/moda">Couro e acessorios</ButtonLink>
                </div>
              </div>
              <div className="rounded-[28px] border border-white/10 bg-[radial-gradient(circle_at_top,rgba(198,169,107,0.2),transparent_30%),linear-gradient(135deg,rgba(255,255,255,0.08),rgba(0,0,0,0.82))]" />
            </div>
          </GlassCard>
        </div>
      </section>

      <section className="px-6 py-16">
        <div className="mx-auto max-w-luxe space-y-10">
          <SectionHeading
            eyebrow="Entradas editoriais"
            title="Sliders clicaveis para os dois universos da plataforma."
            description="Cada slider funciona como uma porta de entrada clara e sofisticada, com microinteracoes, imagem temporaria configuravel e destino direto para o catalogo correspondente."
          />
          <UniverseSlider />
        </div>
      </section>

      <section className="px-6 py-16">
        <div className="mx-auto max-w-luxe">
          <GiftCompositionFeature />
        </div>
      </section>

      <section className="px-6 py-16">
        <div className="mx-auto max-w-luxe">
          <GlassCard tone="warm" className="p-8 md:p-10">
            <SectionHeading
              eyebrow="Curadoria viva"
              title="Campanhas desenhadas para descoberta premium e conversao internacional."
              description="Cada ponto de contato foi tratado como experiencia de marca, do hero editorial ao mix de produtos e highlights operacionais."
              tone="dark"
            />
          </GlassCard>
          <div className="mt-10 grid gap-6 lg:grid-cols-2">
            {campaigns.map((campaign, index) => (
              <GlassCard key={campaign.id} tone={index % 2 === 0 ? "dark" : "warm"} className="overflow-hidden p-0">
                <div className={`grid min-h-[320px] md:grid-cols-[0.9fr_1.1fr] ${index % 2 === 0 ? "" : "md:[&>*:first-child]:order-2"}`}>
                  <div className={index % 2 === 0 ? "bg-[radial-gradient(circle_at_top,rgba(245,245,245,0.16),transparent_40%),linear-gradient(135deg,rgba(255,255,255,0.08),rgba(0,0,0,0.8))]" : "bg-[radial-gradient(circle_at_top_left,rgba(245,245,245,0.22),transparent_34%),linear-gradient(135deg,rgba(255,255,255,0.34),rgba(236,236,236,0.94))]"} />
                  <div className="flex flex-col justify-between p-8">
                    <div>
                      <p className={index % 2 === 0 ? "text-[13px] uppercase tracking-[0.26em] text-white/42" : "text-[13px] uppercase tracking-[0.26em] text-black/42"}>{campaign.highlight}</p>
                      <h3 className={index % 2 === 0 ? "mt-4 font-display text-[36px] leading-[1.08] tracking-[-0.5px] text-white" : "mt-4 font-display text-[36px] leading-[1.08] tracking-[-0.5px] text-[#17120d]"}>{campaign.title}</h3>
                      <p className={index % 2 === 0 ? "mt-4 text-sm leading-7 text-white/58" : "mt-4 text-sm leading-7 text-black/62"}>{campaign.subtitle}</p>
                    </div>
                    <ButtonLink href={campaign.ctaHref} variant={index % 2 === 0 ? "secondary" : "light"} className="mt-8 w-fit">
                      {campaign.ctaLabel}
                    </ButtonLink>
                  </div>
                </div>
              </GlassCard>
            ))}
          </div>
        </div>
      </section>

      <section className="px-6 py-16">
        <div className="mx-auto max-w-luxe">
          <div className="flex items-end justify-between gap-6">
            <SectionHeading
              eyebrow="Best sellers"
              title="Produtos com acabamento premium e leitura internacional."
            />
            <ButtonLink href="/search" variant="ghost" className="hidden md:inline-flex">
              Explorar catalogo <ArrowRight className="ml-2 size-4" />
            </ButtonLink>
          </div>
          <div className="mt-10 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
            {products.slice(0, 4).map((product) => <ProductCard key={product.id} product={product} />)}
          </div>
        </div>
      </section>
    </main>
  );
}
