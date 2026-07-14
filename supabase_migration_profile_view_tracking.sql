-- Count each browser/IP fingerprint at most once per public profile.
-- Run this migration before deploying the matching Server Action.

CREATE TABLE IF NOT EXISTS public.profile_view_events (
  profile_username text NOT NULL,
  viewer_key text NOT NULL,
  viewed_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (profile_username, viewer_key)
);

CREATE OR REPLACE FUNCTION public.increment_profile_visitors(
  p_username text,
  p_viewer_key text
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  inserted_username text;
BEGIN
  INSERT INTO public.profile_view_events (profile_username, viewer_key)
  SELECT lower(trim(p_username)), p_viewer_key
  WHERE EXISTS (
    SELECT 1
    FROM public.waitlist_users
    WHERE username = lower(trim(p_username))
      AND is_blocked = false
  )
  ON CONFLICT DO NOTHING
  RETURNING profile_username INTO inserted_username;

  IF inserted_username IS NULL THEN
    RETURN false;
  END IF;

  UPDATE public.waitlist_users
  SET profile_visitors_count = COALESCE(profile_visitors_count, 0) + 1
  WHERE username = inserted_username
    AND is_blocked = false;

  RETURN true;
END;
$$;

REVOKE ALL ON FUNCTION public.increment_profile_visitors(text, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.increment_profile_visitors(text, text) TO service_role;
