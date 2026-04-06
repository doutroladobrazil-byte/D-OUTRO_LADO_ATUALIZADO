import { notFound } from "next/navigation";
import { getBrandData, isBrand } from "@/lib/brand";
import { GlassCard } from "@/components/ui/GlassCard";
import { SectionHeading } from "@/components/ui/SectionHeading";

const steps = ["Carrinho", "Endereco", "Frete", "Pagamento"];

export default async function BrandCheckoutPage({ params }: { params: Promise<{ brand: string }> }) {
  const { brand } = await params;
  if (!isBrand(brand)) notFound();

  const meta = getBrandData(brand);

  return (
    <main className="px-6 py-10">
      <div className="mx-auto max-w-luxe space-y-10">
        <SectionHeading
          eyebrow={`Checkout / ${meta.themeLabel}`}
          title={`Fluxo de pagamento exclusivo para o site ${brand === "casa" ? "Casa" : "Moda"}.`}
          description="Endereco, frete e pagamento seguem separados para que os universos nao se misturem para o usuario."
        />
        <div className="grid gap-8 xl:grid-cols-[1fr_0.42fr]">
          <div className="space-y-6">
            <GlassCard>
              <div className="grid gap-3 md:grid-cols-4">
                {steps.map((step, index) => (
                  <div key={step} className={`rounded-[18px] border px-4 py-4 text-center text-sm uppercase tracking-[0.18em] ${index === 0 ? "border-gold bg-gold/15 text-white" : "border-white/10 bg-white/[0.03] text-white/45"}`}>
                    {step}
                  </div>
                ))}
              </div>
            </GlassCard>
            <GlassCard className="space-y-5">
              <h2 className="font-display text-[36px] tracking-[-0.5px] text-white">Entrega internacional</h2>
              <div className="grid gap-4 md:grid-cols-2">
                {["Nome completo", "Email", "Pais", "Cidade", "Endereco", "CEP"].map((field) => (
                  <input
                    key={field}
                    placeholder={field}
                    className="rounded-[18px] border border-white/10 bg-black/25 px-4 py-4 text-white outline-none placeholder:text-white/25 focus:border-gold/50"
                  />
                ))}
              </div>
            </GlassCard>
          </div>
          <GlassCard className="h-fit space-y-5">
            <div className="rounded-[18px] border border-gold/30 bg-gold/8 px-4 py-4 text-sm leading-7 text-white/65">
              Resumo exclusivo do site {brand === "casa" ? "Casa" : "Moda"}.
            </div>
            {[
              ["Subtotal", "R$ 1.659,00"],
              ["Frete estimado", "R$ 184,00"],
              ["Packaging signature", "R$ 48,00"]
            ].map(([label, value]) => (
              <div key={label} className="flex items-center justify-between border-b border-white/8 pb-4 text-sm">
                <span className="text-white/50">{label}</span>
                <span className="text-white">{value}</span>
              </div>
            ))}
            <div className="flex items-center justify-between pt-2 text-lg">
              <span className="text-white/55">Total</span>
              <strong className="text-white">R$ 1.891,00</strong>
            </div>
            <button className="w-full rounded-full border border-gold bg-gold px-5 py-4 text-sm uppercase tracking-[0.18em] text-black transition duration-300 hover:-translate-y-0.5">
              Ir para pagamento
            </button>
          </GlassCard>
        </div>
      </div>
    </main>
  );
}
