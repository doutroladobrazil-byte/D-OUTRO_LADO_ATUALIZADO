import { AdminPageHeader } from "@/features/admin/AdminComponents";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Campanhas — D'OUTRO LADO Admin" };

export default function AdminCampaignsPage() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <AdminPageHeader
        eyebrow="Conteúdo"
        title="Campanhas"
        description="Módulo em preparação — criação e gestão de campanhas de marketing em breve."
      />
    </div>
  );
}
