import { notFound } from "next/navigation";
import { headers, cookies } from "next/headers";
import { isBrand } from "@/lib/brand";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { BrandCartView } from "@/features/catalog/BrandCartView";
import type { Metadata } from "next";
import { resolveLocale } from "@/lib/i18n/common";
import { getCartDictionary } from "@/lib/i18n/checkout";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  return { title: `Cart — D'OUTRO LADO` };
}

export default async function BrandCartPage({ params }: { params: Promise<{ brand: string }> }) {
  const [{ brand }, cookieStore, headerStore] = await Promise.all([
    params,
    cookies(),
    headers(),
  ]);
  if (!isBrand(brand)) notFound();

  const locale = resolveLocale(
    headerStore.get("accept-language"),
    cookieStore.get("dl_locale")?.value,
  );
  const dict = getCartDictionary(locale);

  return (
    <main className="min-h-screen px-4 py-8 bg-[rgb(12,12,12)] md:px-6 md:py-10">
      <div className="mx-auto max-w-luxe space-y-10">
        <SectionHeading
          eyebrow={dict.eyebrow}
          title={dict.title}
          description={dict.description}
          tone="dark"
        />
        <BrandCartView brand={brand} />
      </div>
    </main>
  );
}
