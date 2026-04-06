import { GlassCard } from "@/components/ui/GlassCard";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { getFreightRates } from "@/lib/storefront";

export default async function InternationalShippingPage() {
  const rates = await getFreightRates();

  return (
    <main className="px-6 py-10">
      <div className="mx-auto max-w-luxe space-y-10">
        <SectionHeading
          eyebrow="Logistica premium"
          title="Frete automatico por peso, leitura transparente e estrutura pronta para escala."
          description="A camada foi desenhada para acoplar providers reais sem alterar a experiencia visual do checkout."
        />
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {rates.map((rate) => (
            <GlassCard key={`${rate.region}-${rate.weightRange}`}>
              <p className="text-[13px] uppercase tracking-[0.22em] text-white/42">{rate.region}</p>
              <h3 className="mt-4 font-display text-[28px] tracking-[-0.5px] text-white">{rate.weightRange}</h3>
              <p className="mt-4 text-lg text-gold">R$ {rate.amountBRL.toFixed(2)}</p>
            </GlassCard>
          ))}
        </div>
      </div>
    </main>
  );
}
