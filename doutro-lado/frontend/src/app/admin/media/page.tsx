import { AdminPageHeader } from "@/features/admin/AdminComponents";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Biblioteca de Mídia — D'OUTRO LADO Admin" };

export default function AdminMediaPage() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <AdminPageHeader
        eyebrow="Conteúdo"
        title="Biblioteca de Mídia"
        description="Módulo em preparação — gestão centralizada de arquivos e imagens em breve."
      />
    </div>
  );
}
