export type SearchParamsInput =
  | Record<string, string | string[] | undefined>
  | URLSearchParams
  | undefined;

export type TrackingParams = Partial<Record<
  | "utm_source"
  | "utm_medium"
  | "utm_campaign"
  | "utm_term"
  | "utm_content"
  | "gclid"
  | "fbclid",
  string
>>;

const TRACKING_KEYS = [
  "utm_source",
  "utm_medium",
  "utm_campaign",
  "utm_term",
  "utm_content",
  "gclid",
  "fbclid"
] as const;

export function extractTrackingParams(searchParams: SearchParamsInput): TrackingParams {
  if (!searchParams) return {};

  const tracking: TrackingParams = {};

  for (const key of TRACKING_KEYS) {
    const value =
      searchParams instanceof URLSearchParams
        ? searchParams.get(key)
        : searchParams[key];

    if (typeof value === "string" && value.trim()) {
      tracking[key] = value.trim();
    } else if (Array.isArray(value) && value[0]?.trim()) {
      tracking[key] = value[0].trim();
    }
  }

  return tracking;
}

export function buildTrackedHref(path: string, tracking: TrackingParams = {}) {
  const params = new URLSearchParams();

  for (const [key, value] of Object.entries(tracking)) {
    if (value) params.set(key, value);
  }

  const query = params.toString();
  return query ? `${path}?${query}` : path;
}

export function formatTrackingSummary(tracking: TrackingParams) {
  const activeKeys = Object.entries(tracking).filter(([, value]) => Boolean(value));
  if (activeKeys.length === 0) {
    return "Sem parametros de campanha ativos.";
  }

  return activeKeys.map(([key, value]) => `${key}: ${value}`).join(" • ");
}
