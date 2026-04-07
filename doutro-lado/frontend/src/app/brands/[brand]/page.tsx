import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { ProductCard } from "@/components/ProductCard";
import { ButtonLink } from "@/components/ui/Button";
import { GlassCard } from "@/components/ui/GlassCard";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { isBrand, getSiblingBrand } from "@/lib/brand";
import { getProducts } from "@/lib/storefront";

export default async function BrandPage({ params }: { params: Promise<{ brand: string }> }) {
  const { brand } = await params;
  if (!isBrand(brand)) notFound();

  const products = await getProducts(brand);
  const featured = products.filter((p) => p.featured).slice(0, 4);
  const displayProducts = featured.length >= 2 ? featured : products.slice(0, 4);
  const siblingBrand = getSiblingBrand(brand);

  if (brand === "casa") {
    return (
      <main>
        {/* ── Casa Hero ─────────────────────────────────────────────────────── */}
        <section className="px-6 pb-8 pt-10">
          <div className="mx-auto max-w-luxe">
            <GlassCard
              tone="warm"
              className="relative overflow-hidden p-8 md:p-14"
            >
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.55),transparent_38%),linear-gradient(160deg,rgba(250,246,240,0.98),rgba(234,228,218,0.95))]" />
              <div className="relative grid gap-12 xl:grid-cols-[1fr_0.7fr] xl:items-end">
                <div className="space-y-8">
                  <p className="text-[11px] uppercase tracking-[0.42em] text-black/35">
                    Casa / Ceramica / Decoracao
                  </p>
                  <h1 className="max-w-3xl font-display text-[52px] leading-[1.02] tracking-[-1px] text-[#17120d] md:text-[72px]">
                    Materialidade
                    <br />
                    com origem.
                  </h1>
                  <p className="max-w-xl text-[17px] leading-[1.88] text-black/55">
                    Ceramica autoral, linho natural e objetos de decoracao pensados para interiores internacionais com raiz brasileira e acabamento de referencia.
                  </p>
                  <div className="flex flex-wrap gap-3 pt-2">
                    <ButtonLink href="/categories/casa" variant="light">
                      Ver colecoes
                    </ButtonLink>
                    <ButtonLink href="/gift-builder" variant="ghost">
                      Montar presente
                    </ButtonLink>
                  </div>
                </div>
                <div className="hidden xl:grid xl:gap-3">
                  {["Ceramica autoral", "Linho e fibras naturais", "Objetos de mesa posta", "Decoracao de interiores"].map((item) => (
                    <div
                      key={item}
                      className="rounded-[16px] border border-black/8 bg-white/60 px-5 py-3"
                    >
                      <p className="text-[12px] uppercase tracking-[0.22em] text-black/42">{item}</p>
                    </div>
                  ))}
                </div>
              </div>
            </GlassCard>
          </div>
        </section>

        {/* ── Casa Editorial ────────────────────────────────────────────────── */}
        <section className="px-6 py-16">
          <div className="mx-auto max-w-luxe">
            <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
              <GlassCard
                tone="warm"
                className="flex flex-col justify-between p-8 md:p-12"
              >
                <SectionHeading
                  eyebrow="Editorial"
                  title="Uma casa que respira. Objetos com historia."
                  description="Cada peca foi selecionada pela sua materialidade, origem e capacidade de criar espacos com identidade. Sem tendencias. Com permanencia."
                  tone="dark"
                />
                <ButtonLink
                  href="/categories/casa"
                  variant="light"
                  className="mt-8 w-fit"
                >
                  Explorar colecoes <ArrowRight className="ml-2 size-4" />
                </ButtonLink>
              </GlassCard>
              <div className="grid gap-6 grid-cols-2">
                {["Origem", "Textura", "Escala", "Curadoria"].map((label, i) => (
                  <div
                    key={label}
                    className={`flex flex-col justify-between rounded-[24px] border p-6 ${
                      i % 2 === 0
                        ? "border-black/8 bg-[linear-gradient(135deg,rgba(255,255,255,0.92),rgba(240,235,228,0.88))]"
                        : "border-[#C6A96B]/25 bg-[linear-gradient(135deg,rgba(198,169,107,0.12),rgba(255,255,255,0.04))]"
                    }`}
                  >
                    <p className="text-[11px] uppercase tracking-[0.3em] text-black/35">{label}</p>
                    <p className="mt-12 text-sm leading-6 text-black/55">
                      {label === "Origem" && "Do atelie brasileiro ao mercado internacional."}
                      {label === "Textura" && "Acabamento natural, toque humano, forma singular."}
                      {label === "Escala" && "Pecas unicas e series limitadas com identidade."}
                      {label === "Curadoria" && "Selecao por materialidade, nao por volume."}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ── Casa Products ─────────────────────────────────────────────────── */}
        <section className="px-6 py-16">
          <div className="mx-auto max-w-luxe">
            <div className="flex items-end justify-between gap-6">
              <SectionHeading
                eyebrow="Selecao casa"
                title="Objetos com presenca editorial e raiz brasileira."
                tone="dark"
              />
              <ButtonLink
                href="/categories/casa"
                variant="ghost"
                className="hidden shrink-0 md:inline-flex"
              >
                Ver tudo <ArrowRight className="ml-2 size-4" />
              </ButtonLink>
            </div>
            <div className="mt-10 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
              {displayProducts.map((product) => (
                <ProductCard key={product.id} product={product} brandMode="casa" />
              ))}
            </div>
          </div>
        </section>

        {/* ── Casa — Cross-brand ────────────────────────────────────────────── */}
        <section className="px-6 pb-16">
          <div className="mx-auto max-w-luxe">
            <div className="overflow-hidden rounded-[28px] border border-white/10 bg-[linear-gradient(135deg,rgba(255,255,255,0.04),rgba(0,0,0,0.88))] p-8 md:p-10">
              <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
                <div className="space-y-3">
                  <p className="text-[11px] uppercase tracking-[0.38em] text-white/35">Outro universo</p>
                  <h3 className="font-display text-[34px] leading-[1.08] tracking-[-0.5px] text-white">
                    Descubra couro, bolsas e acessorios.
                  </h3>
                  <p className="max-w-lg text-sm leading-7 text-white/55">
                    Uma linguagem mais densa, precisa e exclusiva para colecoes premium, presentes corporativos e wardrobes export-ready.
                  </p>
                </div>
                <ButtonLink href={`/brands/${siblingBrand}`} variant="secondary" className="w-fit shrink-0">
                  Visitar Moda <ArrowRight className="ml-2 size-4" />
                </ButtonLink>
              </div>
            </div>
          </div>
        </section>
      </main>
    );
  }

  // ── Moda ──────────────────────────────────────────────────────────────────
  return (
    <main>
      {/* ── Moda Hero ─────────────────────────────────────────────────────── */}
      <section className="px-6 pb-8 pt-10">
        <div className="mx-auto max-w-luxe">
          <GlassCard className="relative overflow-hidden p-8 md:p-14">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(198,169,107,0.12),transparent_38%),linear-gradient(160deg,rgba(255,255,255,0.04),rgba(0,0,0,0.92))]" />
            <div className="relative grid gap-12 xl:grid-cols-[1fr_0.7fr] xl:items-end">
              <div className="space-y-8">
                <p className="text-[11px] uppercase tracking-[0.42em] text-white/35">
                  Moda / Couro / Acessorios
                </p>
                <h1 className="max-w-3xl font-display text-[52px] leading-[1.02] tracking-[-1px] text-white md:text-[72px]">
                  Couro legitimo
                  <br />
                  com presenca.
                </h1>
                <p className="max-w-xl text-[17px] leading-[1.88] text-white/55">
                  Bolsas, cintos, sapatos e acessorios em couro premium brasileiro. Um wardrobe de presenca para o mercado internacional com curadoria e materialidade exclusiva.
                </p>
                <div className="flex flex-wrap gap-3 pt-2">
                  <ButtonLink href="/categories/moda" variant="secondary">
                    Ver colecoes
                  </ButtonLink>
                  <ButtonLink href="/gift-builder" variant="ghost">
                    Montar presente
                  </ButtonLink>
                </div>
              </div>
              <div className="hidden xl:grid xl:gap-3">
                {["Couro bovino premium", "Curtimento natural", "Pecas exclusivas", "Exportacao certificada"].map((item) => (
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

      {/* ── Moda Editorial ────────────────────────────────────────────────── */}
      <section className="px-6 py-16">
        <div className="mx-auto max-w-luxe">
          <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
            <div className="grid gap-6">
              {["Qualidade", "Exclusividade", "Presenca", "Narrativa"].map((label, i) => (
                <div
                  key={label}
                  className={`flex items-center gap-4 rounded-[20px] border px-6 py-5 ${
                    i % 2 === 0
                      ? "border-[#C6A96B]/20 bg-[rgba(198,169,107,0.06)]"
                      : "border-white/8 bg-white/[0.03]"
                  }`}
                >
                  <div className="size-2 shrink-0 rounded-full bg-[#C6A96B]/60" />
                  <div>
                    <p className="text-[11px] uppercase tracking-[0.3em] text-white/35">{label}</p>
                    <p className="mt-1 text-sm text-white/60">
                      {label === "Qualidade" && "Couro bovino selecionado, curtido sem atalhos."}
                      {label === "Exclusividade" && "Series limitadas com numero de controle."}
                      {label === "Presenca" && "Pecas que existem antes de serem usadas."}
                      {label === "Narrativa" && "Cada colecao com editorial proprio e contexto."}
                    </p>
                  </div>
                </div>
              ))}
            </div>
            <GlassCard className="flex flex-col justify-between p-8 md:p-12">
              <SectionHeading
                eyebrow="Editorial Moda"
                title="Um wardrobe que nao precisa explicacao."
                description="Couro legitimo brasileiro exportado com precisao, cuidado e identidade. Para quem reconhece materialidade sem que ninguem precise nomear."
              />
              <ButtonLink
                href="/categories/moda"
                variant="ghost"
                className="mt-8 w-fit"
              >
                Explorar colecoes <ArrowRight className="ml-2 size-4" />
              </ButtonLink>
            </GlassCard>
          </div>
        </div>
      </section>

      {/* ── Moda Products ─────────────────────────────────────────────────── */}
      <section className="px-6 py-16">
        <div className="mx-auto max-w-luxe">
          <div className="flex items-end justify-between gap-6">
            <SectionHeading
              eyebrow="Selecao moda"
              title="Couro e acessorios com acabamento internacional."
            />
            <ButtonLink
              href="/categories/moda"
              variant="ghost"
              className="hidden shrink-0 md:inline-flex"
            >
              Ver tudo <ArrowRight className="ml-2 size-4" />
            </ButtonLink>
          </div>
          <div className="mt-10 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
            {displayProducts.map((product) => (
              <ProductCard key={product.id} product={product} brandMode="moda" />
            ))}
          </div>
        </div>
      </section>

      {/* ── Moda — Cross-brand ────────────────────────────────────────────── */}
      <section className="px-6 pb-16">
        <div className="mx-auto max-w-luxe">
          <GlassCard
            tone="warm"
            className="overflow-hidden p-8 md:p-10"
          >
            <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
              <div className="space-y-3">
                <p className="text-[11px] uppercase tracking-[0.38em] text-black/32">Outro universo</p>
                <h3 className="font-display text-[34px] leading-[1.08] tracking-[-0.5px] text-[#17120d]">
                  Descubra ceramica, casa e decoracao.
                </h3>
                <p className="max-w-lg text-sm leading-7 text-black/55">
                  Uma experiencia calma, material e sensorial inspirada em ceramica autoral, linho e objetos para interiores internacionais.
                </p>
              </div>
              <ButtonLink href={`/brands/${siblingBrand}`} variant="light" className="w-fit shrink-0">
                Visitar Casa <ArrowRight className="ml-2 size-4" />
              </ButtonLink>
            </div>
          </GlassCard>
        </div>
      </section>
    </main>
  );
}
