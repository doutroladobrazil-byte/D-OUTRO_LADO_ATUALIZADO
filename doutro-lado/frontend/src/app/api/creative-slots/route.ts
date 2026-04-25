import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/service";

export const dynamic = "force-dynamic";

/**
 * GET /api/creative-slots?slotKeys=home.hero,home.category.new-in&locale=en
 * Public read-only endpoint. Returns only active slots within their schedule.
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const slotKeysParam = searchParams.getAll("slotKeys").join(",");
    const slotKeys = slotKeysParam
      .split(",")
      .map((k) => k.trim())
      .filter(Boolean);

    if (slotKeys.length === 0) {
      return NextResponse.json([]);
    }

    const supabase = createServiceClient();
    const now = new Date().toISOString();

    const { data, error } = await supabase
      .from("creative_slots")
      .select(
        "id, slot_key, media_type, public_url, mobile_public_url, poster_public_url, alt_text, link_href, display_order, start_at, end_at",
      )
      .in("slot_key", slotKeys)
      .eq("is_active", true)
      .order("display_order", { ascending: true });

    if (error) {
      return NextResponse.json({ error: "Query failed" }, { status: 500 });
    }

    const filtered = (data ?? []).filter((row) => {
      if (row.start_at && row.start_at > now) return false;
      if (row.end_at && row.end_at < now) return false;
      return true;
    });

    const result = filtered.map((row) => ({
      id: row.id,
      slotKey: row.slot_key,
      mediaType: row.media_type,
      publicUrl: row.public_url,
      mobilePublicUrl: row.mobile_public_url ?? null,
      posterPublicUrl: row.poster_public_url ?? null,
      altText: row.alt_text ?? null,
      linkHref: row.link_href ?? null,
      displayOrder: row.display_order,
    }));

    return NextResponse.json(result, {
      headers: { "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300" },
    });
  } catch (err) {
    console.error("[api/creative-slots] GET error:", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
