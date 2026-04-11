import { createBrowserClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";

// Minimal no-op client returned when env vars are not configured.
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
 * Module-level singleton — one browser client for the entire session.
 *
 * Creating multiple `createBrowserClient` instances in the same tab causes
 * duplicated `onAuthStateChange` listeners and can break token refresh
 * synchronisation. This singleton ensures all callers share the same instance
 * and its internal token/cookie state.
 */
let _client: SupabaseClient | null = null;

export function createClient(): SupabaseClient {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return UNCONFIGURED;
  if (!_client) {
    _client = createBrowserClient(url, key);
  }
  return _client;
}
