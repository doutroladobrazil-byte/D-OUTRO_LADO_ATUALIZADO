"use client";

import { useState, useEffect } from "react";
import { GlassCard } from "@/components/ui/GlassCard";
import { HomeAnalytics } from "@/lib/analytics";
import type { HomeDictionary } from "@/lib/i18n/home";

const REGIONS = [
  "Europe",
  "United Kingdom",
  "North America",
  "Brazil",
  "Middle East",
  "Asia-Pacific",
  "Other",
] as const;

const INTERESTS = ["Leather Bags", "Shoes", "Accessories", "Gifts", "New Drops"] as const;

type Region = (typeof REGIONS)[number];
type Interest = (typeof INTERESTS)[number];

interface UtmParams {
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
}

interface Props {
  dict: HomeDictionary["lead"];
  locale?: string;
}

export function LeadCaptureBlock({ dict, locale = "en" }: Props) {
  const [email, setEmail] = useState("");
  const [region, setRegion] = useState<Region | "">("");
  const [interests, setInterests] = useState<Interest[]>([]);
  const [utm, setUtm] = useState<UtmParams>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setUtm({
      utm_source: params.get("utm_source") ?? undefined,
      utm_medium: params.get("utm_medium") ?? undefined,
      utm_campaign: params.get("utm_campaign") ?? undefined,
    });
  }, []);

  function toggleInterest(i: Interest) {
    setInterests((prev) =>
      prev.includes(i) ? prev.filter((x) => x !== i) : [...prev, i],
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          region: region || null,
          interests: [...interests],
          locale,
          source: "homepage",
          ...utm,
        }),
      });

      if (!res.ok) {
        const data = (await res.json().catch(() => ({}))) as { error?: string };
        const msg = data.error ?? dict.error;
        HomeAnalytics.leadSubmitError(msg);
        setError(msg);
        return;
      }

      const payload = { region: region || "unknown", interests: [...interests], locale };
      HomeAnalytics.leadSubmit(payload);
      HomeAnalytics.leadSubmitSuccess(payload);
      setSubmitted(true);
    } catch {
      HomeAnalytics.leadSubmitError("network_error");
      setError(dict.error);
    } finally {
      setLoading(false);
    }
  }

  if (submitted) {
    return (
      <GlassCard className="p-10 text-center">
        <p className="text-[13px] uppercase tracking-[0.28em] text-gold">{dict.successTitle}</p>
        <p className="mt-3 text-sm text-white/50">{dict.successBody}</p>
      </GlassCard>
    );
  }

  return (
    <GlassCard className="p-8 md:p-12">
      <div className="mx-auto max-w-2xl">
        <p className="text-[11px] uppercase tracking-[0.42em] text-gold/70">{dict.eyebrow}</p>
        <h2 className="mt-4 font-display text-[32px] leading-[1.08] tracking-[-0.5px] text-white md:text-[40px]">
          {dict.title}
        </h2>
        <p className="mt-4 text-sm leading-7 text-white/50">{dict.body}</p>

        <form onSubmit={handleSubmit} className="mt-8 space-y-5">
          <input
            type="email"
            required
            placeholder={dict.emailPlaceholder}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={loading}
            className="w-full rounded-[14px] border border-white/10 bg-white/[0.04] px-5 py-4 text-sm text-white placeholder:text-white/25 focus:border-gold/40 focus:outline-none disabled:opacity-50"
          />

          <div>
            <p className="mb-2 text-[11px] uppercase tracking-[0.28em] text-white/35">
              {dict.regionLabel}
            </p>
            <select
              value={region}
              onChange={(e) => setRegion(e.target.value as Region)}
              disabled={loading}
              className="w-full rounded-[14px] border border-white/10 bg-[#0e0e0e] px-5 py-4 text-sm text-white focus:border-gold/40 focus:outline-none disabled:opacity-50"
            >
              <option value="" disabled>
                {dict.regionDefault}
              </option>
              {REGIONS.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </div>

          <div>
            <p className="mb-3 text-[11px] uppercase tracking-[0.28em] text-white/35">
              {dict.interestLabel}
            </p>
            <div className="flex flex-wrap gap-2">
              {INTERESTS.map((i) => (
                <button
                  key={i}
                  type="button"
                  disabled={loading}
                  onClick={() => toggleInterest(i)}
                  className={`rounded-full border px-4 py-2 text-[12px] uppercase tracking-[0.18em] transition-colors disabled:opacity-50 ${
                    interests.includes(i)
                      ? "border-gold/60 bg-gold/10 text-gold"
                      : "border-white/10 bg-white/[0.03] text-white/45 hover:border-white/20 hover:text-white/60"
                  }`}
                >
                  {i}
                </button>
              ))}
            </div>
          </div>

          {error && (
            <div className="flex items-center justify-between rounded-[12px] border border-red-500/20 bg-red-500/8 px-4 py-3">
              <p className="text-[12px] text-red-400">{error}</p>
              <button
                type="button"
                onClick={() => setError(null)}
                className="ml-4 shrink-0 text-[11px] uppercase tracking-[0.18em] text-white/35 hover:text-white/60"
              >
                {dict.errorRetry}
              </button>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="relative w-full rounded-[14px] bg-gold px-6 py-4 text-[13px] uppercase tracking-[0.22em] text-[#0a0a0a] transition-all hover:-translate-y-0.5 hover:bg-gold/90 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-[#0a0a0a]/30 border-t-[#0a0a0a]" />
                {dict.cta}
              </span>
            ) : (
              dict.cta
            )}
          </button>

          <p className="text-center text-[11px] text-white/25">{dict.microcopy}</p>
        </form>
      </div>
    </GlassCard>
  );
}
