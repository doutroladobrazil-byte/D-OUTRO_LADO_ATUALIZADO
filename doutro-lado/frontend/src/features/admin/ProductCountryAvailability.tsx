"use client";

/**
 * ProductCountryAvailability — Stage 13
 *
 * Admin panel for managing product availability per destination country.
 * Renders 6 country toggles (the MVP destinations), fetches current state
 * on mount, and persists changes via PATCH /admin/products/:id/availability.
 *
 * Used inside the product edit page, after the media manager.
 */

import { useEffect, useState, useTransition } from "react";
import { adminApi } from "@/lib/admin-api";
import type { ProductAvailabilityMap } from "@/lib/types";

// ---------------------------------------------------------------------------
// MVP countries — mirrors COUNTRY_CODES on the backend
// ---------------------------------------------------------------------------

const MVP_COUNTRIES: { code: string; label: string; flag: string }[] = [
  { code: "US", label: "Estados Unidos", flag: "🇺🇸" },
  { code: "CH", label: "Suíça",         flag: "🇨🇭" },
  { code: "IE", label: "Irlanda",        flag: "🇮🇪" },
  { code: "DE", label: "Alemanha",       flag: "🇩🇪" },
  { code: "IS", label: "Islândia",       flag: "🇮🇸" },
  { code: "SG", label: "Singapura",      flag: "🇸🇬" },
];

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

type Props = {
  productId: string;
  token: string;
};

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function ProductCountryAvailability({ productId, token }: Props) {
  const [availability, setAvailability] = useState<ProductAvailabilityMap | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  // Load current state on mount
  useEffect(() => {
    adminApi.getProductAvailability(token, productId).then((result) => {
      if (result.ok) {
        setAvailability(result.data);
      } else {
        setError(result.message);
      }
      setLoading(false);
    });
  }, [productId, token]);

  const handleToggle = (code: string, newValue: boolean) => {
    if (!availability) return;

    const optimistic = { ...availability, [code]: newValue };
    setAvailability(optimistic);

    startTransition(() => {
      adminApi
        .patchProductAvailability(token, productId, { [code]: newValue })
        .then((result) => {
          if (result.ok) {
            setAvailability(result.data);
          } else {
            // Roll back optimistic update
            setAvailability((prev) => prev ? { ...prev, [code]: !newValue } : prev);
            setError(result.message);
          }
        });
    });
  };

  const enabledCount = availability
    ? Object.values(availability).filter(Boolean).length
    : 0;

  const handleEnableAll = () => {
    if (!availability) return;
    const all: ProductAvailabilityMap = {};
    MVP_COUNTRIES.forEach(({ code }) => { all[code] = true; });
    setAvailability(all);
    startTransition(() => {
      adminApi.patchProductAvailability(token, productId, all).then((result) => {
        if (result.ok) {
          setAvailability(result.data);
        } else {
          setAvailability(availability);
          setError(result.message);
        }
      });
    });
  };

  return (
    <section>
      <div className="flex items-start justify-between gap-4 mb-1">
        <h2 className="text-lg font-semibold text-white">
          Disponibilidade por país
          {!loading && availability && (
            <span className={`ml-3 text-sm font-normal ${enabledCount === 0 ? "text-red-400" : "text-white/40"}`}>
              {enabledCount === 0 ? "nenhum país habilitado" : `${enabledCount} de ${MVP_COUNTRIES.length} habilitados`}
            </span>
          )}
        </h2>
        {!loading && availability && enabledCount === 0 && (
          <button
            type="button"
            onClick={handleEnableAll}
            disabled={isPending}
            className="shrink-0 rounded-[10px] border border-[#C6A96B]/40 bg-[#C6A96B]/10 px-4 py-1.5 text-xs font-medium text-[#C6A96B] transition hover:bg-[#C6A96B]/20 disabled:opacity-50"
          >
            Habilitar todos
          </button>
        )}
      </div>
      <p className="text-sm text-white/50 mb-4">
        Controla se o produto aparece no catálogo e pode ser comprado por destino.
      </p>

      {loading && (
        <p className="text-sm text-white/40">Carregando disponibilidade…</p>
      )}

      {error && (
        <p className="text-sm text-red-400 mb-4">{error}</p>
      )}

      {!loading && availability && enabledCount === 0 && (
        <div className="mb-4 flex items-center gap-3 rounded-[12px] border border-red-400/30 bg-red-400/8 px-4 py-3">
          <span className="text-base">⚠</span>
          <p className="text-sm text-red-300">
            <strong className="font-semibold">Produto invisível comercialmente.</strong>{" "}
            Habilite pelo menos um país para que o SKU apareça no catálogo e possa ser comprado.
          </p>
        </div>
      )}

      {!loading && availability && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {MVP_COUNTRIES.map(({ code, label, flag }) => {
            const isActive = availability[code] ?? false;
            return (
              <button
                key={code}
                type="button"
                onClick={() => handleToggle(code, !isActive)}
                disabled={isPending}
                className={[
                  "flex items-center gap-3 px-4 py-3 rounded-xl border text-sm font-medium transition-all",
                  isActive
                    ? "border-white/20 bg-white/10 text-white"
                    : "border-white/8 bg-white/3 text-white/40",
                  isPending && "opacity-60 cursor-not-allowed",
                ].join(" ")}
              >
                <span className="text-xl">{flag}</span>
                <span className="flex-1 text-left">{label}</span>
                <span
                  className={[
                    "w-3 h-3 rounded-full flex-shrink-0",
                    isActive ? "bg-emerald-400" : "bg-white/20",
                  ].join(" ")}
                />
              </button>
            );
          })}
        </div>
      )}
    </section>
  );
}
