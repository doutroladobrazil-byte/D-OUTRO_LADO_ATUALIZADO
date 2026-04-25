-- Migration: creative_slots
-- Creative Slots — landing page and editorial creative management.
-- Physical files live in Supabase Storage; this table stores metadata and URLs.

CREATE TABLE IF NOT EXISTS public.creative_slots (
  id                    uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slot_key              text NOT NULL,
  title                 text NOT NULL,
  media_type            text NOT NULL CHECK (media_type IN ('image', 'video')),
  storage_bucket        text,
  storage_path          text NOT NULL,
  public_url            text NOT NULL,
  mobile_storage_path   text,
  mobile_public_url     text,
  poster_storage_path   text,
  poster_public_url     text,
  alt_text              text,
  link_href             text,
  locale                text,
  market_code           text,
  display_order         int NOT NULL DEFAULT 0,
  is_active             boolean NOT NULL DEFAULT true,
  start_at              timestamptz,
  end_at                timestamptz,
  file_size_bytes       int,
  mime_type             text,
  width                 int,
  height                int,
  duration_seconds      float,
  created_at            timestamptz NOT NULL DEFAULT now(),
  updated_at            timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS creative_slots_slot_key_idx       ON public.creative_slots (slot_key);
CREATE INDEX IF NOT EXISTS creative_slots_is_active_idx      ON public.creative_slots (is_active);
CREATE INDEX IF NOT EXISTS creative_slots_locale_idx         ON public.creative_slots (locale);
CREATE INDEX IF NOT EXISTS creative_slots_market_code_idx    ON public.creative_slots (market_code);
CREATE INDEX IF NOT EXISTS creative_slots_display_order_idx  ON public.creative_slots (display_order);
CREATE INDEX IF NOT EXISTS creative_slots_start_at_idx       ON public.creative_slots (start_at);
CREATE INDEX IF NOT EXISTS creative_slots_end_at_idx         ON public.creative_slots (end_at);

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger
    WHERE tgname = 'creative_slots_updated_at'
      AND tgrelid = 'public.creative_slots'::regclass
  ) THEN
    CREATE TRIGGER creative_slots_updated_at
    BEFORE UPDATE ON public.creative_slots
    FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
  END IF;
END;
$$;
