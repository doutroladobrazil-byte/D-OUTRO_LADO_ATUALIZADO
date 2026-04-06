import type { ApiEnvelope } from "@/lib/types";

function getApiBaseUrl() {
  const value = process.env.NEXT_PUBLIC_API_URL?.trim();
  return value ? value.replace(/\/$/, "") : null;
}

type FetchApiOptions = {
  token?: string;
  revalidate?: number;
};

export async function fetchApiData<T>(path: string, options: FetchApiOptions = {}) {
  const apiBaseUrl = getApiBaseUrl();
  if (!apiBaseUrl) return null;

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
