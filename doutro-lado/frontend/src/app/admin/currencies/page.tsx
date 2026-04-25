import { AdminPageHeader } from "@/features/admin/AdminComponents";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Moedas & Câmbio — D'OUTRO LADO Admin" };

export default function AdminCurrenciesPage() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <AdminPageHeader
        eyebrow="Internacional"
        title="Moedas & Câmbio"
        description="Módulo em preparação — gestão de taxas de câmbio e moedas suportadas em breve."
      />
    </div>
  );
}
