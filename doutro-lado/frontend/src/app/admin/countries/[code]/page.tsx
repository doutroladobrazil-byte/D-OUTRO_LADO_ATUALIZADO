import { notFound } from "next/navigation";
import { requireAdminToken } from "@/lib/admin-server-auth";
import { fetchApiData } from "@/lib/api";
import {
  AdminPageHeader,
  AdminSection,
} from "@/features/admin/AdminComponents";
import { CountryPolicyEditor } from "@/features/admin/CountryPolicyEditor";
import type { CountryDetail } from "@/lib/types";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "País — D'OUTRO LADO Admin" };

const COUNTRY_FLAGS: Record<string, string> = {
  US: "🇺🇸",
  CH: "🇨🇭",
  IE: "🇮🇪",
  DE: "🇩🇪",
  IS: "🇮🇸",
  SG: "🇸🇬",
};

export default async function AdminCountryDetailPage({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const { code } = await params;
  const token = await requireAdminToken();

  const country = await fetchApiData<CountryDetail>(`/countries/${code.toUpperCase()}`, {
    token,
    revalidate: 0,
  });

  if (!country) notFound();

  const flag = COUNTRY_FLAGS[country.code] ?? "🌐";

  return (
    <div className="space-y-10">
      <AdminPageHeader
        eyebrow={`${flag} ${country.code}`}
        title={country.name}
        description={`${country.regionGroup} · ${country.defaultCurrency} · ${country.checkoutEnabled ? "Checkout enabled" : "Checkout disabled"}`}
      />

      {/* Commerce rule — read-only summary */}
      {country.commerceRule ? (
        <AdminSection title="Commerce rule" eyebrow="Pricing & rules">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 text-sm">
            <div className="rounded-[14px] border border-white/8 bg-white/[0.02] p-4 space-y-1">
              <p className="text-[11px] uppercase tracking-[0.2em] text-white/30">Currency</p>
              <p className="text-white font-mono">{country.commerceRule.pricingCurrency}</p>
            </div>
            <div className="rounded-[14px] border border-white/8 bg-white/[0.02] p-4 space-y-1">
              <p className="text-[11px] uppercase tracking-[0.2em] text-white/30">Tax</p>
              <p className="text-white">{country.commerceRule.taxPercent}%</p>
            </div>
            <div className="rounded-[14px] border border-white/8 bg-white/[0.02] p-4 space-y-1">
              <p className="text-[11px] uppercase tracking-[0.2em] text-white/30">Delivery estimate</p>
              <p className="text-white">{country.commerceRule.estimatedDeliveryMinDays}–{country.commerceRule.estimatedDeliveryMaxDays} business days</p>
            </div>
            <div className="rounded-[14px] border border-white/8 bg-white/[0.02] p-4 space-y-1">
              <p className="text-[11px] uppercase tracking-[0.2em] text-white/30">Guest checkout</p>
              <p className={country.commerceRule.allowGuestCheckout ? "text-emerald-400" : "text-amber-400"}>
                {country.commerceRule.allowGuestCheckout ? "Allowed" : "Requires account"}
              </p>
            </div>
          </div>
        </AdminSection>
      ) : (
        <div className="rounded-[14px] border border-amber-400/25 bg-amber-400/5 px-5 py-4">
          <p className="text-[11px] uppercase tracking-[0.2em] text-amber-400/70 mb-1">Sem commerce rule</p>
          <p className="text-sm text-amber-300/80">
            Este país não tem regra comercial configurada. O checkout não funcionará corretamente sem moeda, impostos e estimativa de entrega definidos.
          </p>
        </div>
      )}

      {/* Policy editor — client component */}
      <AdminSection title="Customer-facing policy" eyebrow="Stage 17 — editable">
        <CountryPolicyEditor
          countryCode={country.code}
          initialPolicy={country.policy}
          adminToken={token}
        />
      </AdminSection>
    </div>
  );
}
