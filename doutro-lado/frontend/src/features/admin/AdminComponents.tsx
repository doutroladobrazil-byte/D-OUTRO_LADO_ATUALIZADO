// =============================================================================
// Admin component library — reusable across all admin pages
// =============================================================================

import type { ReactNode } from "react";

// ── MetricCard ────────────────────────────────────────────────────────────────
type MetricCardProps = {
  label: string;
  value: string | number;
  sub?: string;
  highlight?: "gold" | "red" | "green" | "default";
};

export function MetricCard({ label, value, sub, highlight = "default" }: MetricCardProps) {
  const valueClass = {
    gold: "text-[#C6A96B]",
    red: "text-red-400",
    green: "text-green-400",
    default: "text-white",
  }[highlight];

  return (
    <div className="rounded-[22px] border border-white/8 bg-white/[0.03] p-6 backdrop-blur-xl">
      <p className="text-[11px] uppercase tracking-[0.26em] text-white/38">{label}</p>
      <p className={`mt-3 text-[32px] font-light leading-none ${valueClass}`}>{value}</p>
      {sub && <p className="mt-2 text-[12px] text-white/38">{sub}</p>}
    </div>
  );
}

// ── StatusBadge ───────────────────────────────────────────────────────────────
const STATUS_COLORS: Record<string, string> = {
  // Order status
  created: "border-white/15 bg-white/5 text-white/55",
  awaiting_payment: "border-amber-400/30 bg-amber-400/8 text-amber-300",
  processing: "border-blue-400/30 bg-blue-400/8 text-blue-300",
  packing: "border-cyan-400/30 bg-cyan-400/8 text-cyan-300",
  shipped: "border-purple-400/30 bg-purple-400/8 text-purple-300",
  delivered: "border-green-400/30 bg-green-400/8 text-green-300",
  cancelled: "border-red-400/30 bg-red-400/8 text-red-300",
  // Payment
  pending: "border-amber-400/30 bg-amber-400/8 text-amber-300",
  paid: "border-green-400/30 bg-green-400/8 text-green-300",
  failed: "border-red-400/30 bg-red-400/8 text-red-300",
  refunded: "border-orange-400/30 bg-orange-400/8 text-orange-300",
  // Fiscal
  in_review: "border-blue-400/30 bg-blue-400/8 text-blue-300",
  issued: "border-green-400/30 bg-green-400/8 text-green-300",
  rejected: "border-red-400/30 bg-red-400/8 text-red-300",
  // Product / active
  active: "border-green-400/30 bg-green-400/8 text-green-300",
  inactive: "border-red-400/30 bg-red-400/8 text-red-300",
  low: "border-red-400/30 bg-red-400/8 text-red-300",
  ok: "border-green-400/30 bg-green-400/8 text-green-300",
  // Role
  admin: "border-[#C6A96B]/40 bg-[#C6A96B]/8 text-[#C6A96B]",
  wholesale: "border-purple-400/30 bg-purple-400/8 text-purple-300",
  customer: "border-white/15 bg-white/5 text-white/55",
};

export function StatusBadge({ status }: { status: string }) {
  const cls = STATUS_COLORS[status] ?? "border-white/15 bg-white/5 text-white/55";
  return (
    <span className={`rounded-full border px-3 py-1 text-[11px] uppercase tracking-[0.18em] ${cls}`}>
      {status.replace("_", " ")}
    </span>
  );
}

// ── AdminSection ──────────────────────────────────────────────────────────────
export function AdminSection({
  title,
  eyebrow,
  action,
  children,
}: {
  title: string;
  eyebrow?: string;
  action?: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="space-y-5">
      <div className="flex items-end justify-between gap-4">
        <div>
          {eyebrow && (
            <p className="text-[11px] uppercase tracking-[0.28em] text-white/38">{eyebrow}</p>
          )}
          <h2 className="mt-1 font-display text-[28px] tracking-[-0.4px] text-white">{title}</h2>
        </div>
        {action && <div className="shrink-0">{action}</div>}
      </div>
      {children}
    </div>
  );
}

