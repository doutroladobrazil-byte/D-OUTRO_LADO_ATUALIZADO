"use client";

import { useState } from "react";
import { Check, X } from "lucide-react";

type Props = {
  productId: string;
  field: "retailPriceBRL" | "wholesalePriceBRL" | "stock";
  currentValue: number;
  label: string;
  onSuccess?: (newValue: number) => void;
};

/**
 * Inline editor for product price/stock fields.
 * Calls PATCH /admin/products/:id and updates the displayed value on success.
 */
export function InlineProductEditor({ productId, field, currentValue, label, onSuccess }: Props) {
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(String(currentValue));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function save() {
    setSaving(true);
    setError(null);
    const apiBase = process.env.NEXT_PUBLIC_API_URL ?? "/api";

    // Get token from localStorage (admin is server-rendered; use cookie via fetch)
    const res = await fetch(`${apiBase}/admin/products/${productId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ [mapField(field)]: Number(value) }),
    });

    setSaving(false);
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.message ?? "Erro ao salvar");
      return;
    }
    setEditing(false);
    onSuccess?.(Number(value));
  }

  function mapField(f: string) {
    if (f === "retailPriceBRL") return "retailPriceBRL";
    if (f === "wholesalePriceBRL") return "wholesalePriceBRL";
    return "stock";
  }

  if (!editing) {
    return (
      <button
        onClick={() => setEditing(true)}
        className="group flex items-center gap-1 text-sm text-white/70 hover:text-white"
        title={`Editar ${label}`}
      >
        {field === "stock" ? value : `R$ ${Number(value).toFixed(2)}`}
        <span className="text-[10px] text-white/20 group-hover:text-white/45">✎</span>
      </button>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <input
        type="number"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        step={field === "stock" ? 1 : 0.01}
        min={0}
        autoFocus
        className="w-24 rounded-[10px] border border-[#C6A96B]/30 bg-black/40 px-2 py-1 text-sm text-white outline-none focus:border-[#C6A96B]/60"
      />
      <button
        onClick={save}
        disabled={saving}
        className="text-green-400 hover:text-green-300 disabled:opacity-40"
      >
        <Check size={14} />
      </button>
      <button onClick={() => { setEditing(false); setValue(String(currentValue)); }} className="text-white/30 hover:text-white/60">
        <X size={14} />
      </button>
      {error && <span className="text-[11px] text-red-400">{error}</span>}
    </div>
  );
}
