import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { GlassCard } from "@/components/ui/GlassCard";
import type { HomeDictionary } from "@/lib/i18n/home";

interface Props {
  dict: HomeDictionary["gift"];
}

export function GiftCompositionFeature({ dict }: Props) {
  return (
    <GlassCard tone="warm" className="overflow-hidden p-0">
      <div className="grid gap-0 xl:grid-cols-[0.92fr_1.08fr]">
        <div className="relative min-h-[260px] md:min-h-[420px] bg-[radial-gradient(circle_at_top_left,rgba(122,92,62,0.10),transparent_34%),radial-gradient(circle_at_bottom_right,rgba(200,186,165,0.18),transparent_28%),linear-gradient(140deg,rgba(250,248,245,0.92),rgba(230,222,212,0.75))]">
          <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.12),transparent_40%)]" />
          <div className="absolute left-[12%] top-[16%] h-24 w-24 rounded-[26px] border border-ink-ghost/20 bg-ink/[0.03] shadow-luxe-light backdrop-blur-xl" />
          <div className="absolute left-[34%] top-[28%] h-36 w-28 rounded-[30px] border border-ink-ghost/25 bg-[linear-gradient(180deg,rgba(250,248,245,0.85),rgba(242,237,230,0.60))] shadow-halo-light backdrop-blur-xl" />
          <div className="absolute right-[16%] top-[20%] h-28 w-28 rounded-full border border-ink-ghost/18 bg-ink/[0.02] shadow-luxe-light" />
          <div className="absolute bottom-[14%] left-[18%] h-24 w-40 rounded-[999px] border border-ink-ghost/20 bg-ink/[0.04] backdrop-blur-xl" />
          <div className="absolute bottom-[22%] right-[18%] h-32 w-24 rounded-[28px] border border-ink-ghost/22 bg-[linear-gradient(180deg,rgba(200,186,165,0.22),rgba(250,248,245,0.08))] shadow-luxe-light" />
        </div>

        <div className="flex flex-col justify-center p-8 md:p-12">
          <p className="text-[13px] uppercase tracking-[0.28em] text-ink-soft">{dict.eyebrow}</p>
          <h3 className="mt-5 font-display text-[28px] leading-[1.04] tracking-[-0.5px] text-ink md:text-[40px] lg:text-[52px]">
            {dict.title}
          </h3>
          <p className="mt-6 max-w-xl text-base leading-8 text-ink-mid">{dict.body}</p>
          <div className="mt-8 grid gap-3 text-sm text-ink-mid md:grid-cols-2">
            <div className="rounded-[20px] border border-ink-ghost/30 bg-white/55 px-5 py-4">
              {dict.feature1}
            </div>
            <div className="rounded-[20px] border border-ink-ghost/30 bg-white/55 px-5 py-4">
              {dict.feature2}
            </div>
          </div>
          <Link
            href="/gift-builder"
            className="mt-8 inline-flex w-fit items-center gap-3 rounded-full border border-leather bg-leather px-5 py-4 text-sm uppercase tracking-[0.18em] text-canvas transition duration-300 hover:-translate-y-0.5 hover:bg-leather/85"
          >
            {dict.cta}
            <ArrowRight className="size-4" />
          </Link>
        </div>
      </div>
    </GlassCard>
  );
}
