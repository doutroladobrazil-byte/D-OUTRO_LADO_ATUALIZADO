import { AdminModulePage } from "@/features/admin/AdminModulePage";

export default function AdminAnalyticsPage() {
  return (
    <AdminModulePage
      eyebrow="Analytics"
      title="Performance premium com leitura limpa de crescimento."
      description="Preparado para eventos, cohorts, recomendacao, conversao por marca e comportamento do usuario."
      metrics={[
        { label: "Conversao", value: "3.8%" },
        { label: "AOV", value: "R$ 388" },
        { label: "Retencao", value: "41%" },
        { label: "ROAS", value: "5.4x" }
      ]}
      rows={[
        { label: "Casa • editorial hero", value: "CTR 4.2%" },
        { label: "Moda • leather drop", value: "CTR 5.1%" },
        { label: "Gift builder", value: "Uso 18%" }
      ]}
    />
  );
}
