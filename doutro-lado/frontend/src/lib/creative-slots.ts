import "server-only";
import { createServiceClient } from "@/lib/supabase/service";

export type CreativeSlotData = {
  id: string;
  slotKey: string;
  mediaType: "image" | "video";
  publicUrl: string;
  mobilePublicUrl: string | null;
  posterPublicUrl: string | null;
  altText: string | null;
  linkHref: string | null;
  displayOrder: number;
};

/**
 * Fetch active creative slots for the given keys.
 * Returns a Map of slotKey → first matching creative (lowest displayOrder).
 * Silently returns empty Map on any error — callers render fallback gradients.
 */
export async function getCreativeSlots(
  slotKeys: string[],
  options?: { locale?: string; marketCode?: string },
): Promise<Map<string, CreativeSlotData>> {
  const result = new Map<string, CreativeSlotData>();
  if (slotKeys.length === 0) return result;

  try {
    const supabase = createServiceClient();
    const now = new Date().toISOString();

    const { data, error } = await supabase
      .from("creative_slots")
      .select(
        "id, slot_key, media_type, public_url, mobile_public_url, poster_public_url, alt_text, link_href, locale, market_code, display_order, start_at, end_at",
      )
      .in("slot_key", slotKeys)
      .eq("is_active", true)
      .order("display_order", { ascending: true });

    if (error || !data) return result;

    for (const row of data) {
      // Scheduling filter — done client-side since PostgREST OR+null combos are verbose
      if (row.start_at && row.start_at > now) continue;
      if (row.end_at && row.end_at < now) continue;

      // locale/marketCode match (global = no locale/marketCode set)
      if (options?.locale && row.locale && row.locale !== options.locale) continue;
      if (options?.marketCode && row.market_code && row.market_code !== options.marketCode) continue;

      if (!result.has(row.slot_key)) {
        result.set(row.slot_key, {
          id: row.id,
          slotKey: row.slot_key,
          mediaType: row.media_type as "image" | "video",
          publicUrl: row.public_url,
          mobilePublicUrl: row.mobile_public_url ?? null,
          posterPublicUrl: row.poster_public_url ?? null,
          altText: row.alt_text ?? null,
          linkHref: row.link_href ?? null,
          displayOrder: row.display_order,
        });
      }
    }
  } catch {
    // Silent fallback — homepage renders gradient placeholders
  }

  return result;
}
