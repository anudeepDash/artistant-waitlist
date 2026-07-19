-- Migration: Add exclude_from_waitlist column and update RPCs
-- Run this in the Supabase SQL Editor: https://supabase.com/dashboard/project/gpuedwozcbzlkhdkcebm/sql/new

ALTER TABLE public.waitlist_users 
ADD COLUMN IF NOT EXISTS exclude_from_waitlist BOOLEAN DEFAULT false;

-- Update RPC function for admin to fetch all registrations (securely verified by passcode)
DROP FUNCTION IF EXISTS public.admin_get_registrations(text);
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
  position_override integer,
  exclude_from_waitlist boolean
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
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
    w.position_override,
    w.exclude_from_waitlist
  FROM waitlist_users w
  ORDER BY 
    COALESCE(w.position_override, 999999) ASC,
    w.reserved_at DESC;
END;
$$;

-- Update RPC function for admin to update a registration (securely verified by passcode)
DROP FUNCTION IF EXISTS public.admin_update_registration(text, text, boolean, boolean, integer);
DROP FUNCTION IF EXISTS public.admin_update_registration(text, text, boolean, boolean, integer, boolean);
DROP FUNCTION IF EXISTS public.admin_update_registration(text, text, boolean, boolean, integer, boolean, boolean);

CREATE OR REPLACE FUNCTION admin_update_registration(
  p_passcode text,
  p_user_id text,
  p_is_verified boolean,
  p_is_blocked boolean,
  p_position_override integer DEFAULT NULL,
  p_feature_founding_card boolean DEFAULT false,
  p_exclude_from_waitlist boolean DEFAULT false
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF p_passcode != 'ARTISTANT_ADMIN_2026' THEN
    RAISE EXCEPTION 'Invalid admin passcode';
  END IF;

  UPDATE waitlist_users
  SET 
    is_verified = p_is_verified,
    is_blocked = p_is_blocked,
    position_override = p_position_override,
    feature_founding_card = p_feature_founding_card,
    exclude_from_waitlist = p_exclude_from_waitlist
  WHERE user_id = p_user_id;
END;
$$;

GRANT EXECUTE ON FUNCTION admin_get_registrations(text) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION admin_update_registration(text, text, boolean, boolean, integer, boolean, boolean) TO anon, authenticated;
