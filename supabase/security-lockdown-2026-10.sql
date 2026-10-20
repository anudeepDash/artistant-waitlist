-- ============================================================================
-- Artistant database lockdown (October 2026 security audit)
--
-- Run in the Supabase dashboard: SQL Editor -> New query -> paste -> Run.
-- PART 1 is safe to run straight away, with the site as it is today.
-- PART 2 must wait until the new code (branch claude/trusting-pasteur-qf179h)
--        is deployed, because the old code reads waitlist_users from the browser.
--
-- After this, only the server (service-role key) can read or write data.
-- The public anon key in the website's JavaScript can no longer touch any table.
-- ============================================================================


-- ============================================================================
-- PART 1: run now
-- ============================================================================

-- 1a. Remove the passcode-protected admin functions. The passcode was written
--     into the committed SQL and anyone could call them with the public key,
--     which returned every user's email and phone and let them edit any user.
DO $$
DECLARE r record;
BEGIN
  FOR r IN
    SELECT p.oid::regprocedure AS sig
    FROM pg_proc p JOIN pg_namespace n ON n.oid = p.pronamespace
    WHERE n.nspname = 'public'
      AND p.proname IN ('admin_get_registrations', 'admin_update_registration')
  LOOP
    EXECUTE format('REVOKE ALL ON FUNCTION %s FROM PUBLIC, anon, authenticated', r.sig);
    EXECUTE format('DROP FUNCTION %s', r.sig);
  END LOOP;
END $$;

-- 1b. The username check is only called by the server now.
DO $$
DECLARE r record;
BEGIN
  FOR r IN
    SELECT p.oid::regprocedure AS sig
    FROM pg_proc p JOIN pg_namespace n ON n.oid = p.pronamespace
    WHERE n.nspname = 'public' AND p.proname = 'check_username_available'
  LOOP
    EXECUTE format('REVOKE ALL ON FUNCTION %s FROM PUBLIC, anon, authenticated', r.sig);
  END LOOP;
END $$;

-- 1c. Close every table that only the server uses: turn on Row Level Security,
--     remove every policy (some allowed anyone to read or delete all booking
--     requests, or any signed-in user to rewrite site settings and read job
--     applications), and remove the anon/authenticated grants.
--     The service-role key bypasses RLS, so the website keeps working.
DO $$
DECLARE
  t text;
  pol record;
BEGIN
  FOREACH t IN ARRAY ARRAY[
    'admin_users', 'activity_logs', 'booking_requests', 'career_jobs',
    'career_applications', 'site_settings', 'market_feedback',
    'outreach_campaigns', 'outreach_contact_lists', 'outreach_contacts',
    'profile_view_events'
  ]
  LOOP
    IF to_regclass('public.' || t) IS NULL THEN
      RAISE NOTICE 'Skipping %, table does not exist', t;
      CONTINUE;
    END IF;
    EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', t);
    FOR pol IN SELECT policyname FROM pg_policies WHERE schemaname = 'public' AND tablename = t LOOP
      EXECUTE format('DROP POLICY %I ON public.%I', pol.policyname, t);
    END LOOP;
    EXECUTE format('REVOKE ALL ON public.%I FROM anon, authenticated', t);
  END LOOP;
END $$;


-- ============================================================================
-- PART 2: run only AFTER the new code is live
-- ============================================================================
-- The new code reads and writes waitlist_users only from the server. Running this
-- before deploying would break sign-up on the old site.
--
-- DO $$
-- DECLARE pol record;
-- BEGIN
--   ALTER TABLE public.waitlist_users ENABLE ROW LEVEL SECURITY;
--   FOR pol IN SELECT policyname FROM pg_policies WHERE schemaname = 'public' AND tablename = 'waitlist_users' LOOP
--     EXECUTE format('DROP POLICY %I ON public.waitlist_users', pol.policyname);
--   END LOOP;
--   REVOKE ALL ON public.waitlist_users FROM anon, authenticated;
-- END $$;


-- ============================================================================
-- CHECKS: run after each part and look at the results
-- ============================================================================

-- Tables with RLS off (should be none once both parts are done):
SELECT tablename FROM pg_tables WHERE schemaname = 'public' AND NOT rowsecurity;

-- Policies still in place on public tables (should be empty once both parts are done):
SELECT tablename, policyname, roles, cmd FROM pg_policies WHERE schemaname = 'public';

-- Anything the public roles can still do to tables (should be empty once both parts are done):
SELECT table_name, grantee, privilege_type
FROM information_schema.role_table_grants
WHERE table_schema = 'public' AND grantee IN ('anon', 'authenticated')
ORDER BY table_name, grantee;

-- Storage: uploads go through the server, so anon/authenticated should have no
-- INSERT, UPDATE or DELETE policies here. Public buckets can stay readable.
SELECT policyname, roles, cmd FROM pg_policies WHERE schemaname = 'storage' AND tablename = 'objects';
