import { requireAdminToken } from "@/lib/admin-server-auth";
import { fetchApiData } from "@/lib/api";
import {
  AdminPageHeader,
  AdminSection,
  AdminTable,
  MetricCard,
  StatusBadge,
} from "@/features/admin/AdminComponents";
import type { FiscalStatusRecord } from "@/lib/types";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Fiscal — D'OUTRO LADO Admin" };

export default async function AdminFiscalPage() {
  const token = await requireAdminToken();

  const records = (await fetchApiData<FiscalStatusRecord[]>("/fiscal/status", {
    token,
    revalidate: 30,
  })) ?? [];

  const pending = records.filter((r) => r.status === "pending").length;
  const inReview = records.filter((r) => r.status === "in_review").length;
  const issued = records.filter((r) => r.status === "issued").length;
  const rejected = records.filter((r) => r.status === "rejected").length;

  const columns = [
    { key: "orderId", label: "Pedido" },
    { key: "status", label: "Status", render: (r: FiscalStatusRecord) => <StatusBadge status={r.status} /> },
    {
      key: "invoiceNumber",
      label: "Nota fiscal",
      render: (r: FiscalStatusRecord) => <span>{r.invoiceNumber ?? "—"}</span>,
    },
    {
      key: "accessKey",
      label: "Chave de acesso",
      render: (r: FiscalStatusRecord) => (
        <span className="font-mono text-[11px] text-white/45 truncate max-w-[200px] block">
          {r.accessKey ?? "—"}
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-10">
      <AdminPageHeader
        eyebrow="Controle fiscal"
        title="Fiscal e NF-e."
        description="Status fiscal de todos os pedidos. Evolução pendente → in_review → issued para compliance de exportação."
      />

      <div className="grid gap-4 sm:grid-cols-4">
        <MetricCard label="Pendentes" value={pending} highlight={pending > 0 ? "red" : "default"} />
        <MetricCard label="Em revisão" value={inReview} />
        <MetricCard label="Emitidas" value={issued} highlight="green" />
        <MetricCard label="Rejeitadas" value={rejected} highlight={rejected > 0 ? "red" : "default"} />
      </div>

      <AdminSection title="Registros fiscais" eyebrow={`${records.length} pedidos`}>
        <AdminTable
          columns={columns}
          rows={records as FiscalStatusRecord[]}
          rowKey={(r) => r.orderId}
          emptyMessage="Nenhum registro fiscal encontrado."
        />
      </AdminSection>
    </div>
  );
}
