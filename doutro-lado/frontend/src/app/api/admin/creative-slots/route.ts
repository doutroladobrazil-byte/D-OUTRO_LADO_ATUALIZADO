import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/service";
import { verifyAdminRequest } from "@/lib/admin-route-auth";

export const dynamic = "force-dynamic";

/**
 * GET /api/admin/creative-slots?slotKey=&isActive=
 * POST /api/admin/creative-slots — create metadata after upload
 */
export async function GET(request: NextRequest) {
  const authError = await verifyAdminRequest(request);
  if (authError) return authError;

  try {
    const { searchParams } = request.nextUrl;
    const slotKey = searchParams.get("slotKey");
    const isActiveParam = searchParams.get("isActive");

    const supabase = createServiceClient();
    let query = supabase
      .from("creative_slots")
      .select(
        "id, slot_key, title, media_type, public_url, mobile_public_url, poster_public_url, alt_text, link_href, locale, market_code, display_order, is_active, start_at, end_at, file_size_bytes, mime_type, created_at, updated_at",
      )
      .order("slot_key", { ascending: true })
      .order("display_order", { ascending: true });

    if (slotKey) query = query.eq("slot_key", slotKey);
    if (isActiveParam !== null) query = query.eq("is_active", isActiveParam === "true");

    const { data, error } = await query;
    if (error) {
      console.error("[admin/creative-slots] GET error:", error);
      return NextResponse.json({ error: "Query failed" }, { status: 500 });
    }

    return NextResponse.json(data ?? []);
  } catch (err) {
    console.error("[admin/creative-slots] GET error:", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const authError = await verifyAdminRequest(request);
  if (authError) return authError;

  try {
    const body = (await request.json()) as {
      slotKey: string;
      title: string;
      mediaType: "image" | "video";
      storagePath: string;
      publicUrl: string;
      mobileStoragePath?: string;
      mobilePublicUrl?: string;
      posterStoragePath?: string;
      posterPublicUrl?: string;
      altText?: string;
      linkHref?: string;
      locale?: string;
      marketCode?: string;
      displayOrder?: number;
      isActive?: boolean;
      startAt?: string;
      endAt?: string;
      fileSizeBytes?: number;
      mimeType?: string;
      width?: number;
      height?: number;
      durationSeconds?: number;
    };

    const { slotKey, title, mediaType, storagePath, publicUrl } = body;
    if (!slotKey || !title || !mediaType || !storagePath || !publicUrl) {
      return NextResponse.json(
        { error: "slotKey, title, mediaType, storagePath and publicUrl are required" },
        { status: 400 },
      );
    }

    const supabase = createServiceClient();
    const { data, error } = await supabase
      .from("creative_slots")
      .insert({
        slot_key: slotKey,
        title,
        media_type: mediaType,
        storage_path: storagePath,
        public_url: publicUrl,
        mobile_storage_path: body.mobileStoragePath ?? null,
        mobile_public_url: body.mobilePublicUrl ?? null,
        poster_storage_path: body.posterStoragePath ?? null,
        poster_public_url: body.posterPublicUrl ?? null,
        alt_text: body.altText ?? null,
        link_href: body.linkHref ?? null,
        locale: body.locale ?? null,
        market_code: body.marketCode ?? null,
        display_order: body.displayOrder ?? 0,
        is_active: body.isActive ?? true,
        start_at: body.startAt ?? null,
        end_at: body.endAt ?? null,
        file_size_bytes: body.fileSizeBytes ?? null,
        mime_type: body.mimeType ?? null,
        width: body.width ?? null,
        height: body.height ?? null,
        duration_seconds: body.durationSeconds ?? null,
      })
      .select()
      .single();

    if (error) {
      console.error("[admin/creative-slots] POST insert error:", error);
      return NextResponse.json({ error: "Insert failed" }, { status: 500 });
    }

    return NextResponse.json(data, { status: 201 });
  } catch (err) {
    console.error("[admin/creative-slots] POST error:", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
