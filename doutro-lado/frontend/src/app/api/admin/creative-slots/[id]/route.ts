import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/service";
import { verifyAdminRequest } from "@/lib/admin-route-auth";

export const dynamic = "force-dynamic";

type Params = { params: Promise<{ id: string }> };

export async function PATCH(request: NextRequest, { params }: Params) {
  const authError = await verifyAdminRequest(request);
  if (authError) return authError;

  try {
    const { id } = await params;
    const body = (await request.json()) as Record<string, unknown>;

    const allowed = [
      "title", "alt_text", "link_href", "display_order", "is_active",
      "start_at", "end_at", "locale", "market_code",
      "mobile_public_url", "mobile_storage_path",
      "poster_public_url", "poster_storage_path",
    ];
    const patch: Record<string, unknown> = { updated_at: new Date().toISOString() };
    for (const key of allowed) {
      if (key in body) patch[key] = body[key];
    }

    const supabase = createServiceClient();
    const { data, error } = await supabase
      .from("creative_slots")
      .update(patch)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("[admin/creative-slots/[id]] PATCH error:", error);
      return NextResponse.json({ error: "Update failed" }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch (err) {
    console.error("[admin/creative-slots/[id]] PATCH error:", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: Params) {
  const authError = await verifyAdminRequest(request);
  if (authError) return authError;

  try {
    const { id } = await params;
    const supabase = createServiceClient();

    const { data: row, error: fetchError } = await supabase
      .from("creative_slots")
      .select("storage_path, storage_bucket")
      .eq("id", id)
      .single();

    if (fetchError || !row) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const bucket = row.storage_bucket ?? process.env.SUPABASE_STORAGE_BUCKET_MEDIA ?? "media";
    if (row.storage_path) {
      await supabase.storage.from(bucket).remove([row.storage_path]);
    }

    const { error } = await supabase.from("creative_slots").delete().eq("id", id);
    if (error) {
      console.error("[admin/creative-slots/[id]] DELETE error:", error);
      return NextResponse.json({ error: "Delete failed" }, { status: 500 });
    }

    return NextResponse.json({ deleted: true });
  } catch (err) {
    console.error("[admin/creative-slots/[id]] DELETE error:", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
