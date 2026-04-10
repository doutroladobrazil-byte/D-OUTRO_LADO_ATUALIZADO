import { ProductCard } from "@/components/ProductCard";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { getProducts } from "@/lib/storefront";

type PageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function SearchPage({ searchParams }: PageProps) {
  const resolvedSearchParams = await searchParams;
  const q = typeof resolvedSearchParams.q === "string" ? resolvedSearchParams.q : undefined;

  const products = await getProducts({ brand: "moda", search: q });

  return (
    <main className="min-h-screen px-6 py-10">
      <div className="mx-auto max-w-luxe space-y-8">
        <SectionHeading
          eyebrow={q ? `Resultados para "${q}"` : "Busca premium"}
          title={q ? `${products.length} itens encontrados` : "Explore nosso acervo completo."}
          description="O overlay global concentra a pesquisa principal. Esta tela funciona como backup editorial e pagina de resultado."
        />
        
        {products.length === 0 ? (
          <div className="py-20 text-center text-black/50">
            Nenhum produto encontrado. Tente buscar por categorias como "Bolsas", "Cintos" ou "Couro".
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
            {products.map((product) => <ProductCard key={product.id} product={product} />)}
          </div>
        )}
      </div>
    </main>
  );
}
