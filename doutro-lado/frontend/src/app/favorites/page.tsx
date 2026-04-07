import { ProductCard } from "@/components/ProductCard";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { getProducts } from "@/lib/storefront";

export default async function FavoritesPage() {
  const products = await getProducts();

  return (
    <main className="px-6 py-10">
      <div className="mx-auto max-w-luxe space-y-8">
        <SectionHeading
          eyebrow="Favoritos"
          title="Intencao de compra, curadoria salva e retorno elegante ao checkout."
        />
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {products.slice(0, 3).map((product) => <ProductCard key={product.id} product={product} />)}
        </div>
      </div>
    </main>
  );
}
