import { createClient } from "@/lib/supabase/server";
import { fetchAdminCustomers } from "@/lib/admin-api";
import type { AdminCustomer } from "@/lib/admin-api";
import {
  AdminPageHeader,
  AdminSection,
  AdminTable,
  MetricCard,
  StatusBadge,
} from "@/features/admin/AdminComponents";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Usuários — D'OUTRO LADO Admin" };

export default async function AdminCustomersPage() {
  const supabase = await createClient();
  const { data: { session } } = await supabase.auth.getSession();
  const token = session?.access_token ?? process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";
  const customers = (await fetchAdminCustomers(token)) ?? [];

  const roleCount = (role: string) => customers.filter((c) => c.role === role).length;

  const columns = [
    { key: "fullName", label: "Nome" },
    { key: "role", label: "Perfil", render: (r: AdminCustomer) => <StatusBadge status={r.role} /> },
    { key: "preferredCurrency", label: "Moeda" },
    { key: "preferredLanguage", label: "Idioma" },
    {
      key: "isActive",
      label: "Status",
      render: (r: AdminCustomer) => <StatusBadge status={r.isActive ? "active" : "inactive"} />,
    },
    { key: "createdAt", label: "Desde", render: (r: AdminCustomer) => <span>{r.createdAt.split("T")[0]}</span> },
  ];

  return (
    <div className="space-y-10">
      <AdminPageHeader
        eyebrow="Gestão de usuários"
        title="Clientes e usuários."
        description="Todos os perfis registrados na plataforma. Wholesale, clientes e administradores."
      />

      <div className="grid gap-4 sm:grid-cols-4">
        <MetricCard label="Total" value={customers.length} />
        <MetricCard label="Clientes" value={roleCount("customer")} />
        <MetricCard label="Importadores" value={roleCount("wholesale")} highlight="gold" />
        <MetricCard label="Admins" value={roleCount("admin")} />
      </div>

      <AdminSection title="Todos os usuários" eyebrow={`${customers.length} registros`}>
        <AdminTable
          columns={columns}
          rows={customers as AdminCustomer[]}
          rowKey={(r) => r.id}
          emptyMessage="Nenhum usuário encontrado."
        />
      </AdminSection>
    </div>
  );
}
