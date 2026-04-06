import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t border-white/10 bg-black px-6 py-16 text-white/60">
      <div className="mx-auto grid max-w-luxe gap-12 lg:grid-cols-[1.2fr_0.8fr_0.8fr] lg:px-2">
        <div className="space-y-4">
          <p className="text-[13px] uppercase tracking-[0.28em] text-white/35">Quiet luxury export house</p>
          <h2 className="max-w-md font-display text-[36px] leading-[1.05] tracking-[-0.5px] text-white">
            Curadoria brasileira com operacao internacional refinada.
          </h2>
        </div>
        <div className="space-y-3">
          <p className="text-sm uppercase tracking-[0.2em] text-white/35">Explorar</p>
          <Link href="/brands/casa" className="block hover:text-white">Casa</Link>
          <Link href="/brands/moda" className="block hover:text-white">Moda</Link>
          <Link href="/gift-builder" className="block hover:text-white">Kits premium</Link>
        </div>
        <div className="space-y-3">
          <p className="text-sm uppercase tracking-[0.2em] text-white/35">Operacao</p>
          <Link href="/international-shipping" className="block hover:text-white">Envio internacional</Link>
          <Link href="/wholesale" className="block hover:text-white">Atacado</Link>
          <Link href="/admin" className="block hover:text-white">Admin</Link>
        </div>
      </div>
    </footer>
  );
}
