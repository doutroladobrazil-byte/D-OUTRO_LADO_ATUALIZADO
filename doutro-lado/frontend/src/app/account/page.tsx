import { GlassCard } from "@/components/ui/GlassCard";
import { SectionHeading } from "@/components/ui/SectionHeading";

export default function AccountPage() {
  return (
    <main className="px-6 py-10">
      <div className="mx-auto max-w-luxe space-y-8">
        <SectionHeading eyebrow="Minha conta" title="Pedidos, favoritos, dados e preferencias internacionais." />
        <div className="grid gap-6 lg:grid-cols-3">
          {["Pedidos recentes", "Enderecos", "Preferencias de idioma e moeda"].map((title) => (
            <GlassCard key={title}>
              <h3 className="font-display text-[28px] tracking-[-0.5px] text-white">{title}</h3>
              <p className="mt-4 text-sm leading-7 text-white/58">Blocos prontos para serem conectados ao Supabase e ao historico real do cliente.</p>
            </GlassCard>
          ))}
        </div>
      </div>
    </main>
  );
}
