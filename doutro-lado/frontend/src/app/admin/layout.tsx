import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { fetchApiData } from "@/lib/api";
import type { AuthProfile } from "@/lib/types";
import { AdminSidebar } from "@/features/admin/AdminSidebar";

/**
 * Admin layout — server component.
 *
 * Failure modes handled explicitly:
 *  1. No Supabase session → redirect to /login
 *  2. Backend unreachable / JWT error → show service-unavailable screen (NOT redirect to /)
 *  3. Profile found but role != admin → redirect to / (user is authenticated, just not admin)
 *  4. Everything OK → render admin UI
 *
 * This distinction is critical: previously ALL failures (including backend cold
 * starts and JWT mismatches) silently redirected to /, making the admin appear
 * to not exist rather than exposing the real cause.
 */
export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();

  // getUser() validates the JWT against Supabase — do not use getSession() here
  // as it only reads cookies without server-side validation.
  const { data: { user }, error: userError } = await supabase.auth.getUser();

  if (!user || userError) {
    redirect("/login?redirect=/admin");
  }

  // After getUser() validates/refreshes the token, getSession() returns the
  // (possibly refreshed) access_token from the cookie store.
  const { data: { session } } = await supabase.auth.getSession();
  const token = session?.access_token ?? "";

  const profile = await fetchApiData<AuthProfile>("/auth/session", {
    token,
    revalidate: 0,
  });

  // ── Failure mode 2: backend unreachable or JWT verification failed ──────────
  // profile === null means fetchApiData got a non-2xx response or threw.
  // The user IS authenticated with Supabase, so we do NOT redirect to /.
  // Show a recoverable error screen instead.
  if (!profile) {
    console.error("[admin/layout] /auth/session returned null", {
      email: user.email,
      uid: user.id,
      hasToken: !!token,
      tokenLength: token.length,
    });

    return (
      <div className="min-h-screen bg-[linear-gradient(180deg,#080808,#040404)] text-white flex items-center justify-center px-6">
        <div className="text-center space-y-5 max-w-sm">
          <p className="text-[10px] uppercase tracking-[0.28em] text-[#C6A96B]">
            Painel Admin — D&apos;OUTRO LADO
          </p>
          <p className="text-white/70 text-sm leading-relaxed">
            Serviço temporariamente indisponível.
            <br />
            O servidor está inicializando ou houve falha na verificação do token.
          </p>
          <p className="text-white/30 text-xs">
            Autenticado como: {user.email}
          </p>
          <a
            href="/admin"
            className="inline-block rounded-full border border-[#C6A96B]/40 px-6 py-2.5 text-xs uppercase tracking-[0.18em] text-[#C6A96B] transition hover:border-[#C6A96B]"
          >
            Tentar novamente
          </a>
        </div>
      </div>
    );
  }

  // ── Failure mode 3: authenticated but not admin ─────────────────────────────
  if (profile.role !== "admin") {
    redirect("/");
  }

  // ── Success: render admin UI ────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-[radial-gradient(ellipse_at_top,rgba(198,169,107,0.09),transparent_36%),linear-gradient(180deg,#080808,#040404)] text-white">
      <div className="mx-auto flex max-w-[1600px] gap-0">
        <AdminSidebar email={profile.email} name={profile.fullName ?? "Admin"} />
        <main className="min-h-screen flex-1 overflow-auto px-8 py-8 lg:px-10 lg:py-10">
          {children}
        </main>
      </div>
    </div>
  );
}
