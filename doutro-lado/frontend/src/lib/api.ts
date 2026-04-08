import type { ApiEnvelope } from "@/lib/types";

const FETCH_TIMEOUT_MS = 10_000;

function getApiBaseUrl(): string {
  // Server-side: hit the backend directly, bypassing the HTTP round-trip through
  // Next.js rewrites. Priority: INTERNAL_API_URL > NEXT_PUBLIC_API_URL > port fallback.
  if (typeof window === "undefined") {
    const internal = process.env.INTERNAL_API_URL?.trim();
    if (internal) return internal.replace(/\/$/, "");

    const pub = process.env.NEXT_PUBLIC_API_URL?.trim();
    if (pub) return pub.replace(/\/$/, "");

    const port = process.env.INTERNAL_API_PORT || "4000";
    return `http://127.0.0.1:${port}/api`;
  }

  // Client-side: use the explicit public URL when provided (local dev), otherwise
  // use a relative path so Next.js rewrites proxy the request to the backend.
  const pub = process.env.NEXT_PUBLIC_API_URL?.trim();
  if (pub) return pub.replace(/\/$/, "");

  return "/api";
}

type FetchApiOptions = {
  token?: string;
  revalidate?: number;
  method?: string;
  body?: unknown;
};

/**
 * Fetches data from the internal API and returns the typed payload, or null on
 * any failure. Failures on the server side are logged for observability.
 *
 * A 10-second AbortController timeout prevents server-side renders from hanging
 * indefinitely when the backend is slow or unreachable.
 */
export async function fetchApiData<T>(
  path: string,
  options: FetchApiOptions = {}
): Promise<T | null> {
  const apiBaseUrl = getApiBaseUrl();
  const url = `${apiBaseUrl}${path}`;
  const method = options.method ?? "GET";

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

  try {
    const headers: Record<string, string> = {};
    if (options.token) headers["Authorization"] = `Bearer ${options.token}`;
    if (options.body) headers["Content-Type"] = "application/json";

    const response = await fetch(url, {
      method,
      headers: Object.keys(headers).length ? headers : undefined,
      body: options.body ? JSON.stringify(options.body) : undefined,
      signal: controller.signal,
      // Apply Next.js ISR revalidation only for GET requests (mutations are never cached).
      ...(method === "GET" ? { next: { revalidate: options.revalidate ?? 60 } } : {}),
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      // Log non-2xx responses server-side for observability (client-side errors
      // are visible in browser DevTools and are not logged here to avoid noise).
      if (typeof window === "undefined") {
        console.error(`[api] ${method} ${path} → ${response.status} ${response.statusText}`);
      }
      return null;
    }

    const payload = (await response.json()) as ApiEnvelope<T>;
    return payload.ok ? payload.data : null;
  } catch (error) {
    clearTimeout(timeoutId);

    if (typeof window === "undefined") {
      const message = error instanceof Error ? error.message : String(error);
      const tag = controller.signal.aborted ? "timeout" : "fetch-error";
      console.error(`[api] ${method} ${path} — ${tag}: ${message}`);
    }

    return null;
  }
}
