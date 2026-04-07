import { createBrowserClient } from "@supabase/ssr";

/**
 * Returns a Supabase client for use in browser (client) components.
 * Call inside components, not at module level, to ensure env vars are available.
 */
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
