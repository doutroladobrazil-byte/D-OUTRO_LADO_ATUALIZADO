import { cn } from "@/lib/cn";

export function SectionHeading({
  eyebrow,
  title,
  description,
  align = "left",
  tone = "dark"
}: {
  eyebrow: string;
  title: string;
  description?: string;
  align?: "left" | "center";
  tone?: "light" | "dark";
}) {
  return (
    <div className={cn("space-y-4", align === "center" && "mx-auto max-w-3xl text-center")}>
      <p className={cn("text-[13px] uppercase tracking-[0.28em]", tone === "dark" ? "text-ink-soft" : "text-canvas/55")}>
        {eyebrow}
      </p>
      <h2 className={cn("font-display text-[36px] leading-[1.05] tracking-[-0.5px] md:text-[42px]", tone === "dark" ? "text-ink" : "text-canvas")}>
        {title}
      </h2>
      {description ? (
        <p className={cn("max-w-2xl text-base leading-7", tone === "dark" ? "text-ink-mid" : "text-canvas/60")}>
          {description}
        </p>
      ) : null}
    </div>
  );
}
