import { notFound } from "next/navigation";
import { ProductCard } from "@/components/ProductCard";
import { GlassCard } from "@/components/ui/GlassCard";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { isBrand } from "@/lib/brand";
import { getProducts } from "@/lib/storefront";

export default async function CategoryPage({ params }: { params: Promise<{ brand: string }> }) {
  const { brand } = await params;
  if (!isBrand(brand)) notFound();
  const products = await getProducts(brand);

  return (
    <main className="px-6 py-10">
      <div className="mx-auto grid max-w-luxe gap-8 lg:grid-cols-[300px_1fr]">
        <GlassCard className="h-fit space-y-6">
          <div>
            <p className="text-[13px] uppercase tracking-[0.28em] text-white/42">Filtros refinados</p>
            <h1 className="mt-4 font-display text-[36px] tracking-[-0.5px] text-white">Curadoria por textura.</h1>
          </div>
          <div className="space-y-4 text-sm text-white/60">
            <div className="rounded-[18px] border border-white/10 bg-black/20 p-4">Faixa de preco premium</div>
            <div className="rounded-[18px] border border-white/10 bg-black/20 p-4">Materiais naturais e couro</div>
            <div className="rounded-[18px] border border-white/10 bg-black/20 p-4">Peso para logistica internacional</div>
          </div>
        </GlassCard>
        <div className="space-y-8">
          <SectionHeading
            eyebrow="Colecao"
            title="Uma vitrine limpa, modular e pronta para escalar com API real."
            description="Filtros, ranking editorial, recomendacao e descoberta premium preservados em qualquer viewport."
          />
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {products.map((product) => <ProductCard key={product.id} product={product} brandMode={brand} />)}
          </div>
        </div>
      </div>
    </main>
  );
}
