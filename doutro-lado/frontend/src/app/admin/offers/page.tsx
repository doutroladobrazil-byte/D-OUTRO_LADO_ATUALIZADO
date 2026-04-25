import { AdminPageHeader } from "@/features/admin/AdminComponents";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Cupons & Ofertas — D'OUTRO LADO Admin" };

export default function AdminOffersPage() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <AdminPageHeader
        eyebrow="Comercial"
        title="Cupons & Ofertas"
        description="Módulo em preparação — gestão de cupons e ofertas de recuperação em breve."
      />
    </div>
  );
}