// ── AdminTable ────────────────────────────────────────────────────────────────
type Column<T> = {
  key: keyof T | string;
  label: string;
  render?: (row: T) => ReactNode;
  align?: "left" | "right";
};

export function AdminTable<T extends Record<string, unknown>>({
  columns,
  rows,
  emptyMessage = "Nenhum registro encontrado.",
  rowKey,
}: {
  columns: Column<T>[];
  rows: T[];
  emptyMessage?: string;
  rowKey: (row: T) => string;
}) {
  return (
    <div className="overflow-hidden rounded-[22px] border border-white/8 bg-white/[0.02]">
      {/* Header */}
      <div
        className="grid border-b border-white/8 bg-white/[0.03] px-5 py-3"
        style={{ gridTemplateColumns: `repeat(${columns.length}, minmax(0, 1fr))` }}
      >
        {columns.map((col) => (
          <span
            key={String(col.key)}
            className={`text-[11px] uppercase tracking-[0.22em] text-white/38 ${col.align === "right" ? "text-right" : ""}`}
          >
            {col.label}
          </span>
        ))}
      </div>

      {/* Rows */}
      <div className="divide-y divide-white/5">
        {rows.length === 0 ? (
          <p className="px-5 py-8 text-center text-sm text-white/35">{emptyMessage}</p>
        ) : (
          rows.map((row) => (
            <div
              key={rowKey(row)}
              className="grid px-5 py-4 transition hover:bg-white/[0.025]"
              style={{ gridTemplateColumns: `repeat(${columns.length}, minmax(0, 1fr))` }}
            >
              {columns.map((col) => (
                <div
                  key={String(col.key)}
                  className={`flex items-center text-sm text-white/75 ${col.align === "right" ? "justify-end" : ""}`}
                >
                  {col.render ? col.render(row) : String(row[col.key as keyof T] ?? "—")}
                </div>
              ))}
            </div>
          ))
        )}
      </div>
    </div>
  );
}

// ── AlertBanner ───────────────────────────────────────────────────────────────
export function AlertBanner({ alerts }: { alerts: string[] }) {
  if (alerts.length === 0) return null;
  return (
    <div className="rounded-[18px] border border-amber-400/25 bg-amber-400/6 px-5 py-4">
      <p className="text-[11px] uppercase tracking-[0.24em] text-amber-300/60">Alertas operacionais</p>
      <ul className="mt-2 space-y-1">
        {alerts.map((alert) => (
          <li key={alert} className="text-sm text-amber-200/80">
            ⚠ {alert}
          </li>
        ))}
      </ul>
    </div>
  );
}

// ── StockIndicator ────────────────────────────────────────────────────────────
export function StockIndicator({ stock }: { stock: number }) {
  if (stock === 0) return <StatusBadge status="inactive" />;
  if (stock < 5) return <span className="text-red-400 text-sm font-medium">{stock} ⚠</span>;
  if (stock < 20) return <span className="text-amber-300 text-sm">{stock}</span>;
  return <span className="text-green-400 text-sm">{stock}</span>;
}

// ── BrandChip ─────────────────────────────────────────────────────────────────
export function BrandChip({ brand }: { brand: string }) {
  const cls = "border-[#C6A96B]/30 bg-[#C6A96B]/8 text-[#C6A96B]";
  const label = brand === "moda" ? "Moda" : brand.charAt(0).toUpperCase() + brand.slice(1);
  return (
    <span className={`rounded-full border px-3 py-1 text-[10px] uppercase tracking-[0.22em] ${cls}`}>
      {label}
    </span>
  );
}

// ── AdminPageHeader ───────────────────────────────────────────────────────────
export function AdminPageHeader({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: string;
  description?: string;
}) {
  return (
    <div className="mb-8 space-y-2">
      <p className="text-[12px] uppercase tracking-[0.3em] text-white/35">{eyebrow}</p>
      <h1 className="font-display text-[40px] leading-[1.04] tracking-[-0.5px] text-white">{title}</h1>
      {description && <p className="max-w-2xl text-[14px] leading-6 text-white/50">{description}</p>}
    </div>
  );
}
