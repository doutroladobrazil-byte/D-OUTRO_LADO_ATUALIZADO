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

type MyOrder = {
  publicId: string;
  brand: string;
  currency: string;
  totalBRL: number;
  orderStatus: string;
  paymentStatus: string;
  destinationCountryCode: string | null;
  destinationCountryName: string | null;
  createdAt: string;
};

const STATUS_LABEL: Record<string, string> = {
  created: "Criado",
  processing: "Em processamento",
  packing: "Em embalagem",
  shipped: "Enviado",
  delivered: "Entregue",
  cancelled: "Cancelado",
  pending: "Pendente",
  paid: "Pago",
  failed: "Falhou",
  refunded: "Reembolsado",
};

export default async function AccountPage() {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login?redirect=/account");

  const { data: { session } } = await supabase.auth.getSession();
  const token = session?.access_token;

  const [profile, orders] = await Promise.all([
    fetchApiData<AuthProfile>("/auth/session", { token, revalidate: 0 }),
    fetchApiData<MyOrder[]>("/orders/mine", { token, revalidate: 0 }),
  ]);

  const displayName = profile?.fullName ?? profile?.email ?? user.email ?? "Usuario";
  const roleLabel = ROLE_LABEL[profile?.role ?? "customer"] ?? "Cliente";

  return (
    <main className="px-6 py-10">
      <div className="mx-auto max-w-luxe space-y-10">
        <SectionHeading
          eyebrow="Minha conta"
          title={displayName}
          description={`${roleLabel} · ${profile?.email ?? user.email}`}
        />

        {/* Profile summary */}
        <div className="grid gap-4 sm:grid-cols-3">
          <GlassCard>
            <p className="text-[11px] uppercase tracking-[0.22em] text-white/35 mb-3">Idioma</p>
            <p className="text-white">{profile?.preferredLanguage ?? "en"}</p>
          </GlassCard>
          <GlassCard>
            <p className="text-[11px] uppercase tracking-[0.22em] text-white/35 mb-3">Moeda</p>
            <p className="text-white">{profile?.preferredCurrency ?? "USD"}</p>
          </GlassCard>
          <GlassCard>
            <p className="text-[11px] uppercase tracking-[0.22em] text-white/35 mb-3">Perfil</p>
            <p className="text-white">{roleLabel}</p>
          </GlassCard>
        </div>

        {/* Orders list */}
        <section className="space-y-4">
          <h2 className="font-display text-[26px] tracking-[-0.4px] text-white">Meus pedidos</h2>

          {!orders || orders.length === 0 ? (
            <GlassCard>
              <p className="text-sm text-white/50">Nenhum pedido encontrado.</p>
            </GlassCard>
          ) : (
            <div className="space-y-3">
              {orders.map((order) => (
                <GlassCard key={order.publicId} tone="dark" className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="space-y-1">
                    <p className="font-mono text-sm text-white">{order.publicId}</p>
                    <p className="text-[12px] text-white/45">
                      {order.destinationCountryName ?? order.destinationCountryCode ?? "—"}
                      {" · "}
                      {order.createdAt.split("T")[0]}
                    </p>
                  </div>
                  <div className="flex items-center gap-4 text-sm">
                    <span className="text-white/60">
                      {STATUS_LABEL[order.paymentStatus] ?? order.paymentStatus}
                    </span>
                    <span className="text-white font-medium">
                      R$ {order.totalBRL.toFixed(2)}
                    </span>
                    <span className={[
                      "rounded-full px-3 py-1 text-[11px] uppercase tracking-[0.15em]",
                      order.orderStatus === "delivered"
                        ? "border border-emerald-400/30 bg-emerald-400/10 text-emerald-300"
                        : order.orderStatus === "cancelled"
                          ? "border border-red-400/30 bg-red-400/10 text-red-300"
                          : "border border-white/15 bg-white/5 text-white/50",
                    ].join(" ")}>
                      {STATUS_LABEL[order.orderStatus] ?? order.orderStatus}
                    </span>
                  </div>
                </GlassCard>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
