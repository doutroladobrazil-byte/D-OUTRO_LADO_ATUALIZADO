import "server-only";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

/**
 * requireAdminToken — server-only helper for admin SSR pages.
 *
 * Validates the current request via supabase.auth.getUser(), which performs a
 * network round-trip to the Supabase Auth API and is reliable in Next.js SSR
 * (unlike getSession(), which only reads cookies without re-validating the JWT).
 *
 * If the user is valid, the real user access token is returned so it can be
 * forwarded to backend admin endpoints. The service role key is NEVER used
 * as a fallback — pages fail safely instead.
 *
 * Role enforcement (admin-only) is the responsibility of admin/layout.tsx,
 * which runs on every request and redirects non-admin users before any page
 * component renders. This helper focuses solely on safe token retrieval.
 *
 * Failure modes:
 *   - No authenticated user → redirect /login?redirect=/admin
 *   - getUser returns error → redirect /login?redirect=/admin
 *   - Session token absent after getUser() passes → redirect /login?redirect=/admin
 *
 * NEVER add ?? process.env.SUPABASE_SERVICE_ROLE_KEY as a fallback here.
 */
export async function requireAdminToken(): Promise<string> {
  const supabase = await createClient();

  // Validate the JWT via Supabase Auth API — the only reliable SSR auth check.
  const { data: { user }, error } = await supabase.auth.getUser();
  if (!user || error) {
    redirect("/login?redirect=/admin");
  }

  // Read the session cookie to extract the access token.
  // This succeeds when getUser() passes because the same cookie carries both.
  const { data: { session } } = await supabase.auth.getSession();
  if (!session?.access_token) {
    // Validated user but no recoverable session token — redirect rather than escalate.
    redirect("/login?redirect=/admin");
  }

  return session.access_token;
}
