import { GlassCard } from "@/components/ui/GlassCard";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { getFreightRates } from "@/lib/storefront";
import { formatBRL } from "@/lib/i18n";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "International Shipping — D'OUTRO LADO",
  description: "Premium express international shipping to North America, Europe and the Middle East. Transparent, weight-based freight rates.",
};

export default async function InternationalShippingPage() {
  const rates = await getFreightRates();

  return (
    <main className="px-6 py-10">
      <div className="mx-auto max-w-luxe space-y-10">
        <SectionHeading
          eyebrow="Premium logistics"
          title="International express shipping."
          description="Weight-based freight rates — transparent at product level, confirmed at Stripe checkout. Built for scale."
        />
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {rates.map((rate) => (
            <GlassCard key={`${rate.region}-${rate.weightRange}`}>
              <p className="text-[13px] uppercase tracking-[0.22em] text-white/42">{rate.region}</p>
              <h3 className="mt-4 font-display text-[28px] tracking-[-0.5px] text-white">{rate.weightRange}</h3>
              <p className="mt-4 text-lg text-gold">{formatBRL(rate.amountBRL)}</p>
              <p className="mt-1 text-[11px] text-white/35">Base price in BRL — converted at checkout display</p>
            </GlassCard>
          ))}
        </div>

        {/* i18n note */}
        <div className="rounded-[22px] border border-white/8 bg-white/[0.02] px-6 py-5 text-sm text-white/45">
          <p className="font-medium text-white/65">Currency note</p>
          <p className="mt-2 leading-7">
            All prices are stored and calculated in Brazilian Reais (BRL).
            Display currencies (USD, EUR, AED) are shown as indicative conversions.
            The final charge is processed by Stripe in the currency configured at checkout.
          </p>
        </div>
      </div>
    </main>
  );
}
