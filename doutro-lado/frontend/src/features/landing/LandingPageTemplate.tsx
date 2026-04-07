import Image from "next/image";
import { GlassCard } from "@/components/ui/GlassCard";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { ButtonLink } from "@/components/ui/Button";
import { buildTrackedHref, formatTrackingSummary, type TrackingParams } from "@/lib/utm";
import type { LandingContent } from "./landing-content";

export function LandingPageTemplate({
  content,
  tracking
}: {
  content: LandingContent;
  tracking: TrackingParams;
}) {
  return (
    <main className="px-6 py-10">
      <div className="mx-auto max-w-luxe space-y-12">
        <GlassCard className="relative overflow-hidden p-0">
          <div className="grid min-h-[640px] xl:grid-cols-[1fr_1fr]">
            <div className="relative min-h-[360px] xl:min-h-[640px]">
              <Image
                src={content.heroImage}
                alt={content.heroImageAlt}
                fill
                className="object-cover"
                priority
                sizes="(max-width: 1280px) 100vw, 50vw"
              />
              <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.02),rgba(0,0,0,0.52))]" />
            </div>

            <div className="flex flex-col justify-between bg-[linear-gradient(180deg,rgba(255,255,255,0.05),rgba(0,0,0,0.12))] p-8 md:p-12">
              <div className="space-y-6">
                <p className="text-[13px] uppercase tracking-[0.28em] text-white/48">{content.heroEyebrow}</p>
                <h1 className="font-display text-[48px] leading-[1.04] tracking-[-0.5px] text-white md:text-[64px]">
                  {content.heroTitle}
                </h1>
                <p className="max-w-2xl text-base leading-8 text-white/68">{content.heroDescription}</p>
              </div>

              <div className="space-y-5">
                <div className="flex flex-wrap gap-3">
                  <ButtonLink href={buildTrackedHref(content.ctaPrimary.href, tracking)}>
                    {content.ctaPrimary.label}
                  </ButtonLink>
                  <ButtonLink href={buildTrackedHref(content.ctaSecondary.href, tracking)} variant="secondary">
                    {content.ctaSecondary.label}
                  </ButtonLink>
                </div>
                <div className="rounded-[20px] border border-white/10 bg-black/20 px-5 py-4 text-sm leading-7 text-white/55">
                  Tracking ativo: {formatTrackingSummary(tracking)}
                </div>
              </div>
            </div>
          </div>
        </GlassCard>

        <GlassCard tone="warm" className="p-8 md:p-10">
          <SectionHeading
            eyebrow="Intencao de busca"
            title={content.intentTitle}
            description={content.intentDescription}
            tone="dark"
          />
          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {content.bullets.map((bullet) => (
              <div key={bullet} className="rounded-[20px] border border-black/8 bg-white/55 px-5 py-5 text-sm leading-7 text-black/68">
                {bullet}
              </div>
            ))}
          </div>
        </GlassCard>
      </div>
    </main>
  );
}
