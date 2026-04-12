import { createClient } from "@/lib/supabase/server";
import { fetchApiData } from "@/lib/api";
import {
  AdminPageHeader,
  AdminSection,
  AdminTable,
  BrandChip,
  MetricCard,
  StatusBadge,
} from "@/features/admin/AdminComponents";
import type { ContentBlockRecord } from "@/lib/types";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Conteúdo — D'OUTRO LADO Admin" };

export default async function AdminContentPage() {
  const supabase = await createClient();
  const { data: { session } } = await supabase.auth.getSession();
  const token = session?.access_token ?? process.env.SUPABASE_SERVICE_ROLE_KEY;

  const blocks = (await fetchApiData<ContentBlockRecord[]>("/content", {
    token,
    revalidate: 60,
  })) ?? [];

  const banners = blocks.filter((b) => b.type === "hero");
  const sliders = blocks.filter((b) => b.type === "slider");
  const active = blocks.filter((b) => b.active).length;

  const columns = [
    { key: "type", label: "Tipo" },
    { key: "brand", label: "Brand", render: (r: ContentBlockRecord) => <BrandChip brand={r.brand} /> },
    {
      key: "active",
      label: "Ativo",
      render: (r: ContentBlockRecord) => <StatusBadge status={r.active ? "active" : "inactive"} />,
    },
    { key: "id", label: "ID", render: (r: ContentBlockRecord) => <span className="font-mono text-[11px] text-white/40">{r.id}</span> },
  ];

  return (
    <div className="space-y-10">
      <AdminPageHeader
        eyebrow="Gestão de conteúdo"
        title="Banners e sliders."
        description="Blocos de conteúdo editorial cadastrados para Casa e Moda. Gerenciados pela equipe criativa."
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <MetricCard label="Banners (Hero)" value={banners.length} />
        <MetricCard label="Sliders" value={sliders.length} />
        <MetricCard label="Ativos" value={active} highlight="green" />
      </div>

      <AdminSection title="Blocos de conteúdo" eyebrow={`${blocks.length} registros`}>
        <AdminTable
          columns={columns}
          rows={blocks as ContentBlockRecord[]}
          rowKey={(r) => r.id}
          emptyMessage="Nenhum bloco de conteúdo encontrado."
        />
      </AdminSection>
    </div>
  );
}
