import { notFound } from "next/navigation";
import { isBrand } from "@/lib/brand";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { BrandCartView } from "@/features/catalog/BrandCartView";
import type { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
  return { title: `Carrinho — D'OUTRO LADO` };
}

export default async function BrandCartPage({ params }: { params: Promise<{ brand: string }> }) {
  const { brand } = await params;
  if (!isBrand(brand)) notFound();

  return (
    <main className="min-h-screen px-4 py-8 bg-[rgb(12,12,12)] md:px-6 md:py-10">
      <div className="mx-auto max-w-luxe space-y-10">
        <SectionHeading
          eyebrow="Carrinho / Moda"
          title="Sua selecao."
          description="Itens selecionados. Frete calculado no proximo passo."
          tone="dark"
        />
        <BrandCartView brand={brand} />
      </div>
    </main>
  );
}
