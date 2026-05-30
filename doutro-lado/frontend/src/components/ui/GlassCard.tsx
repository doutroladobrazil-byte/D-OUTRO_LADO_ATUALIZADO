import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

const tones = {
  dark:     "border-ink-ghost/30 bg-white text-ink shadow-luxe-light",
  warm:     "border-ink-ghost/40 bg-surface text-ink shadow-luxe-light",
  contrast: "border-white/10 bg-noir text-canvas shadow-halo"
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
        "rounded-[24px] border p-6 backdrop-blur-xl",
        tones[tone],
        className
      )}
    >
      {children}
    </div>
  );
}
