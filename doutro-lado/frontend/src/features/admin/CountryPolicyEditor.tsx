"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { adminApi } from "@/lib/admin-api";
import { useAdminToken } from "@/hooks/useAdminToken";
import type { CountryPolicy } from "@/lib/types";

type Props = {
  countryCode: string;
  initialPolicy: CountryPolicy | null;
  adminToken?: string | null;
};

function PolicyTextarea({
  label,
  value,
  onChange,
  placeholder,
  rows = 3,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  rows?: number;
}) {
  return (
    <div className="space-y-1.5">
      <label className="text-[11px] uppercase tracking-[0.2em] text-white/40">{label}</label>
      <textarea
        rows={rows}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-[12px] border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-white placeholder:text-white/20 focus:border-white/25 focus:outline-none resize-y transition"
      />
    </div>
  );
}

function PolicyInput({
  label,
  value,
  onChange,
  type = "text",
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  placeholder?: string;
}) {
  return (
    <div className="space-y-1.5">
      <label className="text-[11px] uppercase tracking-[0.2em] text-white/40">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-[12px] border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-white placeholder:text-white/20 focus:border-white/25 focus:outline-none transition"
      />
    </div>
  );
}

export function CountryPolicyEditor({ countryCode, initialPolicy, adminToken }: Props) {
  const router = useRouter();
  const sessionToken = useAdminToken();
  const token = adminToken ?? sessionToken;

  const [policy, setPolicy] = useState<CountryPolicy>(
    initialPolicy ?? {
      deliveryNote: null,
      shippingPolicySummary: null,
      returnsEnabled: true,
      returnsWindowDays: 14,
      returnsPolicySummary: null,
      dutiesAndTaxesSummary: null,
      supportEmail: null,
      supportWhatsappOrContact: null,
      checkoutNotice: null,
      orderConfirmationNote: null,
    }
  );
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function set<K extends keyof CountryPolicy>(key: K, value: CountryPolicy[K]) {
    setPolicy((p) => ({ ...p, [key]: value }));
    setSaved(false);
  }

  async function handleSave() {
    if (!token) { setError("Sessão expirada. Recarregue a página."); return; }
    setSaving(true);
    setError(null);
    setSaved(false);

    const result = await adminApi.patchCountryPolicy(token, countryCode, policy);
    setSaving(false);

    if (!result.ok) {
      setError(result.message);
      return;
    }

    setSaved(true);
    router.refresh();
    setTimeout(() => setSaved(false), 3000);
  }

  return (
    <div className="space-y-8">
      {/* Delivery */}
      <div className="space-y-4">
        <p className="text-[11px] uppercase tracking-[0.22em] text-white/35 border-b border-white/8 pb-2">Delivery</p>
        <PolicyInput
          label="Delivery note (shown in checkout)"
          value={policy.deliveryNote ?? ""}
          onChange={(v) => set("deliveryNote", v || null)}
          placeholder="Ships via DHL Express. Estimated 5–8 business days. VAT included."
        />
        <PolicyTextarea
          label="Shipping policy summary"
          value={policy.shippingPolicySummary ?? ""}
          onChange={(v) => set("shippingPolicySummary", v || null)}
          placeholder="Full shipping policy paragraph shown in checkout and policy pages."
          rows={4}
        />
      </div>

      {/* Returns */}
      <div className="space-y-4">
        <p className="text-[11px] uppercase tracking-[0.22em] text-white/35 border-b border-white/8 pb-2">Returns</p>
        <div className="flex items-center gap-4">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={policy.returnsEnabled}
              onChange={(e) => set("returnsEnabled", e.target.checked)}
              className="rounded border-white/20 bg-white/5 text-[#C6A96B] focus:ring-[#C6A96B] focus:ring-offset-0"
            />
            <span className="text-sm text-white/70">Returns enabled</span>
          </label>
          <div className="flex items-center gap-2">
            <label className="text-[11px] uppercase tracking-[0.18em] text-white/40">Window (days)</label>
            <input
              type="number"
              min={0}
              max={365}
              value={policy.returnsWindowDays}
              onChange={(e) => set("returnsWindowDays", Number(e.target.value))}
              className="w-20 rounded-[10px] border border-white/10 bg-white/[0.04] px-3 py-2 text-sm text-white text-center focus:border-white/25 focus:outline-none transition"
            />
          </div>
        </div>
        <PolicyTextarea
          label="Returns policy summary"
          value={policy.returnsPolicySummary ?? ""}
          onChange={(v) => set("returnsPolicySummary", v || null)}
          placeholder="Full returns policy paragraph."
          rows={4}
        />
      </div>

      {/* Duties & taxes */}
      <div className="space-y-4">
        <p className="text-[11px] uppercase tracking-[0.22em] text-white/35 border-b border-white/8 pb-2">Duties &amp; taxes</p>
        <PolicyInput
          label="Duties and taxes summary (shown before payment)"
          value={policy.dutiesAndTaxesSummary ?? ""}
          onChange={(v) => set("dutiesAndTaxesSummary", v || null)}
          placeholder="Swiss VAT (7.7%) is included. No additional import duties apply."
        />
      </div>

      {/* Support */}
      <div className="space-y-4">
        <p className="text-[11px] uppercase tracking-[0.22em] text-white/35 border-b border-white/8 pb-2">Support</p>
        <div className="grid gap-4 sm:grid-cols-2">
          <PolicyInput
            label="Support email"
            type="email"
            value={policy.supportEmail ?? ""}
            onChange={(v) => set("supportEmail", v || null)}
            placeholder="support@doutrolado.com"
          />
          <PolicyInput
            label="WhatsApp / contact link"
            value={policy.supportWhatsappOrContact ?? ""}
            onChange={(v) => set("supportWhatsappOrContact", v || null)}
            placeholder="+55 11 9 0000-0000"
          />
        </div>
      </div>

      {/* Checkout / confirmation copy */}
      <div className="space-y-4">
        <p className="text-[11px] uppercase tracking-[0.22em] text-white/35 border-b border-white/8 pb-2">Checkout &amp; confirmation copy</p>
        <PolicyInput
          label="Checkout notice (shown in order summary sidebar)"
          value={policy.checkoutNotice ?? ""}
          onChange={(v) => set("checkoutNotice", v || null)}
          placeholder="Free duties and VAT included. Delivered by DHL Express in 5–8 business days."
        />
        <PolicyTextarea
          label="Order confirmation note (appended to confirmation email)"
          value={policy.orderConfirmationNote ?? ""}
          onChange={(v) => set("orderConfirmationNote", v || null)}
          placeholder="Your order will be dispatched within 1–2 business days…"
          rows={4}
        />
      </div>

      {/* Actions */}
      <div className="flex items-center gap-4 pt-2">
        <button
          onClick={handleSave}
          disabled={saving || !token}
          className="rounded-full border border-[#C6A96B]/60 bg-[rgba(198,169,107,0.1)] px-8 py-3 text-sm uppercase tracking-[0.18em] text-[#C6A96B] hover:-translate-y-0.5 transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {saving ? "Saving…" : "Save policy"}
        </button>
        {saved && (
          <span className="text-sm text-emerald-400">Saved successfully.</span>
        )}
        {error && (
          <span className="text-sm text-red-400">{error}</span>
        )}
      </div>
    </div>
  );
}
