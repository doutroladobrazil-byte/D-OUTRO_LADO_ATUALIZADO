import Link from "next/link";
import { adminLinks } from "@/styles/tokens";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,rgba(198,169,107,0.12),transparent_26%),linear-gradient(180deg,#090909,#050505)] px-4 py-4 text-white">
      <div className="mx-auto grid max-w-luxe gap-4 lg:grid-cols-[280px_1fr]">
        <aside className="rounded-[28px] border border-white/10 bg-white/[0.04] p-6 shadow-halo backdrop-blur-2xl">
          <p className="text-[12px] uppercase tracking-[0.28em] text-white/38">Admin premium</p>
          <h1 className="mt-4 font-display text-[36px] tracking-[-0.5px] text-white">D&apos;OUTRO LADO</h1>
          <nav className="mt-8 space-y-2">
            {adminLinks.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="block rounded-[18px] border border-transparent px-4 py-3 text-sm uppercase tracking-[0.18em] text-white/58 transition duration-300 hover:-translate-y-0.5 hover:border-white/10 hover:bg-white/[0.04] hover:text-white"
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </aside>
        <section className="rounded-[28px] border border-white/10 bg-white/[0.03] p-6 shadow-halo backdrop-blur-2xl lg:p-8">
          {children}
        </section>
      </div>
    </main>
  );
}
