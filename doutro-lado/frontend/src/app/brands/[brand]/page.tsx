import { notFound } from "next/navigation";
import { ProductCard } from "@/components/ProductCard";
import { ButtonLink } from "@/components/ui/Button";
import { GlassCard } from "@/components/ui/GlassCard";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { getBrandData, getSiblingBrand, isBrand } from "@/lib/brand";
import { getProducts } from "@/lib/storefront";
import { brandThemes } from "@/styles/tokens";

export default async function BrandPage({ params }: { params: Promise<{ brand: string }> }) {
  const { brand } = await params;
  if (!isBrand(brand)) notFound();

  const meta = getBrandData(brand);
  const theme = brandThemes[brand];
  const siblingBrand = getSiblingBrand(brand);
  const siblingMeta = getBrandData(siblingBrand);
  const products = await getProducts(brand);

  return (
    <main className="px-6 py-10">
      <div className="mx-auto max-w-luxe space-y-16">
        <GlassCard className={`relative overflow-hidden p-8 md:p-14 ${theme.surface}`}>
          <div className={`absolute inset-0 bg-gradient-to-br ${meta.accentClass} opacity-80`} />
          <div className="relative grid gap-10 lg:grid-cols-[1fr_0.8fr]">
            <div className="space-y-6">
              <p className="text-[13px] uppercase tracking-[0.3em] text-white/48">{meta.themeLabel}</p>
              <h1 className="max-w-4xl font-display text-[48px] leading-[1.02] tracking-[-0.5px] md:text-[68px]">{meta.title}</h1>
              <p className={`max-w-2xl text-base leading-8 ${theme.subtle}`}>{meta.subtitle}</p>
              <div className="flex flex-wrap gap-3">
                <ButtonLink href={`/categories/${brand}`} variant="secondary">Ver colecoes</ButtonLink>
                <ButtonLink href="/gift-builder" variant="ghost">Montar presente</ButtonLink>
              </div>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              {["Curadoria", "Storytelling", "Operacao", "Atacado"].map((item) => (
                <div key={item} className="rounded-[20px] border border-white/10 bg-black/20 p-5">
                  <p className="text-sm uppercase tracking-[0.18em] text-white/42">{item}</p>
                  <p className="mt-6 text-sm leading-7 text-white/65">
                    Blocos editoriais, jornadas refinadas, imagem premium e narrativa pensada para exportacao.
                  </p>
                </div>
              ))}
            </div>
          </div>
        </GlassCard>

        <section className="grid gap-6 lg:grid-cols-[0.85fr_1.15fr]">
          <GlassCard tone="warm" className="bg-[linear-gradient(180deg,rgba(245,239,231,0.98),rgba(234,228,220,0.94))]">
            <SectionHeading
              eyebrow="Editorial"
              title="Uma linguagem visual que desacelera e qualifica."
              description="Imagens amplas, microcopy precisa, blocos de manifesto, destaques para colecoes e vitrines fluidas."
              tone="dark"
            />
          </GlassCard>
          <div className="grid gap-6 md:grid-cols-2">
            <GlassCard tone="warm" className="min-h-[230px] bg-[linear-gradient(140deg,rgba(250,246,240,0.98),rgba(235,228,218,0.96))]" />
            <GlassCard tone="contrast" className="min-h-[230px] bg-[linear-gradient(140deg,rgba(198,169,107,0.14),rgba(255,255,255,0.03))]" />
          </div>
        </section>

        <section>
          <SectionHeading
            eyebrow="Selecao"
            title="Produtos com hover suave, secundaria em fade e composicao clean."
            description="Cards modulados para storytelling visual, preco premium e exploracao fluida em desktop e mobile."
          />
          <div className="mt-10 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
            {products.map((product) => <ProductCard key={product.id} product={product} brandMode={brand} />)}
          </div>
        </section>

        <section>
          <GlassCard className="mx-auto max-w-3xl p-6 md:p-8">
            <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
              <div className="space-y-2">
                <p className="text-[12px] uppercase tracking-[0.24em] text-white/40">Outro universo</p>
                <h3 className="font-display text-[30px] tracking-[-0.5px] text-white">
                  {siblingBrand === "casa" ? "Descubra casa, ceramica e decoracao." : "Descubra couro, bolsas e sapatos."}
                </h3>
                <p className="max-w-xl text-sm leading-7 text-white/58">
                  {siblingMeta.subtitle}
                </p>
              </div>
              <ButtonLink href={`/brands/${siblingBrand}`} variant="ghost" className="w-fit">
                Visitar {siblingBrand === "casa" ? "site casa" : "site moda"}
              </ButtonLink>
            </div>
          </GlassCard>
        </section>
      </div>
    </main>
  );
}
