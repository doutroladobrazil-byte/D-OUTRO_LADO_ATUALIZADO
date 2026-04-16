import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t border-white/10 bg-black px-4 py-10 text-white/60 md:px-6 md:py-16">
      <div className="mx-auto max-w-luxe space-y-10">
        {/* Trust strip */}
        <div className="grid grid-cols-2 gap-3 border-b border-white/8 pb-10 md:grid-cols-4">
          {[
            { label: "Secure checkout", sub: "Stripe · end-to-end encrypted" },
            { label: "International shipping", sub: "CH · IE · DE · IS · SG · US" },
            { label: "Premium leather", sub: "Brazilian bovine, certified" },
            { label: "Support", sub: "Contact per destination country" },
          ].map((item) => (
            <div key={item.label}>
              <p className="text-[11px] uppercase tracking-[0.22em] text-white/45">{item.label}</p>
              <p className="mt-1 text-[11px] text-white/25">{item.sub}</p>
            </div>
          ))}
        </div>

        {/* Main footer columns */}
        <div className="grid gap-10 lg:grid-cols-[1.2fr_0.8fr_0.8fr] lg:gap-12 lg:px-2">
          <div className="space-y-4">
            <p className="text-[13px] uppercase tracking-[0.28em] text-white/35">Moda premium — origem brasileira</p>
            <h2 className="max-w-md font-display text-[26px] leading-[1.05] tracking-[-0.5px] text-white md:text-[36px]">
              Couro, moda e acessórios com operação internacional refinada.
            </h2>
          </div>
          <div className="space-y-3">
            <p className="text-sm uppercase tracking-[0.2em] text-white/35">Explorar</p>
            <Link href="/brands/moda" className="block hover:text-white transition">Coleções</Link>
            <Link href="/gift-builder" className="block hover:text-white transition">Kits premium</Link>
            <Link href="/brands/moda" className="block hover:text-white transition">Busca</Link>
          </div>
          <div className="space-y-3">
            <p className="text-sm uppercase tracking-[0.2em] text-white/35">Operação</p>
            <Link href="/brands/moda/checkout" className="block hover:text-white transition">Envio internacional</Link>
            <Link href="/wholesale" className="block hover:text-white transition">Atacado</Link>
            <Link href="/admin" className="block hover:text-white transition">Admin</Link>
          </div>
        </div>

        <p className="text-[11px] text-white/20">
          © {new Date().getFullYear()} D'OUTRO LADO. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
