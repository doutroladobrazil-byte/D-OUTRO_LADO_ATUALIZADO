import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import type { SupabaseClient } from "@supabase/supabase-js";

// No-op server client for builds without Supabase credentials.
// auth.getUser() / getSession() return null user/session — protected routes
// redirect to /login, public pages render normally.
const UNCONFIGURED: SupabaseClient = {
  auth: {
    getUser: async () => ({ data: { user: null }, error: null }),
    getSession: async () => ({ data: { session: null }, error: null }),
    exchangeCodeForSession: async () => ({
      data: { user: null, session: null },
      error: { message: "Supabase not configured", name: "AuthError", status: 0 } as never,
    }),
  },
} as unknown as SupabaseClient;

/**
 * Returns a Supabase client for use in Server Components, Server Actions,
 * and Route Handlers. Returns a no-op client when env vars are not set.
 */
export async function createClient(): Promise<SupabaseClient> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return UNCONFIGURED;

  const cookieStore = await cookies();

  return createServerClient(url, key, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(
        cookiesToSet: { name: string; value: string; options?: Record<string, unknown> }[]
      ) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            cookieStore.set(name, value, options as any)
          );
        } catch {
          // Called from a Server Component — the middleware handles session
          // cookie refresh on the response path instead.
        }
      },
    },
  });
}
