import { GiftBuilderStudio } from "@/features/gift-builder/GiftBuilderStudio";
import { GlassCard } from "@/components/ui/GlassCard";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { getProducts } from "@/lib/storefront";

export default async function GiftBuilderPage() {
  const products = await getProducts();

  return (
    <main className="px-6 py-10">
      <div className="mx-auto max-w-luxe space-y-10">
        <GlassCard className="grid gap-6 lg:grid-cols-[1fr_0.85fr]">
          <div>
            <SectionHeading
              eyebrow="Gift builder"
              title="Monte kits premium com drag-and-drop e preview imediato."
              description="Uma experiencia simples, refinada e preparada para composicoes corporativas, presentes premium e checkout internacional."
            />
          </div>
          <div className="rounded-[24px] border border-white/10 bg-[radial-gradient(circle_at_top,rgba(198,169,107,0.18),transparent_34%),linear-gradient(135deg,rgba(255,255,255,0.08),rgba(0,0,0,0.8))]" />
        </GlassCard>
        <GiftBuilderStudio products={products} />
      </div>
    </main>
  );
}
