import type { ApiEnvelope } from "@/lib/types";

function getApiBaseUrl(): string {
  // Server-side: hit the backend directly, bypassing the HTTP round-trip through Next.js rewrites.
  // Priority: INTERNAL_API_URL > NEXT_PUBLIC_API_URL > construct from INTERNAL_API_PORT.
  if (typeof window === "undefined") {
    const internal = process.env.INTERNAL_API_URL?.trim();
    if (internal) return internal.replace(/\/$/, "");

    const pub = process.env.NEXT_PUBLIC_API_URL?.trim();
    if (pub) return pub.replace(/\/$/, "");

    const port = process.env.INTERNAL_API_PORT || "4000";
    return `http://127.0.0.1:${port}/api`;
  }

  // Client-side: use the explicit public URL when provided (local dev), otherwise use a
  // relative path so Next.js rewrites proxy the request to the backend internally.
  const pub = process.env.NEXT_PUBLIC_API_URL?.trim();
  if (pub) return pub.replace(/\/$/, "");

  return "/api";
}

type FetchApiOptions = {
  token?: string;
  revalidate?: number;
};

export async function fetchApiData<T>(path: string, options: FetchApiOptions = {}) {
  const apiBaseUrl = getApiBaseUrl();

  try {
    const response = await fetch(`${apiBaseUrl}${path}`, {
      headers: options.token ? { Authorization: `Bearer ${options.token}` } : undefined,
      next: { revalidate: options.revalidate ?? 60 }
    });

    if (!response.ok) {
      return null;
    }

    const payload = (await response.json()) as ApiEnvelope<T>;
    return payload.ok ? payload.data : null;
  } catch {
    return null;
  }
}
