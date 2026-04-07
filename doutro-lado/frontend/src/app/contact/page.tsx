import { GlassCard } from "@/components/ui/GlassCard";
import { SectionHeading } from "@/components/ui/SectionHeading";

export default function ContactPage() {
  return (
    <main className="px-6 py-10">
      <div className="mx-auto grid max-w-luxe gap-8 xl:grid-cols-[0.8fr_1.2fr]">
        <GlassCard>
          <SectionHeading
            eyebrow="Contato"
            title="Relacao premium para wholesale, gifting e atendimento editorial."
            description="Uma experiencia de contato limpa, responsiva e pronta para integrar CRM, automacoes e atendimento internacional."
          />
        </GlassCard>
        <GlassCard className="space-y-4">
          {["Nome", "Email", "Empresa", "Mensagem"].map((field) => (
            <input
              key={field}
              placeholder={field}
              className="w-full rounded-[18px] border border-white/10 bg-black/20 px-4 py-4 text-white outline-none placeholder:text-white/25 focus:border-gold/45"
            />
          ))}
          <button className="rounded-full border border-gold bg-gold px-5 py-4 text-sm uppercase tracking-[0.18em] text-black transition duration-300 hover:-translate-y-0.5">
            Enviar mensagem
          </button>
        </GlassCard>
      </div>
    </main>
  );
}
