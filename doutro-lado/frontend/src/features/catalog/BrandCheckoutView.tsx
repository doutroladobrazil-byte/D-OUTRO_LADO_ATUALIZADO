"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import type { BagSimulationResult, Brand, CountryCode, CountryDetail, SupportedCountry } from "@/lib/types";
import { useCartStore } from "@/lib/cart-store";
import { getActiveCountries, getBackendCart, getCountryDetail, simulateBag } from "@/lib/storefront";
import { createClient } from "@/lib/supabase/client";
import { GlassCard } from "@/components/ui/GlassCard";
import { Button } from "@/components/ui/Button";
import { PriceDisplay } from "@/components/ui/PriceDisplay";
import { useLocale } from "@/contexts/LocaleContext";
import { COUNTRY_DEFAULT_CURRENCY } from "@/lib/i18n";
import { useCountryPreference } from "@/hooks/useCountryPreference";

type Props = { brand: Brand };

/** Country flag emojis for the 6 MVP destinations. */
const COUNTRY_FLAGS: Record<CountryCode, string> = {
  US: "🇺🇸",
  CH: "🇨🇭",
  IE: "🇮🇪",
  DE: "🇩🇪",
  IS: "🇮🇸",
  SG: "🇸🇬",
};

type ContactForm = {
  fullName: string;
  email: string;
  phone: string;
  line1: string;
  line2: string;
  city: string;
  stateRegion: string;
  postalCode: string;
};

const EMPTY_CONTACT: ContactForm = {
  fullName: "",
  email: "",
  phone: "",
  line1: "",
  line2: "",
  city: "",
  stateRegion: "",
  postalCode: "",
};

/** Simple text input used in the checkout form. */
function CheckoutInput({
  label,
  value,
  onChange,
  placeholder,
  required,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  required?: boolean;
  type?: string;
}) {
  return (
    <div className="space-y-1">
      <label className="text-[11px] uppercase tracking-[0.22em] text-white/45">
        {label}{required && <span className="text-red-400 ml-0.5">*</span>}
      </label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-[12px] border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-white placeholder:text-white/25 focus:border-white/25 focus:outline-none focus:ring-0 transition"
      />
    </div>
  );
}

