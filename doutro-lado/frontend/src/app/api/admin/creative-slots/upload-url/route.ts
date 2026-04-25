import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/service";
import { verifyAdminRequest } from "@/lib/admin-route-auth";

export const dynamic = "force-dynamic";

const BUCKET = process.env.SUPABASE_STORAGE_BUCKET_MEDIA ?? "media";

const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp", "image/avif"];
const ALLOWED_VIDEO_TYPES = ["video/mp4", "video/webm"];
const ALLOWED_TYPES = [...ALLOWED_IMAGE_TYPES, ...ALLOWED_VIDEO_TYPES];

const MAX_IMAGE_BYTES = 8 * 1024 * 1024;   // 8 MB
const MAX_VIDEO_BYTES = 80 * 1024 * 1024;  // 80 MB

/**
 * POST /api/admin/creative-slots/upload-url
 * Body: { slotKey, fileName, mimeType, fileSizeBytes, variant? }
 * variant: "main" | "mobile" | "poster"
 * Returns: { signedUrl, storagePath, publicUrl }
 */
export async function POST(request: NextRequest) {
  const authError = await verifyAdminRequest(request);
  if (authError) return authError;

  try {
    const body = (await request.json()) as {
      slotKey: string;
      fileName: string;
      mimeType: string;
      fileSizeBytes: number;
      variant?: string;
    };

    const { slotKey, fileName, mimeType, fileSizeBytes, variant = "main" } = body;

    if (!slotKey || !fileName || !mimeType) {
      return NextResponse.json({ error: "slotKey, fileName and mimeType are required" }, { status: 400 });
    }

    if (!ALLOWED_TYPES.includes(mimeType)) {
      return NextResponse.json({ error: `File type not allowed: ${mimeType}` }, { status: 400 });
    }

    const isVideo = ALLOWED_VIDEO_TYPES.includes(mimeType);
    const maxSize = isVideo ? MAX_VIDEO_BYTES : MAX_IMAGE_BYTES;
    if (fileSizeBytes > maxSize) {
      return NextResponse.json(
        { error: `File too large. Max: ${Math.round(maxSize / 1024 / 1024)} MB` },
        { status: 400 },
      );
    }

    const safeFileName = fileName.replace(/[^a-zA-Z0-9._-]/g, "_");
    const timestamp = Date.now();
    const variantPath = variant === "mobile" ? "mobile/" : variant === "poster" ? "posters/" : "";
    const storagePath = `creative-slots/${slotKey}/${variantPath}${timestamp}-${safeFileName}`;

    const supabase = createServiceClient();
    const { data, error } = await supabase.storage
      .from(BUCKET)
      .createSignedUploadUrl(storagePath);

    if (error || !data) {
      console.error("[upload-url] Supabase signed URL error:", error);
      return NextResponse.json({ error: "Failed to generate upload URL" }, { status: 500 });
    }

    const { data: urlData } = supabase.storage.from(BUCKET).getPublicUrl(storagePath);

    return NextResponse.json({
      signedUrl: data.signedUrl,
      storagePath,
      publicUrl: urlData.publicUrl,
      bucket: BUCKET,
    });
  } catch (err) {
    console.error("[upload-url] POST error:", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
