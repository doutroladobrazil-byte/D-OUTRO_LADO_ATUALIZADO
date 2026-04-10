import { notFound } from "next/navigation";
import { isBrand } from "@/lib/brand";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { BrandCheckoutView } from "@/features/catalog/BrandCheckoutView";
import type { Metadata } from "next";
import { Suspense } from "react";

export async function generateMetadata(): Promise<Metadata> {
  return { title: `Checkout — D'OUTRO LADO` };
}

export default async function BrandCheckoutPage({ params }: { params: Promise<{ brand: string }> }) {
  const { brand } = await params;
  if (!isBrand(brand)) notFound();

  return (
    <main className="min-h-screen px-6 py-10 bg-[rgb(12,12,12)]">
      <div className="mx-auto max-w-luxe space-y-10">
        <SectionHeading
          eyebrow="Checkout / Moda"
          title="Finalizar pedido."
          description="Selecione a regiao de entrega. O frete e calculado por faixa de peso e incluido na sessao de pagamento Stripe."
          tone="dark"
        />
        {/* Suspense required because BrandCheckoutView reads useSearchParams */}
        <Suspense fallback={<div className="h-40 animate-pulse rounded-[24px] bg-white/5" />}>
          <BrandCheckoutView brand={brand} />
        </Suspense>
      </div>
    </main>
  );
}
