import { AdminPageHeader } from "@/features/admin/AdminComponents";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Leads — D'OUTRO LADO Admin" };

export default function AdminLeadsPage() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <AdminPageHeader
        eyebrow="Comercial"
        title="Leads"
        description="Módulo em preparação — captura e gestão de leads em breve."
      />
    </div>
  );
}