export function BrandCheckoutView({ brand }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const status = searchParams.get("status");
  const { currency, setCurrency } = useLocale();

  const offerCode = searchParams.get("offerCode") ?? undefined;

  const getCart = useCartStore((s) => s.getCart);
  const getKitItems = useCartStore((s) => s.getKitItems);
  const clearCart = useCartStore((s) => s.clearCart);
  const setCart = useCartStore((s) => s.setCart);
  const cart = getCart(brand);
  const kitItems = getKitItems(brand);

  const { setCountryCode: persistCountryCode } = useCountryPreference();

  const [countries, setCountries] = useState<SupportedCountry[]>([]);
  const [selectedCountry, setSelectedCountry] = useState<CountryCode | "">("");
  const [countryDetail, setCountryDetail] = useState<CountryDetail | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sim, setSim] = useState<BagSimulationResult | null>(null);
  const [simLoading, setSimLoading] = useState(false);

  // Stage 14 — auth + guest checkout state
  /** null = not yet resolved; undefined = not authenticated */
  const [authUser, setAuthUser] = useState<{ email: string; name: string | null } | undefined | null>(null);
  /** null = not yet loaded; true/false = commerce rule result */
  const [allowGuestCheckout, setAllowGuestCheckout] = useState<boolean | null>(null);
  const [contact, setContact] = useState<ContactForm>(EMPTY_CONTACT);

  const isAuthenticated = authUser !== undefined && authUser !== null;
  const isAuthResolved = authUser !== null; // null = loading, undefined = guest

  // ── Resolve auth user on mount ─────────────────────────────────────────────
  useEffect(() => {
    async function resolveAuth() {
      try {
        const supabase = createClient();
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          setAuthUser({
            email: session.user.email ?? "",
            name: session.user.user_metadata?.full_name ?? null,
          });
          // Pre-fill email + name from session
          setContact((prev) => ({
            ...prev,
            email: prev.email || session.user.email || "",
            fullName: prev.fullName || session.user.user_metadata?.full_name || "",
          }));
        } else {
          setAuthUser(undefined); // not authenticated
        }
      } catch {
        setAuthUser(undefined);
      }
    }
    resolveAuth();
  }, []);

  // ── Hydrate cart from backend ──────────────────────────────────────────────
  useEffect(() => {
    async function hydrate() {
      const supabase = createClient();
      const { data } = await supabase.auth.getSession();
      const token = data.session?.access_token ?? null;
      if (!token) return;
      const serverCart = await getBackendCart(brand, token);
      if (serverCart) setCart(brand, serverCart);
    }
    hydrate();
  }, [brand]);

  // ── Load active countries ──────────────────────────────────────────────────
  useEffect(() => {
    getActiveCountries().then((list) => {
      const active = list.filter((c) => c.checkoutEnabled);
      setCountries(active);
      if (active.length > 0 && !selectedCountry) {
        setSelectedCountry(active[0].code);
      }
    });
  }, []);

  // ── Handle country change: update currency, persist preference, load rules ─
  useEffect(() => {
    if (!selectedCountry) return;
    const countryCurrency = COUNTRY_DEFAULT_CURRENCY[selectedCountry as CountryCode];
    if (countryCurrency) setCurrency(countryCurrency);
    persistCountryCode(selectedCountry as CountryCode);

    // Load country detail (commerce rule + policy) for the selected country
    setAllowGuestCheckout(null); // reset while loading
    setCountryDetail(null);
    getCountryDetail(selectedCountry as CountryCode).then((detail) => {
      setAllowGuestCheckout(detail?.commerceRule?.allowGuestCheckout ?? true);
      setCountryDetail(detail);
    }).catch(() => setAllowGuestCheckout(true)); // default to allow on error
  }, [selectedCountry]);

  // ── Clear cart on payment success ─────────────────────────────────────────
  useEffect(() => {
    if (status === "success") clearCart(brand);
  }, [status, brand, clearCart]);

  // ── Re-simulate on cart/country change ────────────────────────────────────
  useEffect(() => {
    if (!selectedCountry || (cart.items.length === 0 && kitItems.length === 0)) {
      setSim(null);
      return;
    }

    let cancelled = false;
    setSimLoading(true);

    async function runSim() {
      const supabase = createClient();
      const { data } = await supabase.auth.getSession();
      const token = data.session?.access_token ?? undefined;

      const result = await simulateBag(
        {
          countryCode: selectedCountry as CountryCode,
          currency,
          items: [
            ...cart.items.map((i) => ({
              type: "product" as const,
              productSlug: i.productSlug,
              quantity: i.quantity,
            })),
            ...kitItems.map((k) => ({
              type: "gift_kit" as const,
              kitId: k.kitId,
              quantity: k.quantity,
            })),
          ],
          offerCode,
        },
        token
      );
      if (!cancelled) {
        setSim(result);
        setSimLoading(false);
      }
    }

    runSim();
    return () => { cancelled = true; };
  }, [selectedCountry, currency, cart.items, kitItems, offerCode]);

  // ── Success state ──────────────────────────────────────────────────────────
  if (status === "success") {
    return (
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex min-h-[55vh] flex-col items-center justify-center gap-8 rounded-[28px] border border-[#C6A96B]/25 bg-[linear-gradient(160deg,rgba(198,169,107,0.08),rgba(0,0,0,0.7))] px-8 py-16 text-center"
      >
        <div className="flex size-16 items-center justify-center rounded-full border border-[#C6A96B]/40 bg-[#C6A96B]/10">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#C6A96B" strokeWidth="2">
            <path d="M20 6L9 17l-5-5" />
          </svg>
        </div>
        <div className="max-w-md">
          <p className="text-[12px] uppercase tracking-[0.3em] text-[#C6A96B]/70">Order confirmed</p>
          <h2 className="mt-3 font-display text-[36px] leading-[1.05] tracking-[-0.5px] text-white">
            Thank you for your purchase.
          </h2>
          <p className="mt-4 text-sm text-white/55">
            A confirmation email is on its way. Your order will be dispatched within 1–2 business days with international tracking.
          </p>
          <div className="mt-6 rounded-[16px] border border-white/8 bg-white/[0.03] p-4 text-left space-y-2 text-sm text-white/50">
            <p>Questions? Reach us at <span className="text-white/75">support@doutrolado.com</span></p>
            <p>Track your order in <span className="text-white/75">My Account → Orders</span></p>
          </div>
        </div>
        <button
          onClick={() => router.push(`/brands/${brand}`)}
          className="rounded-full border border-white/15 px-8 py-3 text-sm uppercase tracking-[0.18em] text-white/70 hover:text-white"
        >
          Continue exploring
        </button>
      </motion.div>
    );
  }

  // ── Cancelled state ────────────────────────────────────────────────────────
  if (status === "cancelled") {
    return (
      <div className="flex min-h-[40vh] flex-col items-center justify-center gap-6 text-center">
        <p className="text-white/55">Payment cancelled. Your bag has been saved.</p>
        <button
          onClick={() => router.push(`/brands/${brand}/cart`)}
          className="rounded-full border border-white/15 px-6 py-3 text-sm uppercase tracking-[0.18em] text-white/70 hover:text-white"
        >
          Back to bag
        </button>
      </div>
    );
  }

  // ── Empty cart guard ───────────────────────────────────────────────────────
  if (cart.items.length === 0 && kitItems.length === 0) {
    return (
      <div className="flex min-h-[40vh] flex-col items-center justify-center gap-6 text-center">
        <p className="text-white/55">Your bag is empty.</p>
        <button
          onClick={() => router.push(`/categories/${brand}`)}
          className="rounded-full border border-[#C6A96B]/60 px-6 py-3 text-sm uppercase tracking-[0.18em] text-[#C6A96B] hover:-translate-y-0.5 transition"
        >
          Browse the collection
        </button>
      </div>
    );
  }

  // ── Derived state ──────────────────────────────────────────────────────────
  const guestIsAllowed = allowGuestCheckout === true;
  const guestIsBlocked = isAuthResolved && !isAuthenticated && allowGuestCheckout === false;
  const showContactForm = selectedCountry && isAuthResolved && (isAuthenticated || guestIsAllowed);

  const kitSubtotalBRL = kitItems.reduce((s, k) => s + k.totalBRL * k.quantity, 0);
  const displayTotalBRL = sim?.totals.adjustedFinalTotalBRL ?? (cart.subtotalBRL + kitSubtotalBRL);
  const hasBlockingIssues = sim !== null && !sim.isValid && sim.blockingIssues.length > 0;
  const appliedOffer = sim?.appliedOffer ?? null;

  // Contact form is required for guests; for auth users it's used to snapshot data.
  const contactValid =
    contact.fullName.trim().length >= 2 &&
    contact.email.trim().includes("@") &&
    contact.phone.trim().length >= 5 &&
    contact.line1.trim().length >= 1 &&
    contact.city.trim().length >= 1 &&
    contact.postalCode.trim().length >= 1;

  const checkoutBlocked =
    submitting ||
    !selectedCountry ||
    simLoading ||
    (sim !== null && !sim.isValid) ||
    guestIsBlocked ||
    !showContactForm ||
    !contactValid;

  // ── Checkout handler ───────────────────────────────────────────────────────
  async function handleCheckout() {
    if (!selectedCountry) return;
    if (sim !== null && !sim.isValid) {
      setError(sim.blockingIssues[0] ?? "Bag is invalid. Please review your items before continuing.");
      return;
    }
    if (guestIsBlocked) {
      setError("Please sign in to complete your order for this destination.");
      return;
    }
    if (!contactValid) {
      setError("Please fill in all required contact and address fields.");
      return;
    }

    setSubmitting(true);
    setError(null);

    const apiBase = process.env.NEXT_PUBLIC_API_URL ?? "/api";

    let token: string | null = null;
    try {
      const supabase = createClient();
      const { data } = await supabase.auth.getSession();
      token = data.session?.access_token ?? null;
    } catch {
      // auth not available — proceed as guest
    }

    const contactPayload = {
      fullName: contact.fullName.trim(),
      email: contact.email.trim().toLowerCase(),
      phone: contact.phone.trim(),
      line1: contact.line1.trim(),
      ...(contact.line2.trim() ? { line2: contact.line2.trim() } : {}),
      city: contact.city.trim(),
      ...(contact.stateRegion.trim() ? { stateRegion: contact.stateRegion.trim() } : {}),
      postalCode: contact.postalCode.trim(),
      countryCode: selectedCountry,
    };

    const payload = {
      brand,
      countryCode: selectedCountry,
      currency,
      items: cart.items.map((i) => ({ productSlug: i.productSlug, quantity: i.quantity })),
      kitItems: kitItems.map((k) => ({ kitId: k.kitId, quantity: k.quantity })),
      offerCode: offerCode ?? undefined,
      contact: contactPayload,
    };

    const headers: Record<string, string> = { "Content-Type": "application/json" };
    if (token) headers.Authorization = `Bearer ${token}`;

    try {
      const res = await fetch(`${apiBase}/stripe/checkout`, {
        method: "POST",
        headers,
        body: JSON.stringify(payload),
      });

      setSubmitting(false);

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        const msg: string = err.message ?? "Failed to start payment. Please try again.";
        // Classify common backend errors into more specific UX messages
        if (/stock|esgotado|unavailable|out of stock/i.test(msg)) {
          setError("One or more items in your bag are no longer available. Please review your cart and try again.");
        } else if (/guest checkout/i.test(msg)) {
          setError("Guest checkout is not available for this destination. Please sign in to continue.");
        } else if (/country|not available|not supported/i.test(msg)) {
          setError("This destination is not currently available for checkout. Please select another country.");
        } else {
          setError(msg);
        }
        return;
      }

      const { data } = await res.json();

      if (data.mode === "stripe" && data.checkoutUrl) {
        window.location.href = data.checkoutUrl;
      } else {
        clearCart(brand);
        router.push(`/brands/${brand}/checkout?status=success`);
      }
    } catch {
      setSubmitting(false);
      setError("Network error — please check your connection and try again.");
    }
  }

  return (
    <div className="grid gap-8 xl:grid-cols-[1fr_0.45fr]">
      {/* Left — destination + contact form */}
      <div className="space-y-6">
        {/* Country selection */}
        <GlassCard className="space-y-6">
          <h2 className="font-display text-[28px] tracking-[-0.4px] text-white">International delivery</h2>
          <div className="space-y-3">
            <label className="text-[12px] uppercase tracking-[0.24em] text-white/50">Destination country</label>
            {countries.length === 0 ? (
              <p className="text-sm text-white/30">Loading available countries…</p>
            ) : (
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {countries.map((country) => (
                  <button
                    key={country.code}
                    onClick={() => setSelectedCountry(country.code)}
                    className={`flex items-center gap-3 rounded-[16px] border px-4 py-4 text-left text-sm transition-all ${
                      selectedCountry === country.code
                        ? "border-[#C6A96B]/60 bg-[rgba(198,169,107,0.08)] text-white"
                        : "border-white/10 bg-white/[0.03] text-white/55 hover:border-white/20"
                    }`}
                  >
                    <span className="text-xl leading-none" aria-hidden>
                      {COUNTRY_FLAGS[country.code] ?? "🌐"}
                    </span>
                    <span className="truncate">{country.name}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
          {/* Policy info for selected country */}
          {selectedCountry && countryDetail?.policy ? (
            <div className="space-y-3">
              {countryDetail.policy.deliveryNote && (
                <div className="rounded-[14px] border border-white/8 bg-black/20 p-4 text-sm text-white/55">
                  <span className="mr-2">🚚</span>{countryDetail.policy.deliveryNote}
                </div>
              )}
              {countryDetail.policy.dutiesAndTaxesSummary && (
                <div className="rounded-[14px] border border-white/8 bg-black/20 p-4 text-sm text-white/55">
                  <span className="mr-2">🧾</span>{countryDetail.policy.dutiesAndTaxesSummary}
                </div>
              )}
              {countryDetail.policy.returnsEnabled && (
                <div className="rounded-[14px] border border-white/8 bg-black/20 p-4 text-sm text-white/55">
                  <span className="mr-2">↩️</span>Returns accepted within {countryDetail.policy.returnsWindowDays} days of delivery.
                </div>
              )}
            </div>
          ) : (
            <div className="rounded-[16px] border border-white/8 bg-black/20 p-4 text-sm text-white/55">
              International tracked shipping. Displayed total includes freight, taxes and all fees.
            </div>
          )}
        </GlassCard>

        {/* Login gate — shown when country blocks guest checkout and user is not auth */}
        {selectedCountry && isAuthResolved && guestIsBlocked && (
          <GlassCard className="space-y-4 border border-amber-400/20 bg-amber-400/5">
            <div className="flex items-start gap-3">
              <svg className="mt-0.5 shrink-0 text-amber-400" width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
              </svg>
              <div>
                <p className="font-medium text-white">Account required for this destination</p>
                <p className="mt-1 text-sm text-white/60">
                  Guest checkout is not available for {countries.find(c => c.code === selectedCountry)?.name ?? selectedCountry}. Please sign in to continue.
                </p>
              </div>
            </div>
            <button
              onClick={() => router.push(`/login?redirect=/brands/${brand}/checkout`)}
              className="w-full rounded-full border border-[#C6A96B]/60 bg-[rgba(198,169,107,0.1)] py-3 text-sm uppercase tracking-[0.18em] text-[#C6A96B] hover:-translate-y-0.5 transition"
            >
              Sign in to my account
            </button>
          </GlassCard>
        )}

        {/* Contact + address form — shown when country is selected and guest is allowed (or auth) */}
        {showContactForm && !guestIsBlocked && (
          <GlassCard className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="font-display text-[22px] tracking-[-0.3px] text-white">Contact &amp; delivery</h3>
              {isAuthenticated ? (
                <span className="rounded-full border border-emerald-400/30 bg-emerald-400/10 px-3 py-1 text-[11px] uppercase tracking-[0.15em] text-emerald-300">
                  Signed in
                </span>
              ) : (
                <span className="rounded-full border border-white/15 bg-white/5 px-3 py-1 text-[11px] uppercase tracking-[0.15em] text-white/50">
                  Guest
                </span>
              )}
            </div>

            {/* Contact info */}
            <div className="space-y-4">
              <p className="text-[11px] uppercase tracking-[0.22em] text-white/35">Contact information</p>
              <div className="grid gap-4 sm:grid-cols-2">
                <CheckoutInput
                  label="Full name"
                  value={contact.fullName}
                  onChange={(v) => setContact((p) => ({ ...p, fullName: v }))}
                  placeholder="Your name"
                  required
                />
                <CheckoutInput
                  label="Email"
                  type="email"
                  value={contact.email}
                  onChange={(v) => setContact((p) => ({ ...p, email: v }))}
                  placeholder="email@example.com"
                  required
                />
              </div>
              <CheckoutInput
                label="Phone / WhatsApp"
                type="tel"
                value={contact.phone}
                onChange={(v) => setContact((p) => ({ ...p, phone: v }))}
                placeholder="+41 79 000 0000"
                required
              />
            </div>

            {/* Shipping address */}
            <div className="space-y-4">
              <p className="text-[11px] uppercase tracking-[0.22em] text-white/35">Shipping address</p>
              <CheckoutInput
                label="Address line 1"
                value={contact.line1}
                onChange={(v) => setContact((p) => ({ ...p, line1: v }))}
                placeholder="Street, number, apartment…"
                required
              />
              <CheckoutInput
                label="Address line 2 (optional)"
                value={contact.line2}
                onChange={(v) => setContact((p) => ({ ...p, line2: v }))}
                placeholder="Building, floor…"
              />
              <div className="grid gap-4 sm:grid-cols-2">
                <CheckoutInput
                  label="City"
                  value={contact.city}
                  onChange={(v) => setContact((p) => ({ ...p, city: v }))}
                  placeholder="Zurich"
                  required
                />
                <CheckoutInput
                  label="State / Canton / Region"
                  value={contact.stateRegion}
                  onChange={(v) => setContact((p) => ({ ...p, stateRegion: v }))}
                  placeholder="ZH"
                />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <CheckoutInput
                  label="Postal code"
                  value={contact.postalCode}
                  onChange={(v) => setContact((p) => ({ ...p, postalCode: v }))}
                  placeholder="8001"
                  required
                />
                <div className="space-y-1">
                  <label className="text-[11px] uppercase tracking-[0.22em] text-white/45">Country</label>
                  <div className="flex items-center gap-2 rounded-[12px] border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-white/60">
                    <span>{COUNTRY_FLAGS[selectedCountry as CountryCode] ?? "🌐"}</span>
                    <span>{countries.find(c => c.code === selectedCountry)?.name ?? selectedCountry}</span>
                  </div>
                </div>
              </div>
            </div>
          </GlassCard>
        )}
      </div>

      {/* Right — order summary */}
      <GlassCard className="h-fit space-y-5">
        <p className="text-[12px] uppercase tracking-[0.28em] text-white/45">Order summary</p>

        <div className="space-y-3">
          {cart.items.map((item) => (
            <div key={item.productSlug} className="flex items-center justify-between text-sm">
              <span className="truncate text-white/70">
                {item.productName} × {item.quantity}
              </span>
              <PriceDisplay brl={item.lineTotalBRL} className="shrink-0 text-white" />
            </div>
          ))}
        </div>

        <div className="border-t border-white/10 pt-4 space-y-3">
          <div className="flex justify-between text-sm">
            <span className="text-white/55">Total</span>
            {simLoading ? (
              <span className="text-white/30 text-xs">calculating…</span>
            ) : (
              <PriceDisplay brl={displayTotalBRL} className="font-semibold text-white" />
            )}
          </div>
        </div>

        {/* Checkout notice from country policy */}
        {countryDetail?.policy?.checkoutNotice && (
          <div className="rounded-[14px] border border-white/8 bg-white/[0.02] px-4 py-3 text-[12px] text-white/45">
            {countryDetail.policy.checkoutNotice}
          </div>
        )}

        {appliedOffer && (
          <div className="rounded-[14px] border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-300">
            <strong>{appliedOffer.discountPercent}% discount</strong> applied (code <strong>{appliedOffer.code}</strong>)
          </div>
        )}

        {hasBlockingIssues && (
          <div className="rounded-[14px] border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-300">
            {sim!.blockingIssues[0]}
          </div>
        )}

        {error && (
          <div className="rounded-[14px] border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
            {error}
          </div>
        )}

        <Button
          onClick={handleCheckout}
          disabled={checkoutBlocked}
          className="w-full"
        >
          {submitting ? "Redirecting…" : "Proceed to payment"}
        </Button>

        <p className="text-center text-[11px] text-white/30">
          Secure payment via Stripe. Your card details are never stored.
        </p>

        {/* Support contact from policy */}
        {countryDetail?.policy?.supportEmail && (
          <p className="text-center text-[11px] text-white/25">
            Need help? <a href={`mailto:${countryDetail.policy.supportEmail}`} className="text-white/45 hover:text-white/70 transition">{countryDetail.policy.supportEmail}</a>
          </p>
        )}
      </GlassCard>
    </div>
  );
}
