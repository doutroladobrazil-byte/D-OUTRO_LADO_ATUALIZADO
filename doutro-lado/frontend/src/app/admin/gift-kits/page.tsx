import { AdminPageHeader } from "@/features/admin/AdminComponents";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Gift Kits — D'OUTRO LADO Admin" };

export default function AdminGiftKitsPage() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <AdminPageHeader
        eyebrow="Catálogo"
        title="Gift Kits"
        description="Módulo em preparação — gestão de kits presente e gift builder em breve."
      />
    </div>
  );
}
