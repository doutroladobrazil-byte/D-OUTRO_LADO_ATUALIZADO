import { AdminPageHeader } from "@/features/admin/AdminComponents";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Categorias — D'OUTRO LADO Admin" };

export default function AdminCategoriesPage() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <AdminPageHeader
        eyebrow="Catálogo"
        title="Categorias & Coleções"
        description="Módulo em preparação — organização de categorias e coleções em breve."
      />
    </div>
  );
}
