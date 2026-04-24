import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// =============================================================================
// Supabase table required (run once in Supabase SQL editor):
//
// CREATE TABLE IF NOT EXISTS leads (
//   id          UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
//   email       TEXT        NOT NULL,
//   region      TEXT,
//   interests   TEXT[]      DEFAULT '{}',
//   locale      TEXT        DEFAULT 'en',
//   source      TEXT        DEFAULT 'homepage',
//   utm_source  TEXT,
//   utm_medium  TEXT,
//   utm_campaign TEXT,
//   consent_text TEXT,
//   created_at  TIMESTAMPTZ DEFAULT NOW(),
//   UNIQUE (email)
// );
//
// Enable RLS and add an insert policy for anon:
// ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
// CREATE POLICY "anon can insert leads" ON leads FOR INSERT TO anon WITH CHECK (true);
// =============================================================================

export async function POST(request: NextRequest): Promise<NextResponse> {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const {
    email,
    region,
    interests,
    locale,
    source,
    utm_source,
    utm_medium,
    utm_campaign,
  } = body as Record<string, unknown>;

  if (!email || typeof email !== "string" || !email.includes("@")) {
    return NextResponse.json({ error: "Valid email is required." }, { status: 400 });
  }

  const supabase = await createClient();

  const { error } = await supabase.from("leads").upsert(
    {
      email: email.toLowerCase().trim(),
      region: typeof region === "string" ? region : null,
      interests: Array.isArray(interests) ? interests : [],
      locale: typeof locale === "string" ? locale : "en",
      source: typeof source === "string" ? source : "homepage",
      utm_source: typeof utm_source === "string" ? utm_source : null,
      utm_medium: typeof utm_medium === "string" ? utm_medium : null,
      utm_campaign: typeof utm_campaign === "string" ? utm_campaign : null,
      consent_text: "I agree to receive product drops and availability updates.",
    },
    { onConflict: "email" },
  );

  if (error) {
    console.error("[leads] upsert error:", error.message);
    return NextResponse.json(
      { error: "Could not save. Please try again." },
      { status: 500 },
    );
  }

  return NextResponse.json({ success: true });
}
