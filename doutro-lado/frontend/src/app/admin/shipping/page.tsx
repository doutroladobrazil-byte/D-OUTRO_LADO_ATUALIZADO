import { AdminModulePage } from "@/features/admin/AdminModulePage";

export default function AdminShippingPage() {
  return (
    <AdminModulePage
      eyebrow="Logistica"
      title="Frete internacional por peso, regiao e composicao do carrinho."
      description="Interface pronta para tabelas reais, regras automatizadas e integracao com operadores logisticos."
      metrics={[
        { label: "Regioes", value: "3" },
        { label: "Faixas de peso", value: "6" },
        { label: "Quotes hoje", value: "184" },
        { label: "Ajustes", value: "2" }
      ]}
      rows={[
        { label: "North America • 1-3kg", value: "R$ 158,00" },
        { label: "Europe • 1-3kg", value: "R$ 169,00" },
        { label: "Middle East • 3-5kg", value: "R$ 248,00" }
      ]}
    />
  );
}
