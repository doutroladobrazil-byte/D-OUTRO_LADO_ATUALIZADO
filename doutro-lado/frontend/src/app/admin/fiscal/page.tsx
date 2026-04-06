import { AdminModulePage } from "@/features/admin/AdminModulePage";

export default function AdminFiscalPage() {
  return (
    <AdminModulePage
      eyebrow="Fiscal"
      title="Estrutura pronta para NFe, invoice e auditoria."
      description="Camada fiscal desenhada desde a origem do pedido para reduzir retrabalho de compliance."
      metrics={[
        { label: "Pendentes", value: "8" },
        { label: "Em revisao", value: "3" },
        { label: "Emitidas", value: "121" },
        { label: "Alertas", value: "2" }
      ]}
      rows={[
        { label: "DL-1001", value: "pending" },
        { label: "DL-1002", value: "in_review" },
        { label: "DL-0998", value: "issued" }
      ]}
    />
  );
}
