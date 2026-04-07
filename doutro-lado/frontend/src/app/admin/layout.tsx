import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { fetchApiData } from "@/lib/api";
import type { AuthProfile } from "@/lib/types";
import { adminLinks } from "@/styles/tokens";

/**
 * Admin layout — server component.
 * Enforces: (1) authenticated session, (2) admin role.
 * Middleware already blocks unauthenticated access; this adds role enforcement.
 */
export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login?redirect=/admin");

  const { data: { session } } = await supabase.auth.getSession();
  const profile = await fetchApiData<AuthProfile>("/auth/session", {
    token: session?.access_token,
    revalidate: 0,
  });

  if (profile?.role !== "admin") redirect("/");

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,rgba(198,169,107,0.12),transparent_26%),linear-gradient(180deg,#090909,#050505)] px-4 py-4 text-white">
      <div className="mx-auto grid max-w-luxe gap-4 lg:grid-cols-[280px_1fr]">
        <aside className="rounded-[28px] border border-white/10 bg-white/[0.04] p-6 shadow-halo backdrop-blur-2xl">
          <p className="text-[12px] uppercase tracking-[0.28em] text-white/38">Admin premium</p>
          <h1 className="mt-4 font-display text-[36px] tracking-[-0.5px] text-white">D&apos;OUTRO LADO</h1>
          <p className="mt-1 truncate text-[12px] text-white/38">{profile.email}</p>
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
