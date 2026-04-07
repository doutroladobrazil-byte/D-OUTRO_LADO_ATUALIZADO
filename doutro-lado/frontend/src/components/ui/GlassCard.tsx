import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

const tones = {
  dark: "border-white/10 bg-white/[0.04] text-white",
  warm: "border-[#D9D9D9]/65 bg-[linear-gradient(180deg,rgba(245,245,245,0.99),rgba(236,236,236,0.97))] text-[#16120f]",
  contrast: "border-white/20 bg-[linear-gradient(180deg,rgba(245,245,245,0.08),rgba(0,0,0,0.52))] text-white"
} as const;

export function GlassCard({
  children,
  className,
  tone = "dark"
}: {
  children?: ReactNode;
  className?: string;
  tone?: keyof typeof tones;
}) {
  return (
    <div
      className={cn(
        "rounded-[24px] border p-6 shadow-luxe backdrop-blur-xl",
        tones[tone],
        className
      )}
    >
      {children}
    </div>
  );
}
