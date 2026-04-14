import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { AdminSidebar } from "@/features/admin/AdminSidebar";

/**
 * Admin layout — server component.
 *
 * Auth strategy:
 *  1. `supabase.auth.getUser()` validates the Supabase JWT (via API call).
 *     This is the only reliable SSR auth method — getSession() is not used
 *     because it cannot safely reconstruct the session from cookies in
 *     Next.js server components.
 *
 *  2. Profile + role are fetched directly from Supabase REST API using the
 *     service role key (server-only env var). This bypasses the backend
 *     /auth/session endpoint entirely, eliminating the JWT re-verification
 *     chain that was failing silently.
 *
 * Failure modes handled explicitly:
 *  - No session       → redirect /login
 *  - Profile not found / service unavailable → recoverable error screen
 *  - Role != admin    → redirect /
 *  - Role == admin    → render admin UI
 */

type ProfileRow = {
  id: string;
  email: string;
  role: string;
  full_name: string | null;
  is_active: boolean;
};

/**
 * fetchProfileByAuthUserId — legitimate server-to-server use of service role.
 *
 * This function is called ONLY after supabase.auth.getUser() has already
 * validated the user's JWT. The service role key is used here exclusively to
 * read the user's own profile from the database (bypassing RLS is necessary
 * because the profile lookup must resolve role before a user session is
 * established). It is NEVER used as a substitute for a user session token.
 *
 * Do NOT replicate this pattern in page components — use requireAdminToken()
 * from @/lib/admin-server-auth instead.
 */
async function fetchProfileByAuthUserId(authUserId: string): Promise<ProfileRow | null> {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";

  if (!supabaseUrl || !serviceKey) {
    console.error("[admin/layout] SUPABASE_SERVICE_ROLE_KEY or SUPABASE_URL not set");
    return null;
  }

  try {
    const res = await fetch(
      `${supabaseUrl}/rest/v1/profiles?auth_user_id=eq.${encodeURIComponent(authUserId)}&select=id,email,role,full_name,is_active&limit=1`,
      {
        headers: {
          apikey: serviceKey,
          Authorization: `Bearer ${serviceKey}`,
        },
        cache: "no-store",
      }
    );

    if (!res.ok) {
      console.error("[admin/layout] Supabase REST profiles query failed", {
        status: res.status,
        statusText: res.statusText,
      });
      return null;
    }

    const rows: ProfileRow[] = await res.json();
    return rows[0] ?? null;
  } catch (err) {
    console.error("[admin/layout] Supabase REST profiles query threw", {
      error: err instanceof Error ? err.message : String(err),
    });
    return null;
  }
}

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();

  // getUser() is the only reliable SSR auth check — validates JWT via Supabase API.
  const { data: { user }, error: userError } = await supabase.auth.getUser();

  if (!user || userError) {
    redirect("/login?redirect=/admin");
  }

  const profile = await fetchProfileByAuthUserId(user.id);

  // Backend/Supabase unreachable or profile not yet created.
  if (!profile) {
    console.error("[admin/layout] Profile not found or service unavailable", {
      uid: user.id,
      email: user.email,
    });

    return (
      <div className="min-h-screen bg-[linear-gradient(180deg,#080808,#040404)] text-white flex items-center justify-center px-6">
        <div className="text-center space-y-5 max-w-sm">
          <p className="text-[10px] uppercase tracking-[0.28em] text-[#C6A96B]">
            Painel Admin — D&apos;OUTRO LADO
          </p>
          <p className="text-white/70 text-sm leading-relaxed">
            Perfil não encontrado ou serviço indisponível.
            <br />
            Aguarde um momento e tente novamente.
          </p>
          <p className="text-white/30 text-xs">Autenticado como: {user.email}</p>
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

  // User is authenticated but not admin.
  if (profile.role !== "admin") {
    redirect("/");
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(ellipse_at_top,rgba(198,169,107,0.09),transparent_36%),linear-gradient(180deg,#080808,#040404)] text-white">
      <div className="mx-auto flex max-w-[1600px] gap-0">
        <AdminSidebar
          email={profile.email}
          name={profile.full_name ?? "Admin"}
        />
        <main className="min-h-screen flex-1 overflow-auto px-4 pb-8 pt-20 md:px-8 md:py-8 lg:px-10 lg:py-10">
          {children}
        </main>
      </div>
    </div>
  );
}
