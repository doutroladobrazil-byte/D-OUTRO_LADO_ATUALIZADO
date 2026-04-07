import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { fetchApiData } from "@/lib/api";
import type { AuthProfile } from "@/lib/types";
import { GlassCard } from "@/components/ui/GlassCard";
import { SectionHeading } from "@/components/ui/SectionHeading";

const ROLE_LABEL: Record<string, string> = {
  customer: "Cliente",
  wholesale: "Cliente especial",
  admin: "Administrador",
};

export default async function AccountPage() {
  const supabase = await createClient();

  // Middleware already redirects unauthenticated users, but this is a
  // server-side defense-in-depth check to avoid rendering with no session.
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login?redirect=/account");

  const { data: { session } } = await supabase.auth.getSession();
  const profile = await fetchApiData<AuthProfile>("/auth/session", {
    token: session?.access_token,
    revalidate: 0,
  });

  const displayName = profile?.fullName ?? profile?.email ?? user.email ?? "Usuario";
  const roleLabel = ROLE_LABEL[profile?.role ?? "customer"] ?? "Cliente";

  return (
    <main className="px-6 py-10">
      <div className="mx-auto max-w-luxe space-y-8">
        <SectionHeading
          eyebrow="Minha conta"
          title={displayName}
          description={`${roleLabel} · ${profile?.email ?? user.email}`}
        />
        <div className="grid gap-6 lg:grid-cols-3">
          <GlassCard>
            <h3 className="font-display text-[28px] tracking-[-0.5px] text-white">Pedidos recentes</h3>
            <p className="mt-4 text-sm leading-7 text-white/58">
              Historico de pedidos disponivel na proxima etapa.
            </p>
          </GlassCard>
          <GlassCard>
            <h3 className="font-display text-[28px] tracking-[-0.5px] text-white">Enderecos</h3>
            <p className="mt-4 text-sm leading-7 text-white/58">
              Gerenciamento de enderecos disponivel na proxima etapa.
            </p>
          </GlassCard>
          <GlassCard>
            <h3 className="font-display text-[28px] tracking-[-0.5px] text-white">Preferencias</h3>
            <p className="mt-4 text-sm leading-7 text-white/58">
              Idioma: {profile?.preferredLanguage ?? "en"} · Moeda: {profile?.preferredCurrency ?? "USD"}
            </p>
          </GlassCard>
        </div>
      </div>
    </main>
  );
}
