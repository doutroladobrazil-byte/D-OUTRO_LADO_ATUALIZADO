import { AdminModulePage } from "@/features/admin/AdminModulePage";

export default function AdminContentPage() {
  return (
    <AdminModulePage
      eyebrow="Conteudo"
      title="Heroes, sliders, editoriais e campanhas premium."
      description="Governanca de conteudo para os dois sites com autonomia de marca e consistencia operacional."
      metrics={[
        { label: "Blocos ativos", value: "18" },
        { label: "Campanhas", value: "6" },
        { label: "Agendados", value: "4" },
        { label: "Revisoes", value: "2" }
      ]}
      rows={[
        { label: "hero-casa", value: "active" },
        { label: "slider-moda", value: "active" },
        { label: "gift-campaign", value: "scheduled" }
      ]}
    />
  );
}
