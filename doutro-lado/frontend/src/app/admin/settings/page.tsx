import {
  AdminPageHeader,
  AdminSection,
  MetricCard,
  StatusBadge,
} from "@/features/admin/AdminComponents";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Configurações — D'OUTRO LADO Admin" };

const INTEGRATIONS = [
  { name: "Supabase Auth", status: "active", note: "JWT via @supabase/ssr" },
  { name: "Supabase Storage", status: "active", note: "Media buckets por marca" },
  { name: "Stripe Checkout", status: "pending", note: "Configurar STRIPE_SECRET_KEY em produção" },
  { name: "Stripe Webhook", status: "pending", note: "Configurar STRIPE_WEBHOOK_SECRET e PAYMENTS_MODE=stripe" },
  { name: "PostgreSQL (Supabase)", status: "active", note: "Pool via postgres.js" },
];

const ENV_VARS = [
  { key: "SUPABASE_URL", scope: "Backend + Frontend" },
  { key: "SUPABASE_SERVICE_ROLE_KEY", scope: "Backend" },
  { key: "NEXT_PUBLIC_SUPABASE_URL", scope: "Frontend" },
  { key: "NEXT_PUBLIC_SUPABASE_ANON_KEY", scope: "Frontend" },
  { key: "STRIPE_SECRET_KEY", scope: "Backend" },
  { key: "STRIPE_WEBHOOK_SECRET", scope: "Backend" },
  { key: "PAYMENTS_MODE", scope: "Backend (stripe | mock)" },
  { key: "APP_URL", scope: "Backend (success/cancel URLs)" },
  { key: "NEXT_PUBLIC_API_URL", scope: "Frontend (URL da API)" },
];

export default function AdminSettingsPage() {
  return (
    <div className="space-y-10">
      <AdminPageHeader
        eyebrow="Configuração da plataforma"
        title="Configurações."
        description="Status de integrações e variáveis de ambiente obrigatórias para operação em produção."
      />

      <AdminSection title="Integrações" eyebrow="Status por provider">
        <div className="space-y-3">
          {INTEGRATIONS.map((item) => (
            <div
              key={item.name}
              className="flex items-center justify-between gap-4 rounded-[16px] border border-white/8 bg-white/[0.02] px-5 py-4"
            >
              <div>
                <p className="text-sm font-medium text-white">{item.name}</p>
                <p className="text-[12px] text-white/38">{item.note}</p>
              </div>
              <StatusBadge status={item.status} />
            </div>
          ))}
        </div>
      </AdminSection>

      <AdminSection title="Variáveis de ambiente" eyebrow="Checklist de produção">
        <div className="overflow-hidden rounded-[18px] border border-white/8 bg-white/[0.02]">
          {ENV_VARS.map((v, i) => (
            <div
              key={v.key}
              className={`flex items-center justify-between gap-4 px-5 py-3 ${i < ENV_VARS.length - 1 ? "border-b border-white/5" : ""}`}
            >
              <code className="text-sm text-[#C6A96B]">{v.key}</code>
              <span className="text-[12px] text-white/38">{v.scope}</span>
            </div>
          ))}
        </div>
      </AdminSection>

      <AdminSection title="Plataforma" eyebrow="Informações técnicas">
        <div className="grid gap-4 sm:grid-cols-4">
          <MetricCard label="Frontend" value="Next.js 16" />
          <MetricCard label="Backend" value="Express + TS" />
          <MetricCard label="Database" value="Supabase/PG" />
          <MetricCard label="Stage atual" value="Stage 8" highlight="gold" />
        </div>
      </AdminSection>
    </div>
  );
}
