import { notFound } from "next/navigation";
import { isBrand, getBrandData } from "@/lib/brand";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { BrandCheckoutView } from "@/features/catalog/BrandCheckoutView";
import type { Metadata } from "next";
import { Suspense } from "react";

export async function generateMetadata({ params }: { params: Promise<{ brand: string }> }): Promise<Metadata> {
  const { brand } = await params;
  return { title: `Checkout — D'OUTRO LADO` };
}

export default async function BrandCheckoutPage({ params }: { params: Promise<{ brand: string }> }) {
  const { brand } = await params;
  if (!isBrand(brand)) notFound();

  const meta = getBrandData(brand);

  return (
    <main className="min-h-screen px-6 py-10 bg-[rgb(12,12,12)]">
      <div className="mx-auto max-w-luxe space-y-10">
        <SectionHeading
          eyebrow={`Checkout / ${meta.themeLabel}`}
          title="Finalizar pedido."
          description="Selecione a região de entrega. O frete é calculado por faixa de peso e incluído na sessão de pagamento Stripe."
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
