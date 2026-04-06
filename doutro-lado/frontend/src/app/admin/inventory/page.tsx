import { AdminModulePage } from "@/features/admin/AdminModulePage";

export default function AdminInventoryPage() {
  return (
    <AdminModulePage
      eyebrow="Estoque"
      title="Disponibilidade por SKU com visibilidade operacional."
      description="Controle premium para estoque de casa, moda e kits com alertas suaves e leitura executiva."
      metrics={[
        { label: "SKUs criticos", value: "12" },
        { label: "Reposicao", value: "21" },
        { label: "Cobertura", value: "38 dias" },
        { label: "Reservados", value: "17" }
      ]}
      rows={[
        { label: "CASA-001", value: "24 unidades" },
        { label: "MODA-001", value: "12 unidades" },
        { label: "MODA-002", value: "55 unidades" }
      ]}
    />
  );
}
