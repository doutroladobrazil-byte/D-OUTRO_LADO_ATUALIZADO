import { GlassCard } from "@/components/ui/GlassCard";

export function AdminModulePage({
  eyebrow,
  title,
  description,
  metrics,
  rows
}: {
  eyebrow: string;
  title: string;
  description: string;
  metrics: { label: string; value: string }[];
  rows: { label: string; value: string }[];
}) {
  return (
    <div className="space-y-8">
      <div className="space-y-4">
        <p className="text-[13px] uppercase tracking-[0.28em] text-white/40">{eyebrow}</p>
        <h1 className="font-display text-[48px] leading-[1.05] tracking-[-0.5px] text-white">{title}</h1>
        <p className="max-w-3xl text-base leading-7 text-white/58">{description}</p>
      </div>
      <div className="grid gap-4 md:grid-cols-4">
        {metrics.map((metric) => (
          <GlassCard key={metric.label}>
            <p className="text-[12px] uppercase tracking-[0.24em] text-white/38">{metric.label}</p>
            <p className="mt-4 text-[32px] text-white">{metric.value}</p>
          </GlassCard>
        ))}
      </div>
      <GlassCard className="overflow-hidden p-0">
        <div className="grid divide-y divide-white/8">
          {rows.map((row) => (
            <div key={row.label} className="flex items-center justify-between px-6 py-5">
              <span className="text-white/55">{row.label}</span>
              <span className="text-white">{row.value}</span>
            </div>
          ))}
        </div>
      </GlassCard>
    </div>
  );
}
