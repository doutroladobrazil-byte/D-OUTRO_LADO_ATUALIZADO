import { GlassCard } from "@/components/ui/GlassCard";
import { SectionHeading } from "@/components/ui/SectionHeading";

export default function WholesalePage() {
  return (
    <main className="px-6 py-10">
      <div className="mx-auto max-w-luxe space-y-10">
        <SectionHeading
          eyebrow="Wholesale"
          title="Acesso diferenciado para importadores, conceito stores e gifting corporativo."
          description="Regras de atacado, thresholds por SKU, faixas de preco e estrutura pronta para aprovacao de perfil no Supabase."
        />
        <div className="grid gap-6 md:grid-cols-3">
          {["Condicoes comerciais", "Aprovacao de conta", "Logistica dedicada"].map((item) => (
            <GlassCard key={item}>
              <h3 className="font-display text-[28px] tracking-[-0.5px] text-white">{item}</h3>
              <p className="mt-4 text-sm leading-7 text-white/58">Fluxos prontos para importador, distribuidor ou revenda premium.</p>
            </GlassCard>
          ))}
        </div>
      </div>
    </main>
  );
}
