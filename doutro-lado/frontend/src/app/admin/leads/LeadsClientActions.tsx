"use client";

import { Download } from "lucide-react";

type Lead = {
  id: string;
  email: string;
  region: string | null;
  interests: string[] | null;
  locale: string | null;
  source: string | null;
  utm_source: string | null;
  utm_medium: string | null;
  utm_campaign: string | null;
  created_at: string;
};

export function LeadsClientActions({ leads }: { leads: Lead[] }) {
  function exportCsv() {
    const headers = ["email", "region", "interests", "locale", "source", "utm_source", "utm_medium", "utm_campaign", "created_at"];
    const rows = leads.map((l) => [
      l.email,
      l.region ?? "",
      (l.interests ?? []).join(";"),
      l.locale ?? "",
      l.source ?? "",
      l.utm_source ?? "",
      l.utm_medium ?? "",
      l.utm_campaign ?? "",
      l.created_at,
    ]);
    const csv = [headers, ...rows]
      .map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(","))
      .join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `leads_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <button
      onClick={exportCsv}
      className="flex items-center gap-2 rounded-[12px] border border-white/10 bg-white/[0.03] px-4 py-2 text-[12px] text-white/50 transition hover:bg-white/[0.07] hover:text-white"
    >
      <Download size={13} />
      Exportar CSV
    </button>
  );
}
