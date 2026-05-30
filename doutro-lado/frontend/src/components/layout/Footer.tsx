import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t border-ink-ghost/30 bg-surface px-4 py-10 text-ink-mid md:px-6 md:py-16">
      <div className="mx-auto max-w-luxe space-y-10">
        {/* Trust strip */}
        <div className="grid grid-cols-1 gap-3 border-b border-ink-ghost/25 pb-10 sm:grid-cols-2 md:grid-cols-4">
          {[
            { label: "Secure checkout", sub: "Stripe · end-to-end encrypted" },
            { label: "International shipping", sub: "CH · IE · DE · IS · SG · US" },
            { label: "Premium leather", sub: "Brazilian bovine, certified" },
            { label: "Support", sub: "Contact per destination country" },
          ].map((item) => (
            <div key={item.label}>
              <p className="text-[11px] uppercase tracking-[0.22em] text-ink-soft">{item.label}</p>
              <p className="mt-1 text-[11px] text-ink-ghost">{item.sub}</p>
            </div>
          ))}
        </div>

        {/* Main footer columns */}
        <div className="grid gap-10 lg:grid-cols-[1.2fr_0.8fr_0.8fr] lg:gap-12 lg:px-2">
          <div className="space-y-4">
            <p className="text-[13px] uppercase tracking-[0.28em] text-ink-soft">Moda premium — origem brasileira</p>
            <h2 className="max-w-md font-display text-[26px] leading-[1.05] tracking-[-0.5px] text-ink md:text-[36px]">
              Couro, moda e acessórios com operação internacional refinada.
            </h2>
          </div>
          <div className="space-y-3">
            <p className="text-sm uppercase tracking-[0.2em] text-ink-soft">Explorar</p>
            <Link href="/brands/moda" className="block hover:text-ink transition">Coleções</Link>
            <Link href="/gift-builder" className="block hover:text-ink transition">Kits premium</Link>
            <Link href="/wholesale" className="block hover:text-ink transition">Atacado</Link>
          </div>
          <div className="space-y-3">
            <p className="text-sm uppercase tracking-[0.2em] text-ink-soft">Operação</p>
            <Link href="/brands/moda/checkout" className="block hover:text-ink transition">Checkout</Link>
            <Link href="/wholesale" className="block hover:text-ink transition">Atacado</Link>
            <Link href="/admin" className="block hover:text-ink transition">Admin</Link>
          </div>
        </div>

        <p className="text-[11px] text-ink-ghost">
          © {new Date().getFullYear()} D'OUTRO LADO. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
