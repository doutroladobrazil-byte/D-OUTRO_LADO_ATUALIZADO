import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { GlassCard } from "@/components/ui/GlassCard";

export function GiftCompositionFeature() {
  return (
    <GlassCard tone="warm" className="overflow-hidden p-0">
      <div className="grid gap-0 xl:grid-cols-[0.92fr_1.08fr]">
        <div className="relative min-h-[260px] md:min-h-[420px] bg-[radial-gradient(circle_at_top_left,rgba(245,245,245,0.18),transparent_28%),radial-gradient(circle_at_bottom_right,rgba(217,221,227,0.22),transparent_24%),linear-gradient(140deg,rgba(255,255,255,0.08),rgba(0,0,0,0.78))]">
          <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.05),transparent_32%)]" />
          <div className="absolute left-[12%] top-[16%] h-24 w-24 rounded-[26px] border border-white/12 bg-white/[0.08] shadow-luxe backdrop-blur-xl" />
          <div className="absolute left-[34%] top-[28%] h-36 w-28 rounded-[30px] border border-white/12 bg-[linear-gradient(180deg,rgba(245,245,245,0.2),rgba(255,255,255,0.06))] shadow-halo backdrop-blur-xl" />
          <div className="absolute right-[16%] top-[20%] h-28 w-28 rounded-full border border-white/10 bg-white/[0.05] shadow-luxe" />
          <div className="absolute bottom-[14%] left-[18%] h-24 w-40 rounded-[999px] border border-white/12 bg-black/20 backdrop-blur-xl" />
          <div className="absolute bottom-[22%] right-[18%] h-32 w-24 rounded-[28px] border border-white/10 bg-[linear-gradient(180deg,rgba(217,221,227,0.22),rgba(255,255,255,0.03))] shadow-luxe" />
        </div>

        <div className="flex flex-col justify-center p-8 md:p-12">
          <p className="text-[13px] uppercase tracking-[0.28em] text-black/42">Composição de presente</p>
          <h3 className="mt-5 font-display text-[28px] leading-[1.04] tracking-[-0.5px] text-[#17120d] md:text-[40px] lg:text-[52px]">
            Uma composição elegante, sensorial e personalizada.
          </h3>
          <p className="mt-6 max-w-xl text-base leading-8 text-black/62">
            Mais do que um kit, a experiência foi desenhada para construir uma composição de presente com objetos, couro, texturas e narrativa visual coerente para cada ocasião.
          </p>
          <div className="mt-8 grid gap-3 text-sm text-black/65 md:grid-cols-2">
            <div className="rounded-[20px] border border-black/8 bg-white/45 px-5 py-4">Seleção intuitiva por categoria e atmosfera.</div>
            <div className="rounded-[20px] border border-black/8 bg-white/45 px-5 py-4">Preview sofisticado com leitura imediata de valor.</div>
          </div>
          <Link
            href="/gift-builder"
            className="mt-8 inline-flex w-fit items-center gap-3 rounded-full border border-gold bg-gold px-5 py-4 text-sm uppercase tracking-[0.18em] text-black transition duration-300 hover:-translate-y-0.5"
          >
            Montar composição
            <ArrowRight className="size-4" />
          </Link>
        </div>
      </div>
    </GlassCard>
  );
}
