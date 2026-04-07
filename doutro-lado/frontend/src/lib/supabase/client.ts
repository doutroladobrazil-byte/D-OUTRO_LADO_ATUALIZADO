import { createBrowserClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";

// Minimal no-op client returned when env vars are not configured.
// Lets static pages build and render without Supabase credentials while
// keeping the rest of the codebase's auth contract intact.
const UNCONFIGURED: SupabaseClient = {
  auth: {
    getSession: async () => ({ data: { session: null }, error: null }),
    getUser: async () => ({ data: { user: null }, error: null }),
    onAuthStateChange: () => ({
      data: { subscription: { unsubscribe: () => {}, id: "", callback: () => {} } },
    }),
    signInWithPassword: async () => ({
      data: { user: null, session: null },
      error: { message: "Supabase not configured", name: "AuthError", status: 0 } as never,
    }),
    signUp: async () => ({
      data: { user: null, session: null },
      error: { message: "Supabase not configured", name: "AuthError", status: 0 } as never,
    }),
    signInWithOAuth: async () => ({ data: { provider: "google", url: "" }, error: null }),
    signOut: async () => ({ error: null }),
  },
} as unknown as SupabaseClient;

/**
 * Returns a Supabase client for use in browser (client) components.
 * Returns a no-op client when env vars are not configured, allowing static
 * pages to render without crashing the build.
 */
export function createClient(): SupabaseClient {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return UNCONFIGURED;
  return createBrowserClient(url, key);
}
