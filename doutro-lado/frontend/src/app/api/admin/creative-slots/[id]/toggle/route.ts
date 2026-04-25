import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/service";
import { verifyAdminRequest } from "@/lib/admin-route-auth";

export const dynamic = "force-dynamic";

type Params = { params: Promise<{ id: string }> };

export async function POST(request: NextRequest, { params }: Params) {
  const authError = await verifyAdminRequest(request);
  if (authError) return authError;

  try {
    const { id } = await params;
    const supabase = createServiceClient();

    const { data: row, error: fetchError } = await supabase
      .from("creative_slots")
      .select("is_active")
      .eq("id", id)
      .single();

    if (fetchError || !row) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const { data, error } = await supabase
      .from("creative_slots")
      .update({ is_active: !row.is_active, updated_at: new Date().toISOString() })
      .eq("id", id)
      .select("id, is_active")
      .single();

    if (error) {
      return NextResponse.json({ error: "Toggle failed" }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch (err) {
    console.error("[admin/creative-slots/[id]/toggle] POST error:", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
