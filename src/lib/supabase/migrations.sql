-- ===========================================================================
-- Artistant Admin Side Migrations
-- 
-- Run this script in the Supabase SQL Editor to enable full admin capabilities:
-- https://supabase.com/dashboard/project/gpuedwozcbzlkhdkcebm/sql/new
-- ===========================================================================

-- 1. Add verification, blocking, and priority overrides columns to waitlist_users (if they don't exist)
ALTER TABLE waitlist_users ADD COLUMN IF NOT EXISTS is_verified BOOLEAN DEFAULT false;
ALTER TABLE waitlist_users ADD COLUMN IF NOT EXISTS is_blocked BOOLEAN DEFAULT false;
ALTER TABLE waitlist_users ADD COLUMN IF NOT EXISTS position_override INTEGER DEFAULT NULL;

-- 2. Create RPC function for admin to fetch all registrations (securely verified by passcode)
CREATE OR REPLACE FUNCTION admin_get_registrations(p_passcode text)
RETURNS TABLE (
  id uuid,
  user_id text,
  username text,
  email text,
  display_name text,
  role text,
  category text,
  genres text[],
  phone text,
  reserved_at timestamptz,
  is_verified boolean,
  is_blocked boolean,
  position_override integer
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Simple admin passcode protection. Replace 'ARTISTANT_ADMIN_2026' with your desired admin passcode.
  IF p_passcode != 'ARTISTANT_ADMIN_2026' THEN
    RAISE EXCEPTION 'Invalid admin passcode';
  END IF;

  RETURN QUERY
  SELECT 
    w.id,
    w.user_id,
    w.username,
    w.email,
    w.display_name,
    w.role,
    w.category,
    w.genres,
    w.phone,
    w.reserved_at,
    w.is_verified,
    w.is_blocked,
    w.position_override
  FROM waitlist_users w
  ORDER BY 
    COALESCE(w.position_override, 999999) ASC,
    w.reserved_at DESC;
END;
$$;

-- 3. Create RPC function for admin to update a registration (securely verified by passcode)
CREATE OR REPLACE FUNCTION admin_update_registration(
  p_passcode text,
  p_user_id text,
  p_is_verified boolean,
  p_is_blocked boolean,
  p_position_override integer DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Simple admin passcode protection.
  IF p_passcode != 'ARTISTANT_ADMIN_2026' THEN
    RAISE EXCEPTION 'Invalid admin passcode';
  END IF;

  UPDATE waitlist_users
  SET 
    is_verified = p_is_verified,
    is_blocked = p_is_blocked,
    position_override = p_position_override
  WHERE user_id = p_user_id;
END;
$$;

-- 4. Grant execute permissions to anon and authenticated users (the function itself verifies the passcode)
GRANT EXECUTE ON FUNCTION admin_get_registrations(text) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION admin_update_registration(text, text, boolean, boolean, integer) TO anon, authenticated;
