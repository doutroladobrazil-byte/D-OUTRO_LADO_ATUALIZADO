import { notFound, redirect } from "next/navigation";
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

  // Redireciona casa para moda
  if (brand === "casa") redirect("/categories/moda");

  const resolvedSearchParams = await searchParams;
  const category = typeof resolvedSearchParams.category === "string" ? resolvedSearchParams.category : undefined;
  const sort = typeof resolvedSearchParams.sort === "string" ? resolvedSearchParams.sort : undefined;
  const countryCode = typeof resolvedSearchParams.cc === "string" ? resolvedSearchParams.cc.toUpperCase() : undefined;

  const products = await getProducts({ brand: "moda", category, sort, countryCode });

  return (
    <main className="min-h-screen px-6 py-10 bg-[rgb(12,12,12)]">
      <div className="mx-auto grid max-w-luxe gap-8 lg:grid-cols-[260px_1fr]">
        <div className="hidden lg:block relative">
          <ProductFilterSidebar brandMode="moda" />
        </div>

        {/* Mobile Filters (Simplified) */}
        <div className="lg:hidden">
          <GlassCard tone="dark" className="p-4 rounded-[16px]">
            <p className="text-sm text-white/70">
              Filtros disponiveis via desktop
            </p>
          </GlassCard>
        </div>

        <div className="space-y-8 min-h-[60vh]">
          <SectionHeading
            eyebrow={category ? `Buscando em ${category}` : "Colecao Completa"}
            title="Couro e acessorios com identidade."
            description="Pecas premium com materialidade de referencia e origem brasileira."
            tone="dark"
          />

          {products.length === 0 ? (
            <div className="py-20 text-center text-white/50">
              Nenhum produto encontrado nesta combinacao de filtros.
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              {products.map((product) => <ProductCard key={product.id} product={product} brandMode="moda" />)}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
