import { AdminModulePage } from "@/features/admin/AdminModulePage";

export default function AdminSettingsPage() {
  return (
    <AdminModulePage
      eyebrow="Configuracoes"
      title="Preferencias globais, moedas, idiomas e providers."
      description="Painel de controle para auth, Stripe, temas, conteudo global e configuracoes operacionais."
      metrics={[
        { label: "Moedas", value: "4" },
        { label: "Idiomas", value: "3" },
        { label: "Providers", value: "5" },
        { label: "Admins", value: "5" }
      ]}
      rows={[
        { label: "Supabase Auth", value: "ready" },
        { label: "Stripe checkout", value: "ready" },
        { label: "Storage assets", value: "pending setup" }
      ]}
    />
  );
}
