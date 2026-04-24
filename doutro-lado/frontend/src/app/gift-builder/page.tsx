import type { Metadata } from "next";
import { headers, cookies } from "next/headers";
import { GiftBuilderStudio } from "@/features/gift-builder/GiftBuilderStudio";
import { GlassCard } from "@/components/ui/GlassCard";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { getPackagingOptions, getProducts } from "@/lib/storefront";
import { createClient } from "@/lib/supabase/server";
import { resolveLocale } from "@/lib/i18n/common";
import { getGiftBuilderDictionary } from "@/lib/i18n/checkout";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const [cookieStore, headerStore] = await Promise.all([cookies(), headers()]);
  const locale = resolveLocale(
    headerStore.get("accept-language"),
    cookieStore.get("dl_locale")?.value,
  );
  const dict = getGiftBuilderDictionary(locale);
  return { title: dict.metaTitle, description: dict.metaDescription };
}

export default async function GiftBuilderPage() {
  const [cookieStore, headerStore] = await Promise.all([cookies(), headers()]);
  const locale = resolveLocale(
    headerStore.get("accept-language"),
    cookieStore.get("dl_locale")?.value,
  );
  const dict = getGiftBuilderDictionary(locale);

  // Resolve the Supabase session server-side so GiftBuilderStudio receives the
  // access token directly via prop — avoids a client-side auth roundtrip on
  // every save attempt and keeps the component simpler.
  const supabase = await createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  const [products, packagingOptions] = await Promise.all([
    getProducts(),
    getPackagingOptions(),
  ]);

  return (
    <main className="min-h-screen px-6 py-10">
      <div className="mx-auto max-w-luxe space-y-10">
        {/* Hero section */}
        <GlassCard className="relative overflow-hidden p-0">
          <div className="grid min-h-[260px] gap-0 md:grid-cols-[1fr_0.6fr]">
            <div className="flex flex-col justify-between p-8 md:p-12">
              <SectionHeading
                eyebrow={dict.eyebrow}
                title={dict.title}
                description={dict.description}
              />
            </div>
            {/* CREATIVE SLOT: gift editorial image */}
            <div className="hidden bg-[radial-gradient(circle_at_center,rgba(198,169,107,0.2),transparent_55%),linear-gradient(160deg,rgba(198,169,107,0.08),rgba(0,0,0,0.85))] md:block" />
          </div>
        </GlassCard>

        {/* Builder studio — kit composition */}
        {/* token is null for guests; authenticated users receive the access token */}
        <GiftBuilderStudio
          products={products}
          packagingOptions={packagingOptions}
          token={session?.access_token ?? null}
        />
      </div>
    </main>
  );
}
