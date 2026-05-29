import { requireAdminToken } from "@/lib/admin-server-auth";
import { createServiceClient } from "@/lib/supabase/service";
import { AdminPageHeader, AdminSection, MetricCard } from "@/features/admin/AdminComponents";
import { LeadsClientActions } from "./LeadsClientActions";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Leads — D'OUTRO LADO Admin" };
export const dynamic = "force-dynamic";

type Lead = {
  id: string;
  email: string;
  region: string | null;
  interests: string[] | null;
  locale: string | null;
  source: string | null;
  utm_source: string | null;
  utm_medium: string | null;
  utm_campaign: string | null;
  created_at: string;
};

type PageProps = {
  searchParams?: Promise<Record<string, string | undefined>>;
};

export default async function AdminLeadsPage({ searchParams }: PageProps) {
  await requireAdminToken();

  const resolved = searchParams ? await searchParams : {};
  const filterRegion = resolved.region ?? "";
  const filterLocale = resolved.locale ?? "";
  const filterInterest = resolved.interest ?? "";
  const filterEmail = resolved.email ?? "";

  const supabase = createServiceClient();

  let query = supabase
    .from("leads")
    .select("id, email, region, interests, locale, source, utm_source, utm_medium, utm_campaign, created_at")
    .order("created_at", { ascending: false })
    .limit(500);

  if (filterRegion) query = query.eq("region", filterRegion);
  if (filterLocale) query = query.eq("locale", filterLocale);
  if (filterEmail) query = query.ilike("email", `%${filterEmail}%`);

  const { data: leads, error } = await query;

  const rows: Lead[] = (leads ?? []) as Lead[];

  // Filter by interest client-side (array contains)
  const filtered = filterInterest
    ? rows.filter((r) => r.interests?.includes(filterInterest))
    : rows;

  // Metrics
  const totalCount = filtered.length;
  const regionCounts: Record<string, number> = {};
  const localeCounts: Record<string, number> = {};
  for (const lead of filtered) {
    const r = lead.region ?? "—";
    const l = lead.locale ?? "en";
    regionCounts[r] = (regionCounts[r] ?? 0) + 1;
    localeCounts[l] = (localeCounts[l] ?? 0) + 1;
  }
  const topRegion = Object.entries(regionCounts).sort((a, b) => b[1] - a[1])[0]?.[0] ?? "—";
  const uniqueLocales = Object.keys(localeCounts).join(", ") || "—";

  // Unique region options for filter
  const allRegions = Array.from(new Set(rows.map((r) => r.region).filter(Boolean))) as string[];
  const allLocales = Array.from(new Set(rows.map((r) => r.locale).filter(Boolean))) as string[];
  const allInterests = Array.from(
    new Set(rows.flatMap((r) => r.interests ?? []))
  );

  return (
    <div className="space-y-10">
      <AdminPageHeader
        eyebrow="Comercial"
        title="Leads."
        description="Lista privada — visitantes que se inscreveram para receber drops e disponibilidade."
      />

      {error && (
        <div className="rounded-[16px] border border-red-500/25 bg-red-500/8 px-5 py-4 text-sm text-red-400">
          Erro ao carregar leads: {error.message}
        </div>
      )}

      {/* Metrics */}
      <AdminSection title="Resumo" eyebrow="Leads capturados">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <MetricCard label="Total de leads" value={totalCount} highlight="gold" />
          <MetricCard label="Principal região" value={topRegion} />
          <MetricCard label="Locales ativos" value={uniqueLocales} />
          <MetricCard label="Com UTM source" value={filtered.filter((r) => r.utm_source).length} />
        </div>
      </AdminSection>

      {/* Filters */}
      <AdminSection title="Filtros" eyebrow="Refinar lista">
        <form method="GET" className="flex flex-wrap gap-3 items-end">
          <div className="flex flex-col gap-1">
            <label className="text-[11px] uppercase tracking-widest text-white/35">Email</label>
            <input
              name="email"
              defaultValue={filterEmail}
              placeholder="buscar@email.com"
              className="rounded-[10px] border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-white/20 focus:border-gold/40 focus:outline-none"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-[11px] uppercase tracking-widest text-white/35">Região</label>
            <select
              name="region"
              defaultValue={filterRegion}
              className="rounded-[10px] border border-white/10 bg-[#0e0e0e] px-3 py-2 text-sm text-white focus:border-gold/40 focus:outline-none"
            >
              <option value="">Todas</option>
              {allRegions.map((r) => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-[11px] uppercase tracking-widest text-white/35">Locale</label>
            <select
              name="locale"
              defaultValue={filterLocale}
              className="rounded-[10px] border border-white/10 bg-[#0e0e0e] px-3 py-2 text-sm text-white focus:border-gold/40 focus:outline-none"
            >
              <option value="">Todos</option>
              {allLocales.map((l) => (
                <option key={l} value={l}>{l}</option>
              ))}
            </select>
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-[11px] uppercase tracking-widest text-white/35">Interesse</label>
            <select
              name="interest"
              defaultValue={filterInterest}
              className="rounded-[10px] border border-white/10 bg-[#0e0e0e] px-3 py-2 text-sm text-white focus:border-gold/40 focus:outline-none"
            >
              <option value="">Todos</option>
              {allInterests.map((i) => (
                <option key={i} value={i}>{i}</option>
              ))}
            </select>
          </div>
          <button
            type="submit"
            className="rounded-[10px] border border-gold/30 bg-gold/8 px-4 py-2 text-sm text-gold transition hover:bg-gold/15"
          >
            Filtrar
          </button>
          <a
            href="/admin/leads"
            className="rounded-[10px] border border-white/10 px-4 py-2 text-sm text-white/40 transition hover:text-white"
          >
            Limpar
          </a>
        </form>
      </AdminSection>

      {/* Table + CSV export */}
      <AdminSection title={`${filtered.length} leads`} eyebrow="Resultados" action={<LeadsClientActions leads={filtered} />}>
        {filtered.length === 0 ? (
          <div className="rounded-[22px] border border-dashed border-white/10 py-16 text-center text-sm text-white/30">
            Nenhum lead encontrado com os filtros aplicados.
          </div>
        ) : (
          <div className="overflow-x-auto rounded-[22px] border border-white/8">
            <table className="w-full text-sm">
              <thead className="border-b border-white/8 bg-white/[0.03]">
                <tr>
                  <th className="px-4 py-3 text-left text-[11px] uppercase tracking-widest text-white/35">Email</th>
                  <th className="px-4 py-3 text-left text-[11px] uppercase tracking-widest text-white/35">Região</th>
                  <th className="px-4 py-3 text-left text-[11px] uppercase tracking-widest text-white/35">Interesses</th>
                  <th className="px-4 py-3 text-left text-[11px] uppercase tracking-widest text-white/35">Locale</th>
                  <th className="px-4 py-3 text-left text-[11px] uppercase tracking-widest text-white/35">UTM Source</th>
                  <th className="px-4 py-3 text-left text-[11px] uppercase tracking-widest text-white/35">UTM Campaign</th>
                  <th className="px-4 py-3 text-left text-[11px] uppercase tracking-widest text-white/35">Data</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filtered.map((lead) => (
                  <tr key={lead.id} className="transition hover:bg-white/[0.02]">
                    <td className="px-4 py-3 font-mono text-[12px] text-white/80">{lead.email}</td>
                    <td className="px-4 py-3 text-white/55">{lead.region ?? "—"}</td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-1">
                        {(lead.interests ?? []).map((i) => (
                          <span key={i} className="rounded-full border border-gold/20 bg-gold/5 px-2 py-0.5 text-[10px] text-gold/70">
                            {i}
                          </span>
                        ))}
                        {(!lead.interests || lead.interests.length === 0) && (
                          <span className="text-white/25">—</span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-white/45">{lead.locale ?? "—"}</td>
                    <td className="px-4 py-3 text-white/45">{lead.utm_source ?? "—"}</td>
                    <td className="px-4 py-3 text-white/45">{lead.utm_campaign ?? "—"}</td>
                    <td className="px-4 py-3 text-white/35 text-[12px]">
                      {new Date(lead.created_at).toLocaleDateString("pt-BR", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </AdminSection>
    </div>
  );
}
