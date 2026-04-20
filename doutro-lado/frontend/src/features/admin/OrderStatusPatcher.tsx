"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { adminApi } from "@/lib/admin-api";
import { useAdminToken } from "@/hooks/useAdminToken";
import type { OrderStatus, PaymentStatus, FiscalStatus } from "@/lib/types";

type Props = {
  orderId: string; // public_id
  currentOrderStatus: string;
  currentPaymentStatus: string;
  currentFiscalStatus: string;
  adminToken?: string | null;
};

const ORDER_STATUSES: OrderStatus[] = [
  "created", "processing", "packing", "shipped", "delivered", "cancelled",
];
const PAYMENT_STATUSES: PaymentStatus[] = ["pending", "paid", "failed", "refunded"];
const FISCAL_STATUSES: FiscalStatus[] = ["pending", "in_review", "issued", "rejected"];

export function OrderStatusPatcher({
  orderId,
  currentOrderStatus,
  currentPaymentStatus,
  currentFiscalStatus,
  adminToken,
}: Props) {
  const router = useRouter();
  const sessionToken = useAdminToken();
  const token = adminToken ?? sessionToken;

  const [orderStatus, setOrderStatus] = useState(currentOrderStatus);
  const [paymentStatus, setPaymentStatus] = useState(currentPaymentStatus);
  const [fiscalStatus, setFiscalStatus] = useState(currentFiscalStatus);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function save() {
    if (!token) { setError("Sessão expirada. Recarregue a página."); return; }
    setSaving(true);
    setError(null);
    setSaved(false);

    const result = await adminApi.patchOrder(token, orderId, { orderStatus, paymentStatus, fiscalStatus });
    setSaving(false);

    if (!result.ok) {
      setError(result.message);
      return;
    }

    setSaved(true);
    router.refresh();
    setTimeout(() => setSaved(false), 3000);
  }

  const selectClass = "rounded-[12px] border border-white/10 bg-black/30 px-3 py-2 text-sm text-white outline-none focus:border-[#C6A96B]/50";

  return (
    <div className="space-y-4 rounded-[20px] border border-white/8 bg-white/[0.02] p-5">
      <p className="text-[11px] uppercase tracking-[0.26em] text-white/40">Atualizar status — {orderId}</p>
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="space-y-1.5">
          <label className="text-[11px] text-white/40">Operação</label>
          <select value={orderStatus} onChange={(e) => setOrderStatus(e.target.value)} className={selectClass}>
            {ORDER_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
        <div className="space-y-1.5">
          <label className="text-[11px] text-white/40">Pagamento</label>
          <select value={paymentStatus} onChange={(e) => setPaymentStatus(e.target.value)} className={selectClass}>
            {PAYMENT_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
        <div className="space-y-1.5">
          <label className="text-[11px] text-white/40">Fiscal</label>
          <select value={fiscalStatus} onChange={(e) => setFiscalStatus(e.target.value)} className={selectClass}>
            {FISCAL_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
      </div>
      <div className="flex items-center gap-4">
        <button
          onClick={save}
          disabled={saving || !token}
          className="rounded-full border border-[#C6A96B]/50 bg-[#C6A96B]/10 px-5 py-2 text-sm text-[#C6A96B] transition hover:-translate-y-0.5 disabled:opacity-40"
        >
          {saving ? "Salvando..." : "Salvar status"}
        </button>
        {saved && <span className="text-sm text-green-400">✓ Salvo</span>}
        {error && <span className="text-sm text-red-400">{error}</span>}
      </div>
    </div>
  );
}
