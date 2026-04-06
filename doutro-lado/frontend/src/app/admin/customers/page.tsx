import { AdminModulePage } from "@/features/admin/AdminModulePage";

export default function AdminCustomersPage() {
  return (
    <AdminModulePage
      eyebrow="Usuarios"
      title="Clientes, importadores e administradores."
      description="Segmentacao elegante por perfil, wholesale access, recorrencia e valor de ciclo."
      metrics={[
        { label: "Clientes", value: "4.281" },
        { label: "Importadores", value: "62" },
        { label: "Admins", value: "5" },
        { label: "Novos", value: "48" }
      ]}
      rows={[
        { label: "Amelia Foster", value: "customer" },
        { label: "Maison Elan", value: "wholesale" },
        { label: "Admin Root", value: "admin" }
      ]}
    />
  );
}
