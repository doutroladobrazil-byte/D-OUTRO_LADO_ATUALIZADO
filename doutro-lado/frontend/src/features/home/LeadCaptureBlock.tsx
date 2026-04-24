"use client";

import { useState } from "react";
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

interface Props {
  dict: HomeDictionary["lead"];
  locale?: string;
}

export function LeadCaptureBlock({ dict, locale = "en" }: Props) {
  const [email, setEmail] = useState("");
  const [region, setRegion] = useState<Region | "">("");
  const [interests, setInterests] = useState<Interest[]>([]);
  const [submitted, setSubmitted] = useState(false);

  function toggleInterest(i: Interest) {
    setInterests((prev) =>
      prev.includes(i) ? prev.filter((x) => x !== i) : [...prev, i]
    );
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    // TODO: connect lead form to newsletter/CRM endpoint
    // Payload: { email, region, interests, locale, source: "homepage", utm: ... }
    HomeAnalytics.leadSubmit({ region: region || "unknown", interests: [...interests], locale });
    setSubmitted(true);
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
            className="w-full rounded-[14px] border border-white/10 bg-white/[0.04] px-5 py-4 text-sm text-white placeholder:text-white/25 focus:border-gold/40 focus:outline-none"
          />
          <div>
            <p className="mb-2 text-[11px] uppercase tracking-[0.28em] text-white/35">
              {dict.regionLabel}
            </p>
            <select
              value={region}
              onChange={(e) => setRegion(e.target.value as Region)}
              className="w-full rounded-[14px] border border-white/10 bg-[#0e0e0e] px-5 py-4 text-sm text-white focus:border-gold/40 focus:outline-none"
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
                  onClick={() => toggleInterest(i)}
                  className={`rounded-full border px-4 py-2 text-[12px] uppercase tracking-[0.18em] transition-colors ${
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
          <button
            type="submit"
            className="w-full rounded-[14px] bg-gold px-6 py-4 text-[13px] uppercase tracking-[0.22em] text-[#0a0a0a] transition-all hover:-translate-y-0.5 hover:bg-gold/90"
          >
            {dict.cta}
          </button>
          <p className="text-center text-[11px] text-white/25">{dict.microcopy}</p>
        </form>
      </div>
    </GlassCard>
  );
}
