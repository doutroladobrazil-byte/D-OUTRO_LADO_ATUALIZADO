import { ProductCard } from "@/components/ProductCard";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { getProducts } from "@/lib/storefront";

export default async function SearchPage() {
  const products = await getProducts();

  return (
    <main className="px-6 py-10">
      <div className="mx-auto max-w-luxe space-y-8">
        <SectionHeading
          eyebrow="Busca premium"
          title="Sugestoes dinamicas, overlay fullscreen e descobertas com refinamento."
          description="O overlay global concentra a pesquisa principal. Esta tela funciona como backup editorial e pagina de resultado."
        />
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
          {products.map((product) => <ProductCard key={product.id} product={product} />)}
        </div>
      </div>
    </main>
  );
}
