"use client";

import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { Brand, PackagingOption, PackagingType, Product } from "@/lib/types";
import { Button } from "@/components/ui/Button";
import { createGiftKit } from "@/lib/storefront";

// =============================================================================
// Sub-components
// =============================================================================

function PackagingSelector({
  options,
  selected,
  subtotal,
  onSelect,
  isModa,
}: {
  options: PackagingOption[];
  selected: PackagingType;
  subtotal: number;
  onSelect: (t: PackagingType) => void;
  isModa: boolean;
}) {
  return (
    <div className="space-y-3">
      {options.map((opt) => {
        const isActive = selected === opt.type;
        const surcharge = Number((subtotal * opt.surchargeMultiplier).toFixed(2));
        return (
          <button
            key={opt.type}
            onClick={() => onSelect(opt.type)}
            className={`w-full rounded-[18px] border px-5 py-4 text-left transition-all ${
              isActive
                ? isModa
                  ? "border-[#C6A96B]/60 bg-[rgba(198,169,107,0.08)]"
                  : "border-[#17120d]/30 bg-black/5"
                : "border-white/10 bg-transparent hover:border-white/20"
            }`}
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className={`text-[13px] font-medium ${isModa ? "text-white" : "text-[#17120d]"}`}>
                  {opt.label}
                </p>
                <p className={`mt-1 text-[12px] ${isModa ? "text-white/55" : "text-black/55"}`}>
                  {opt.descriptionPT}
                </p>
              </div>
              <span className={`shrink-0 text-[13px] ${isModa ? "text-[#C6A96B]" : "text-black/60"}`}>
                {surcharge === 0 ? "Incluso" : `+R$ ${surcharge.toFixed(2)}`}
              </span>
            </div>
          </button>
        );
      })}
    </div>
  );
}

// =============================================================================
// Main Studio
// =============================================================================

type KitEntry = { product: Product; quantity: number };

type Props = {
  products: Product[];
  packagingOptions: PackagingOption[];
  /** Supabase access token for saving the kit. Null = guest user. */
  token?: string | null;
};

const BRAND_LABELS: Record<Brand, string> = {
  casa: "Casa & Decoração",
  moda: "Moda & Acessórios",
};

