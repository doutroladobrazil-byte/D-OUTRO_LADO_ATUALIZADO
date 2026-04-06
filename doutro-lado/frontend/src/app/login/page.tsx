import { GlassCard } from "@/components/ui/GlassCard";
import { SectionHeading } from "@/components/ui/SectionHeading";

export default function LoginPage() {
  return (
    <main className="px-6 py-10">
      <div className="mx-auto grid max-w-5xl gap-8 xl:grid-cols-[0.95fr_1.05fr]">
        <GlassCard className="space-y-6">
          <SectionHeading
            eyebrow="Autenticacao premium"
            title="Entrar com Google, Apple, email e continuidade mobile."
            description="Estrutura pronta para Supabase Auth, social providers e biometria em experiencia mobile-first."
          />
          <div className="space-y-3">
            {["Continuar com Google", "Continuar com Apple", "Entrar com email"].map((label) => (
              <button key={label} className="w-full rounded-full border border-white/10 bg-white/[0.04] px-5 py-4 text-sm uppercase tracking-[0.18em] text-white transition duration-300 hover:-translate-y-0.5 hover:border-gold/45">
                {label}
              </button>
            ))}
          </div>
        </GlassCard>
        <GlassCard className="space-y-5">
          {["Email", "Senha"].map((field) => (
            <input
              key={field}
              placeholder={field}
              className="w-full rounded-[18px] border border-white/10 bg-black/20 px-4 py-4 text-white outline-none placeholder:text-white/25 focus:border-gold/45"
            />
          ))}
          <div className="rounded-[18px] border border-white/10 bg-black/20 p-4 text-sm text-white/55">
            Biometria mobile e sessao persistente podem ser ligadas diretamente via Supabase no proximo passo.
          </div>
          <button className="w-full rounded-full border border-gold bg-gold px-5 py-4 text-sm uppercase tracking-[0.18em] text-black transition duration-300 hover:-translate-y-0.5">
            Entrar
          </button>
        </GlassCard>
      </div>
    </main>
  );
}
