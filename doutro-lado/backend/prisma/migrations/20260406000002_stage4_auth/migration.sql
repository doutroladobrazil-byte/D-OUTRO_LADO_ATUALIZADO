-- Stage 4: auth foundation
-- Adds performance index on profiles.auth_user_id and the profile-creation
-- function used by the backend getOrCreateProfile service.
--
-- NOTE: The Supabase trigger (on auth.users INSERT) was intentionally removed
-- from this migration. It lived in apply-complete-schema.sql for Supabase
-- deployments only. On Neon / plain Postgres, profile creation is handled
-- in application code (auth.controller → getOrCreateProfile).

-- =============================================================================
-- Index: fast lookup of profile by auth user UUID
-- (The UNIQUE constraint already covers non-null values; this partial index
--  makes the lookup explicit and efficient when auth_user_id IS NOT NULL.)
-- =============================================================================
CREATE INDEX IF NOT EXISTS profiles_auth_user_id_idx
  ON profiles (auth_user_id)
  WHERE auth_user_id IS NOT NULL;

-- =============================================================================
-- Function: upsert a profile row for a given auth user.
-- Called from the backend after JWT validation (getOrCreateProfile).
-- Safe to call multiple times — ON CONFLICT DO NOTHING is idempotent.
-- On Supabase: this function is also wired up as an auth trigger.
-- On Neon/plain Postgres: called explicitly from application code.
-- =============================================================================
CREATE OR REPLACE FUNCTION public.handle_new_auth_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (auth_user_id, email, full_name, role, is_active)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'full_name',
    'customer',
    true
  )
  ON CONFLICT (auth_user_id) DO NOTHING;
  RETURN NEW;
END;
$$;
