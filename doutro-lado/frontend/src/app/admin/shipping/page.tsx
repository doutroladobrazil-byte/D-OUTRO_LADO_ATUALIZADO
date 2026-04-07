import { createClient } from "@/lib/supabase/server";
import { fetchApiData } from "@/lib/api";
import {
  AdminPageHeader,
  AdminSection,
  AdminTable,
  MetricCard,
} from "@/features/admin/AdminComponents";
import type { FreightRate } from "@/lib/types";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Logística — D'OUTRO LADO Admin" };

export default async function AdminShippingPage() {
  const supabase = await createClient();
  const { data: { session } } = await supabase.auth.getSession();

  const rates = (await fetchApiData<FreightRate[]>("/freight/rates", {
    token: session?.access_token,
    revalidate: 60,
  })) ?? [];

  const regions = [...new Set(rates.map((r) => r.region))];

  const columns = [
    { key: "region", label: "Região" },
    { key: "weightRange", label: "Faixa de peso" },
    {
      key: "amountBRL",
      label: "Valor (BRL)",
      align: "right" as const,
      render: (r: FreightRate) => <span className="font-medium text-white">R$ {r.amountBRL.toFixed(2)}</span>,
    },
  ];

  return (
    <div className="space-y-10">
      <AdminPageHeader
        eyebrow="Gestão logística"
        title="Frete e rotas."
        description="Tabela de fretes por região e faixa de peso. Gerada a partir do módulo freight (Stage 3)."
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <MetricCard label="Regiões" value={regions.length} />
        <MetricCard label="Faixas de peso" value={[...new Set(rates.map((r) => r.weightRange))].length} />
        <MetricCard label="Combinações" value={rates.length} />
      </div>

      <AdminSection title="Tabela de fretes" eyebrow="Dados reais">
        <AdminTable
          columns={columns}
          rows={rates as FreightRate[]}
          rowKey={(r) => `${r.region}-${r.weightRange}`}
          emptyMessage="Nenhuma tabela de frete encontrada."
        />
      </AdminSection>
    </div>
  );
}
