import { notFound } from "next/navigation";
import Link from "next/link";
import { getBrandCheckoutPath, getBrandData, isBrand } from "@/lib/brand";
import { GlassCard } from "@/components/ui/GlassCard";
import { SectionHeading } from "@/components/ui/SectionHeading";

export default async function BrandCartPage({ params }: { params: Promise<{ brand: string }> }) {
  const { brand } = await params;
  if (!isBrand(brand)) notFound();

  const meta = getBrandData(brand);
  const items = brand === "casa" ? ["Colecao Terracota Atelier", "Jogo de Linho Botanico"] : ["Bolsa Atelier Noir", "Cinto Signature Bronze"];

  return (
    <main className="px-6 py-10">
      <div className="mx-auto max-w-luxe space-y-10">
        <SectionHeading
          eyebrow={`Carrinho / ${meta.themeLabel}`}
          title={`Selecao preservada apenas para o site ${brand === "casa" ? "Casa" : "Moda"}.`}
          description="A jornada de compra foi separada para evitar mistura entre os dois universos para o usuario."
        />
        <div className="grid gap-8 xl:grid-cols-[1fr_0.42fr]">
          <div className="space-y-4">
            {items.map((item) => (
              <GlassCard key={item} className="flex items-center justify-between gap-6">
                <div className="flex items-center gap-5">
                  <div className="h-28 w-24 rounded-[20px] bg-[linear-gradient(135deg,rgba(255,255,255,0.12),rgba(0,0,0,0.7))]" />
                  <div>
                    <h3 className="font-display text-[28px] tracking-[-0.5px] text-white">{item}</h3>
                    <p className="text-sm text-white/50">Quantidade 1</p>
                  </div>
                </div>
                <span className="text-white">R$ 389,00</span>
              </GlassCard>
            ))}
          </div>
          <GlassCard className="h-fit space-y-5">
            <div className="flex items-center justify-between text-sm text-white/55"><span>Subtotal</span><span>R$ 1.679,00</span></div>
            <div className="flex items-center justify-between text-sm text-white/55"><span>Frete</span><span>Calculado no checkout</span></div>
            <Link href={getBrandCheckoutPath(brand)} className="block rounded-full border border-gold bg-gold px-5 py-4 text-center text-sm uppercase tracking-[0.18em] text-black transition duration-300 hover:-translate-y-0.5">
              Continuar
            </Link>
          </GlassCard>
        </div>
      </div>
    </main>
  );
}
