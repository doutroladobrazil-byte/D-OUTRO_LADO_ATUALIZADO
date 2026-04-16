import { notFound, redirect } from "next/navigation";
import { ArrowRight } from "lucide-react";
import { ProductCard } from "@/components/ProductCard";
import { ButtonLink } from "@/components/ui/Button";
import { GlassCard } from "@/components/ui/GlassCard";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { isBrand } from "@/lib/brand";
import { getProducts } from "@/lib/storefront";

export default async function BrandPage({ params }: { params: Promise<{ brand: string }> }) {
  const { brand } = await params;
  if (!isBrand(brand)) notFound();

  // Casa foi descontinuado como universo público — redireciona para moda
  if (brand === "casa") {
    redirect("/brands/moda");
  }

  const products = await getProducts("moda");
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
                  Moda / Couro / Acessórios
                </p>
                <h1 className="max-w-3xl font-display text-[36px] leading-[1.02] tracking-[-1px] text-white sm:text-[48px] md:text-[72px]">
                  Couro legítimo
                  <br />
                  com presença.
                </h1>
                <p className="max-w-xl text-base leading-[1.88] text-white/55 md:text-[17px]">
                  Bolsas, cintos, sapatos e acessórios em couro premium brasileiro. Um wardrobe de presença para o mercado internacional — curadoria, materialidade e identidade em cada peça.
                </p>
                <div className="flex flex-wrap gap-3 pt-2">
                  <ButtonLink href="/brands/moda">Ver coleções</ButtonLink>
                  <ButtonLink href="/gift-builder" variant="secondary">
                    Montar presente
                  </ButtonLink>
                </div>
              </div>
              <div className="hidden xl:grid xl:gap-3">
                {[
                  "Couro bovino premium",
                  "Curtimento natural",
                  "Séries limitadas",
                  "Exportação certificada",
                ].map((item) => (
                  <div
                    key={item}
                    className="rounded-[16px] border border-[#C6A96B]/20 bg-[rgba(198,169,107,0.06)] px-5 py-3"
                  >
                    <p className="text-[12px] uppercase tracking-[0.22em] text-[#C6A96B]/70">{item}</p>
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
              {[
                {
                  label: "Qualidade",
                  desc: "Couro bovino selecionado, curtido sem atalhos.",
                },
                {
                  label: "Exclusividade",
                  desc: "Séries limitadas com número de controle.",
                },
                {
                  label: "Presença",
                  desc: "Peças que existem antes de serem usadas.",
                },
                {
                  label: "Narrativa",
                  desc: "Cada coleção com editorial próprio e contexto.",
                },
              ].map((item, i) => (
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
                eyebrow="Editorial"
                title="Um wardrobe que não precisa de explicação."
                description="Couro legítimo brasileiro exportado com precisão, cuidado e identidade. Para quem reconhece materialidade sem que ninguém precise nomear."
              />
              <ButtonLink
                href="/brands/moda"
                variant="ghost"
                className="mt-8 w-fit"
              >
                Explorar coleções <ArrowRight className="ml-2 size-4" />
              </ButtonLink>
            </GlassCard>
          </div>
        </div>
      </section>

      {/* ── Products ──────────────────────────────────────────────────────── */}
      <section className="px-4 py-12 md:px-6 md:py-16">
        <div className="mx-auto max-w-luxe">
          <div className="flex items-end justify-between gap-6">
            <SectionHeading
              eyebrow="Seleção"
              title="Couro e acessórios com acabamento internacional."
            />
            <ButtonLink
              href="/brands/moda"
              variant="ghost"
              className="hidden shrink-0 md:inline-flex"
            >
              Ver tudo <ArrowRight className="ml-2 size-4" />
            </ButtonLink>
          </div>
          <div className="mt-10 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
            {displayProducts.length > 0 ? (
              displayProducts.map((product) => (
                <ProductCard key={product.id} product={product} brandMode="moda" />
              ))
            ) : (
              <div className="col-span-full rounded-[22px] border border-dashed border-white/10 py-16 text-center">
                <p className="text-sm text-white/35">Produtos em breve.</p>
              </div>
            )}
          </div>
          <div className="mt-8 text-center md:hidden">
            <ButtonLink href="/brands/moda" variant="ghost">
              Ver tudo <ArrowRight className="ml-2 size-4" />
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
                <p className="text-[11px] uppercase tracking-[0.38em] text-black/32">Composição de presente</p>
                <h3 className="font-display text-[24px] leading-[1.08] tracking-[-0.5px] text-[#17120d] md:text-[34px]">
                  Monte um presente editorial com nossas peças.
                </h3>
                <p className="max-w-lg text-sm leading-7 text-black/55">
                  Selecione itens, escolha a embalagem e adicione uma mensagem. Uma composição sofisticada entregue com cuidado.
                </p>
              </div>
              <ButtonLink href="/gift-builder" variant="light" className="w-fit shrink-0">
                Montar kit <ArrowRight className="ml-2 size-4" />
              </ButtonLink>
            </div>
          </GlassCard>
        </div>
      </section>
    </main>
  );
}
