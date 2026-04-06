import { AdminModulePage } from "@/features/admin/AdminModulePage";

export default function AdminProductsPage() {
  return (
    <AdminModulePage
      eyebrow="Catalogo"
      title="Produtos, imagens, preco varejo e atacado."
      description="CRUD premium com foco em imagem, peso logistico, narrativa curta, estoque e governanca comercial."
      metrics={[
        { label: "SKUs ativos", value: "248" },
        { label: "Em destaque", value: "34" },
        { label: "Sem estoque", value: "6" },
        { label: "Pendentes", value: "11" }
      ]}
      rows={[
        { label: "Colecao Terracota Atelier", value: "Ativo • Casa" },
        { label: "Bolsa Atelier Noir", value: "Ativo • Moda" },
        { label: "Cinto Signature Bronze", value: "Revisao de preco" }
      ]}
    />
  );
}
