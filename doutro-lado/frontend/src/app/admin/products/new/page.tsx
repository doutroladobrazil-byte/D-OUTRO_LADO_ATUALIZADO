import type { Metadata } from "next";
import { AdminPageHeader } from "@/features/admin/AdminComponents";
import { ProductForm } from "@/features/admin/ProductForm";

export const metadata: Metadata = { title: "Novo Produto — D'OUTRO LADO Admin" };

export default function NewProductPage() {
  return (
    <div className="space-y-8">
      <AdminPageHeader
        eyebrow="Catálogo / Novo produto"
        title="Cadastrar produto."
        description="Preencha os campos abaixo. Após criar o produto, você poderá adicionar imagens na tela de edição."
      />
      <div className="max-w-4xl">
        <ProductForm mode="create" />
      </div>
    </div>
  );
}
