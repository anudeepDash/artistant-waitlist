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
DROP FUNCTION IF EXISTS public.admin_update_registration(text, text, boolean, boolean);
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

-- 4. Grant execute permissions to anon and authenticated users (for fallback mode)
GRANT EXECUTE ON FUNCTION admin_get_registrations(text) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION admin_update_registration(text, text, boolean, boolean, integer) TO anon, authenticated;

-- ===========================================================================
-- SECURITY RESOLUTIONS FOR DATABASE LINTER (WARNINGS 0028 & 0029)
-- ===========================================================================

-- OPTION A: Resolving admin warnings for admin_get_registrations and admin_update_registration
-- Once you have added SUPABASE_SERVICE_ROLE_KEY to your environment variables,
-- the server actions will query the tables directly using owner privileges.
-- You can then safely run these commands to revoke execution permissions from public roles:
-- 
-- REVOKE EXECUTE ON FUNCTION admin_get_registrations(text) FROM public, anon, authenticated;
-- REVOKE EXECUTE ON FUNCTION admin_update_registration(text, text, boolean, boolean, integer) FROM public, anon, authenticated;


-- OPTION B: Resolving warnings for check_username_available
-- To resolve linter warnings 0028 and 0029 on check_username_available, we can
-- define it as a SECURITY INVOKER function, and grant select access solely on
-- the username column to anon/authenticated roles.
--
-- 1. Create check_username_available as SECURITY INVOKER (runs with caller's privileges)
CREATE OR REPLACE FUNCTION check_username_available(p_username text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public
AS $$
BEGIN
  RETURN NOT EXISTS (
    SELECT 1 FROM waitlist_users WHERE username = lower(trim(p_username))
  );
END;
$$;

GRANT EXECUTE ON FUNCTION check_username_available(text) TO anon, authenticated;

-- 2. Grant SELECT privilege only on the username column so invokers can run the check
GRANT SELECT (username) ON public.waitlist_users TO anon, authenticated;

-- 3. If Row-Level Security (RLS) is enabled on waitlist_users, you must also add
-- a SELECT policy allowing anyone to perform this check:
--
-- CREATE POLICY "Allow public username check" ON public.waitlist_users
-- FOR SELECT TO anon, authenticated USING (true);

-- 4. Add referred_by column to waitlist_users to support the points & viral referral system
ALTER TABLE waitlist_users ADD COLUMN IF NOT EXISTS referred_by TEXT;

-- 5. Create admin_users table to track authorized admins
CREATE TABLE IF NOT EXISTS public.admin_users (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  email text UNIQUE NOT NULL,
  created_at timestamptz DEFAULT now(),
  added_by text
);

-- Seed initial default super-admin
INSERT INTO public.admin_users (email, added_by)
VALUES ('anudeepdash2004@gmail.com', 'system')
ON CONFLICT (email) DO NOTHING;

-- 6. Create activity_logs table to track website traffic, logins, and registrations
CREATE TABLE IF NOT EXISTS public.activity_logs (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id text, -- Firebase UID
  email text,
  username text,
  action_type text NOT NULL, -- 'visit' | 'login' | 'waitlist_register'
  user_agent text,
  referrer text,
  created_at timestamptz DEFAULT now()
);

-- 7. Add story_shared column to waitlist_users to track story sharing task
ALTER TABLE waitlist_users ADD COLUMN IF NOT EXISTS story_shared BOOLEAN DEFAULT false;