export function GiftBuilderStudio({ products, packagingOptions, token }: Props) {
  const [selectedBrand, setSelectedBrand] = useState<Brand | null>(null);
  const [kitEntries, setKitEntries] = useState<KitEntry[]>([]);
  const [packagingType, setPackagingType] = useState<PackagingType>("standard");
  const [kitName, setKitName] = useState("");
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);
  const [savedKit, setSavedKit] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Filter products to selected brand
  const availableProducts = selectedBrand
    ? products.filter((p) => p.brand === selectedBrand)
    : products;

  const isModa = selectedBrand === "moda";
  const selectedPackaging = packagingOptions.find((o) => o.type === packagingType) ?? packagingOptions[0];

  // ── Totals ───────────────────────────────────────────────────────────────
  const subtotalBRL = useMemo(
    () => Number(kitEntries.reduce((s, e) => s + e.product.retailPriceBRL * e.quantity, 0).toFixed(2)),
    [kitEntries]
  );
  const packagingSurcharge = selectedPackaging
    ? Number((subtotalBRL * selectedPackaging.surchargeMultiplier).toFixed(2))
    : 0;
  const totalBRL = Number((subtotalBRL + packagingSurcharge).toFixed(2));

  // ── Item management ──────────────────────────────────────────────────────
  function addProduct(product: Product) {
    if (selectedBrand && product.brand !== selectedBrand) return;
    if (!selectedBrand) setSelectedBrand(product.brand);

    setKitEntries((prev) => {
      const existing = prev.find((e) => e.product.id === product.id);
      if (existing) {
        return prev.map((e) =>
          e.product.id === product.id ? { ...e, quantity: e.quantity + 1 } : e
        );
      }
      return [...prev, { product, quantity: 1 }];
    });
    setError(null);
  }

  function removeEntry(productId: string) {
    setKitEntries((prev) => prev.filter((e) => e.product.id !== productId));
  }

  function updateQuantity(productId: string, delta: number) {
    setKitEntries((prev) =>
      prev
        .map((e) =>
          e.product.id === productId ? { ...e, quantity: Math.max(1, e.quantity + delta) } : e
        )
        .filter((e) => e.quantity > 0)
    );
  }

  function resetKit() {
    setKitEntries([]);
    setSelectedBrand(null);
    setKitName("");
    setMessage("");
    setPackagingType("standard");
    setSavedKit(null);
    setError(null);
  }

  // ── Save ─────────────────────────────────────────────────────────────────
  async function handleSave() {
    if (!kitEntries.length) return setError("Adicione ao menos um produto ao kit.");
    if (!kitName.trim()) return setError("Dê um nome ao seu kit.");
    if (!token) return setError("Faça login para salvar seu kit.");
    if (!selectedBrand) return;

    setSaving(true);
    setError(null);
    const saved = await createGiftKit(
      {
        brand: selectedBrand,
        name: kitName.trim(),
        message: message.trim() || undefined,
        packagingType,
        items: kitEntries.map((e) => ({ productSlug: e.product.slug, quantity: e.quantity })),
      },
      token
    );
    setSaving(false);

    if (saved) {
      setSavedKit(saved.id);
    } else {
      setError("Erro ao salvar o kit. Verifique os itens e tente novamente.");
    }
  }

  const textBase = isModa || !selectedBrand ? "text-white" : "text-[#17120d]";
  const borderBase = isModa || !selectedBrand ? "border-white/10" : "border-black/10";

  // ── Success state ─────────────────────────────────────────────────────────
  if (savedKit) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.97 }}
        animate={{ opacity: 1, scale: 1 }}
        className="rounded-[28px] border border-[#C6A96B]/30 bg-[linear-gradient(135deg,rgba(198,169,107,0.1),rgba(0,0,0,0.8))] p-10 text-center"
      >
        <p className="text-[12px] uppercase tracking-[0.28em] text-[#C6A96B]/70">Kit salvo</p>
        <h2 className="mt-4 font-display text-[36px] leading-[1.05] tracking-[-0.5px] text-white">
          {kitName}
        </h2>
        <p className="mt-4 text-sm text-white/55">
          Seu kit premium foi salvo. Você pode acessá-lo em Minha Conta.
        </p>
        <div className="mt-8 flex justify-center gap-4">
          <Button variant="secondary" onClick={resetKit}>Monte outro kit</Button>
        </div>
      </motion.div>
    );
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[1.15fr_0.85fr]">
      {/* ── Left — product picker ──────────────────────────────────────── */}
      <div className="space-y-6">
        {/* Brand selector */}
        {!selectedBrand && (
          <div className="space-y-3">
            <p className="text-[12px] uppercase tracking-[0.28em] text-white/45">
              Escolha o universo do kit
            </p>
            <div className="grid grid-cols-2 gap-4">
              {(["casa", "moda"] as Brand[]).map((b) => (
                <button
                  key={b}
                  onClick={() => setSelectedBrand(b)}
                  className="rounded-[22px] border border-white/10 bg-white/[0.03] p-6 text-left transition-all hover:border-white/25 hover:bg-white/[0.06]"
                >
                  <p className="text-[11px] uppercase tracking-[0.3em] text-white/45">Universo</p>
                  <p className="mt-2 font-display text-[22px] tracking-[-0.3px] text-white">
                    {BRAND_LABELS[b]}
                  </p>
                </button>
              ))}
            </div>
          </div>
        )}

        {selectedBrand && (
          <div className="flex items-center justify-between">
            <p className={`text-[12px] uppercase tracking-[0.24em] ${textBase}/55`}>
              {BRAND_LABELS[selectedBrand]} — {availableProducts.length} produtos
            </p>
            <button onClick={resetKit} className="text-[12px] text-white/40 underline-offset-2 hover:underline">
              Trocar universo
            </button>
          </div>
        )}

        {/* Product grid */}
        <div className="grid gap-4 sm:grid-cols-2">
          {availableProducts.map((product, i) => {
            const inKit = kitEntries.find((e) => e.product.id === product.id);
            return (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
                className={`rounded-[22px] border p-5 transition-all ${borderBase} ${
                  inKit
                    ? isModa
                      ? "bg-[rgba(198,169,107,0.07)]"
                      : "bg-black/5"
                    : "bg-white/[0.025]"
                }`}
              >
                <div className="mb-4 aspect-square rounded-[16px] bg-[radial-gradient(circle_at_top,rgba(198,169,107,0.14),transparent_40%),linear-gradient(135deg,rgba(255,255,255,0.05),rgba(0,0,0,0.75))]" />
                <p className={`text-[11px] uppercase tracking-[0.22em] ${textBase}/40`}>{product.category}</p>
                <p className={`mt-2 font-display text-[20px] leading-tight tracking-[-0.3px] ${textBase}`}>
                  {product.name}
                </p>
                <div className="mt-4 flex items-center justify-between gap-2">
                  <span className={`text-[14px] ${textBase}`}>R$ {product.retailPriceBRL.toFixed(2)}</span>
                  <Button
                    variant={inKit ? "ghost" : "secondary"}
                    onClick={() => addProduct(product)}
                    className="shrink-0 px-4 py-2 text-[13px]"
                  >
                    {inKit ? `+1 (${inKit.quantity})` : "Adicionar"}
                  </Button>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* ── Right — kit preview & configuration ────────────────────────── */}
      <div className="space-y-5">
        {/* Kit preview card */}
        <div className="rounded-[28px] border border-[#C6A96B]/20 bg-[linear-gradient(180deg,rgba(198,169,107,0.06),rgba(0,0,0,0.7))] p-6">
          <p className="text-[12px] uppercase tracking-[0.28em] text-[#C6A96B]/70">Preview do kit</p>

          {/* Kit name */}
          <input
            type="text"
            value={kitName}
            onChange={(e) => setKitName(e.target.value)}
            placeholder="Nome do kit..."
            maxLength={128}
            className="mt-4 w-full rounded-[14px] border border-white/10 bg-white/[0.04] px-4 py-3 text-[16px] text-white placeholder-white/30 outline-none focus:border-[#C6A96B]/50"
          />

          {/* Items list */}
          <div className="mt-4 space-y-2">
            <AnimatePresence>
              {kitEntries.length === 0 ? (
                <div className="rounded-[18px] border border-dashed border-white/12 px-5 py-10 text-center text-white/40 text-sm">
                  Adicione produtos ao kit.
                </div>
              ) : (
                kitEntries.map((entry) => (
                  <motion.div
                    key={entry.product.id}
                    layout
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    className="flex items-center justify-between rounded-[16px] border border-white/8 bg-black/20 px-4 py-3"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[14px] text-white">{entry.product.name}</p>
                      <p className="text-[12px] text-white/45">
                        R$ {(entry.product.retailPriceBRL * entry.quantity).toFixed(2)}
                      </p>
                    </div>
                    <div className="ml-4 flex shrink-0 items-center gap-2">
                      <button
                        onClick={() => updateQuantity(entry.product.id, -1)}
                        className="flex size-6 items-center justify-center rounded-full border border-white/15 text-white/60 hover:text-white"
                      >
                        −
                      </button>
                      <span className="w-4 text-center text-sm text-white">{entry.quantity}</span>
                      <button
                        onClick={() => updateQuantity(entry.product.id, 1)}
                        className="flex size-6 items-center justify-center rounded-full border border-white/15 text-white/60 hover:text-white"
                      >
                        +
                      </button>
                      <button
                        onClick={() => removeEntry(entry.product.id)}
                        className="ml-1 text-white/30 hover:text-white/70"
                        aria-label="Remover"
                      >
                        ×
                      </button>
                    </div>
                  </motion.div>
                ))
              )}
            </AnimatePresence>
          </div>

          {/* Totals */}
          {kitEntries.length > 0 && (
            <div className="mt-4 rounded-[16px] border border-white/8 bg-black/15 px-4 py-4 text-sm space-y-2">
              <div className="flex justify-between text-white/55">
                <span>Subtotal</span>
                <span>R$ {subtotalBRL.toFixed(2)}</span>
              </div>
              {packagingSurcharge > 0 && (
                <div className="flex justify-between text-white/55">
                  <span>Embalagem ({selectedPackaging?.label})</span>
                  <span>+R$ {packagingSurcharge.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between border-t border-white/8 pt-2 font-medium text-white">
                <span>Total do kit</span>
                <span className="text-[#C6A96B]">R$ {totalBRL.toFixed(2)}</span>
              </div>
            </div>
          )}
        </div>

        {/* Packaging selector */}
        <div className="space-y-3">
          <p className="text-[12px] uppercase tracking-[0.24em] text-white/45">Embalagem premium</p>
          <PackagingSelector
            options={packagingOptions}
            selected={packagingType}
            subtotal={subtotalBRL}
            onSelect={setPackagingType}
            isModa={isModa}
          />
        </div>

        {/* Personalized message */}
        <div className="space-y-3">
          <p className="text-[12px] uppercase tracking-[0.24em] text-white/45">Mensagem personalizada</p>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Escreva uma mensagem para o presenteado... (opcional)"
            maxLength={500}
            rows={4}
            className="w-full rounded-[16px] border border-white/10 bg-white/[0.04] px-4 py-3 text-[14px] text-white placeholder-white/30 outline-none focus:border-[#C6A96B]/40 resize-none"
          />
          <p className="text-right text-[11px] text-white/25">{message.length}/500</p>
        </div>

        {/* Error */}
        {error && (
          <div className="rounded-[14px] border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
            {error}
          </div>
        )}

        {/* CTA */}
        <Button
          onClick={handleSave}
          disabled={saving || kitEntries.length === 0}
          className="w-full"
        >
          {saving ? "Salvando..." : token ? "Salvar kit premium" : "Faça login para salvar"}
        </Button>

        {!token && (
          <p className="text-center text-[12px] text-white/35">
            Você pode montar o kit agora e salvar após o login.
          </p>
        )}
      </div>
    </div>
  );
}
