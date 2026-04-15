import Link from "next/link";
import { requireAdminToken } from "@/lib/admin-server-auth";
import { fetchApiData } from "@/lib/api";
import {
  AdminPageHeader,
  AdminSection,
  AdminTable,
  MetricCard,
  StatusBadge,
} from "@/features/admin/AdminComponents";
import type { SupportedCountry } from "@/lib/types";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Países — D'OUTRO LADO Admin" };

const COUNTRY_FLAGS: Record<string, string> = {
  US: "🇺🇸",
  CH: "🇨🇭",
  IE: "🇮🇪",
  DE: "🇩🇪",
  IS: "🇮🇸",
  SG: "🇸🇬",
};

export default async function AdminCountriesPage() {
  const token = await requireAdminToken();

  const countries = (await fetchApiData<SupportedCountry[]>("/countries", {
    token,
    revalidate: 60,
  })) ?? [];

  const active = countries.filter((c) => c.isActive).length;
  const checkoutEnabled = countries.filter((c) => c.checkoutEnabled).length;
  const regions = [...new Set(countries.map((c) => c.regionGroup))];

  const columns = [
    {
      key: "code",
      label: "País",
      render: (r: SupportedCountry) => (
        <span className="flex items-center gap-2">
          <span className="text-base" aria-hidden>{COUNTRY_FLAGS[r.code] ?? "🌐"}</span>
          <span className="font-medium text-white">{r.name}</span>
          <span className="font-mono text-[11px] text-white/35">{r.code}</span>
        </span>
      ),
    },
    { key: "regionGroup", label: "Região" },
    {
      key: "defaultCurrency",
      label: "Moeda",
      render: (r: SupportedCountry) => (
        <span className="font-mono text-[12px] text-[#C6A96B]">{r.defaultCurrency}</span>
      ),
    },
    {
      key: "checkoutEnabled",
      label: "Checkout",
      render: (r: SupportedCountry) => (
        <StatusBadge status={r.checkoutEnabled ? "active" : "inactive"} />
      ),
    },
    {
      key: "isActive",
      label: "Status",
      render: (r: SupportedCountry) => (
        <StatusBadge status={r.isActive ? "active" : "inactive"} />
      ),
    },
    {
      key: "actions",
      label: "",
      render: (r: SupportedCountry) => (
        <Link
          href={`/admin/countries/${r.code.toLowerCase()}`}
          className="text-[11px] uppercase tracking-[0.15em] text-white/40 hover:text-[#C6A96B] transition"
        >
          Edit policy →
        </Link>
      ),
    },
  ];

  return (
    <div className="space-y-10">
      <AdminPageHeader
        eyebrow="Internacionalização"
        title="Países do MVP."
        description="Os 6 países habilitados para exportação: CH, IE, DE, IS, SG, US. Cada país tem regras próprias de frete, impostos e moeda."
      />

      <div className="grid gap-4 sm:grid-cols-4">
        <MetricCard label="Total" value={countries.length} />
        <MetricCard label="Ativos" value={active} highlight="green" />
        <MetricCard label="Com checkout" value={checkoutEnabled} highlight="green" />
        <MetricCard label="Regiões" value={regions.length} />
      </div>

      <AdminSection title="Configuração por país" eyebrow={`${countries.length} países`}>
        <AdminTable
          columns={columns}
          rows={countries as SupportedCountry[]}
          rowKey={(r) => r.code}
          emptyMessage="Nenhum país configurado. Execute a migração Stage 12."
        />
      </AdminSection>
    </div>
  );
}
