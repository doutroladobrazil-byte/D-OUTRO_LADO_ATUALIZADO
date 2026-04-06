import { GlassCard } from "@/components/ui/GlassCard";
import { SectionHeading } from "@/components/ui/SectionHeading";

export default function AboutPage() {
  return (
    <main className="px-6 py-10">
      <div className="mx-auto max-w-luxe space-y-10">
        <SectionHeading
          eyebrow="Manifesto"
          title="Uma casa de marcas brasileiras pensada para o mercado internacional."
          description="D&apos;OUTRO LADO combina quiet luxury, operacao rigorosa e narrativa sensorial para produtos de casa, couro e acessorios."
        />
        <div className="grid gap-6 lg:grid-cols-3">
          {["Curadoria", "Operacao", "Experiencia"].map((item) => (
            <GlassCard key={item}>
              <h3 className="font-display text-[28px] tracking-[-0.5px] text-white">{item}</h3>
              <p className="mt-4 text-sm leading-7 text-white/58">
                Estrutura premium para produto, narrativa editorial, checkout internacional e gestao centralizada.
              </p>
            </GlassCard>
          ))}
        </div>
      </div>
    </main>
  );
}
