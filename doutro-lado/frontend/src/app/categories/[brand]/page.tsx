import { notFound } from "next/navigation";
import { ProductCard } from "@/components/ProductCard";
import { GlassCard } from "@/components/ui/GlassCard";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { isBrand } from "@/lib/brand";
import { getProducts } from "@/lib/storefront";
import { ProductFilterSidebar } from "@/features/catalog/ProductFilterSidebar";

type PageProps = {
  params: Promise<{ brand: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function CategoryPage({ params, searchParams }: PageProps) {
  const { brand } = await params;
  if (!isBrand(brand)) notFound();

  const resolvedSearchParams = await searchParams;
  const category = typeof resolvedSearchParams.category === "string" ? resolvedSearchParams.category : undefined;
  const sort = typeof resolvedSearchParams.sort === "string" ? resolvedSearchParams.sort : undefined;

  const products = await getProducts({ brand, category, sort });

  const isModa = brand === "moda";
  const bgClass = isModa ? "bg-[rgb(12,12,12)]" : "bg-[#F8F6F2]";
  const textClass = isModa ? "text-white" : "text-[#17120d]";

  return (
    <main className={`min-h-screen px-6 py-10 ${bgClass}`}>
      <div className="mx-auto grid max-w-luxe gap-8 lg:grid-cols-[260px_1fr]">
        <div className="hidden lg:block relative">
          <ProductFilterSidebar brandMode={brand} />
        </div>
        
        {/* Mobile Filters (Simplified) */}
        <div className="lg:hidden">
           <GlassCard tone={isModa ? "dark" : "warm"} className="p-4 rounded-[16px]">
             <p className={`text-sm ${isModa ? "text-white/70" : "text-black/70"}`}>
               Filtros disponiveis via desktop (Phase 1)
             </p>
           </GlassCard>
        </div>

        <div className="space-y-8 min-h-[60vh]">
          <SectionHeading
            eyebrow={category ? `Buscando em ${category}` : "Colecao Completa"}
            title={isModa ? "Couro com identidade." : "Curadoria por textura."}
            description={isModa ? "Pecas premium limitadas." : "Materialidade e origem."}
            tone={isModa ? "dark" : "light"}
          />
          
          {products.length === 0 ? (
            <div className={`py-20 text-center ${isModa ? "text-white/50" : "text-black/50"}`}>
              Nenhum produto encontrado nesta combinacao de filtros.
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              {products.map((product) => <ProductCard key={product.id} product={product} brandMode={brand} />)}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
