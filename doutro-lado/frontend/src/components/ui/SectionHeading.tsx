import { cn } from "@/lib/cn";

export function SectionHeading({
  eyebrow,
  title,
  description,
  align = "left",
  tone = "light"
}: {
  eyebrow: string;
  title: string;
  description?: string;
  align?: "left" | "center";
  tone?: "light" | "dark";
}) {
  return (
    <div className={cn("space-y-4", align === "center" && "mx-auto max-w-3xl text-center")}>
      <p className={cn("text-[13px] uppercase tracking-[0.28em]", tone === "light" ? "text-white/55" : "text-black/45")}>{eyebrow}</p>
      <h2 className={cn("font-display text-[36px] leading-[1.05] tracking-[-0.5px] md:text-[42px]", tone === "light" ? "text-white" : "text-[#17120d]")}>
        {title}
      </h2>
      {description ? (
        <p className={cn("max-w-2xl text-base leading-7", tone === "light" ? "text-white/60" : "text-black/60")}>
          {description}
        </p>
      ) : null}
    </div>
  );
}
