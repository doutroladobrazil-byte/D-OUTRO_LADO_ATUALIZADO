/**
 * Next.js middleware — runs on every request before it hits a page or API route.
 *
 * Primary responsibility: refresh the Supabase auth session cookie so that
 * Server Components always receive a valid, non-expired token. Without this
 * the session expires mid-navigation and the user appears logged out even
 * though their Supabase Auth session is still alive.
 *
 * The @supabase/ssr createServerClient + setAll cookie pattern is the official
 * Supabase recommendation for Next.js App Router session management.
 */

import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  // Skip entirely when Supabase is not configured (CI builds, static export).
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return NextResponse.next({ request });

  // We create a mutable response object so that the cookie setAll callback can
  // attach refreshed session cookies to the outgoing response.
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(url, key, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet: { name: string; value: string; options?: Record<string, unknown> }[]) {
        // 1. Write cookies onto the mutated request (so the same middleware
        //    invocation can read them if needed downstream).
        cookiesToSet.forEach(({ name, value }) =>
          request.cookies.set(name, value)
        );
        // 2. Rebuild the response so the new cookies are on the outgoing headers.
        supabaseResponse = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) =>
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          supabaseResponse.cookies.set(name, value, options as any)
        );
      },
    },
  });

  // getUser() validates the token with the Supabase Auth server and, when the
  // access token has expired, exchanges the refresh token for a new pair and
  // stores the updated cookies via the setAll callback above.
  //
  // IMPORTANT: do NOT use getSession() here — it trusts cookies without server
  // validation, making it unsuitable for security decisions in middleware.
  await supabase.auth.getUser();

  return supabaseResponse;
}

export const config = {
  // Run on all routes except Next.js internals, static files, and direct API
  // calls (those are proxied by Next.js rewrites, not processed by middleware).
  matcher: [
    "/((?!_next/static|_next/image|favicon\\.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
