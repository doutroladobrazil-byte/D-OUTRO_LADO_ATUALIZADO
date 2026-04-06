import { AdminModulePage } from "@/features/admin/AdminModulePage";

export default function AdminOrdersPage() {
  return (
    <AdminModulePage
      eyebrow="Pedidos"
      title="Status pago, enviado, entregue e pontos de excecao."
      description="Monitoramento de pedidos com linguagem premium e leitura rapida para operacao internacional."
      metrics={[
        { label: "Em processamento", value: "18" },
        { label: "Pagos", value: "132" },
        { label: "Em transporte", value: "41" },
        { label: "Excecoes", value: "4" }
      ]}
      rows={[
        { label: "DL-1001 • Amelia Foster", value: "processing" },
        { label: "DL-1002 • Maison Elan", value: "packing" },
        { label: "DL-1003 • Nora Finch", value: "created" }
      ]}
    />
  );
}
