import { notFound } from "next/navigation";
import { isBrand, getBrandData } from "@/lib/brand";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { BrandCartView } from "@/features/catalog/BrandCartView";
import type { Metadata } from "next";

export async function generateMetadata({ params }: { params: Promise<{ brand: string }> }): Promise<Metadata> {
  const { brand } = await params;
  return { title: `Carrinho — D'OUTRO LADO` };
}

export default async function BrandCartPage({ params }: { params: Promise<{ brand: string }> }) {
  const { brand } = await params;
  if (!isBrand(brand)) notFound();

  const meta = getBrandData(brand);

  return (
    <main className="min-h-screen px-6 py-10 bg-[rgb(12,12,12)]">
      <div className="mx-auto max-w-luxe space-y-10">
        <SectionHeading
          eyebrow={`Carrinho / ${meta.themeLabel}`}
          title="Sua seleção."
          description="Itens selecionados. Frete calculado no proximo passo."
          tone="dark"
        />
        <BrandCartView brand={brand} />
      </div>
    </main>
  );
}
