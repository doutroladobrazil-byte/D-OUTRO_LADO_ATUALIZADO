-- Stage 4: auth foundation
-- Adds performance index on profiles.auth_user_id and a Supabase trigger
-- that auto-creates a profile row whenever a new user signs up.

-- =============================================================================
-- Index: fast lookup of profile by Supabase auth user UUID
-- (Covered by the UNIQUE constraint in most setups, but made explicit here
--  because the column is nullable and the unique index only covers non-null values.)
-- =============================================================================
CREATE INDEX IF NOT EXISTS profiles_auth_user_id_idx
  ON profiles (auth_user_id)
  WHERE auth_user_id IS NOT NULL;

-- =============================================================================
-- Trigger: auto-create profile on Supabase Auth user creation
-- Fires after INSERT on auth.users (managed by Supabase Auth).
-- The ON CONFLICT clause makes this safe to re-run or call from the backend
-- getOrCreateProfile service concurrently.
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

-- Drop and recreate to keep the trigger definition current.
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_auth_user();
