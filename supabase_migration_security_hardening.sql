-- ===========================================================================
-- Artistant — Security hardening (run AFTER deploying the matching app code)
--
-- The web app no longer queries Supabase from the browser: every read/write goes
-- through server actions that verify the Firebase ID token and use the
-- service-role key (which bypasses RLS). The public anon key — which is shipped in
-- every page's JavaScript — therefore needs NO access to any table or admin RPC.
--
-- Earlier migrations granted anon/authenticated roles broad access, e.g.:
--   * booking_requests: anyone could SELECT / UPDATE / DELETE every client's
--     name, email and phone number
--   * career_applications, career_jobs, site_settings: any signed-in user could
--     read applicants' PII or rewrite site settings and job posts
--   * admin_get_registrations / admin_update_registration: callable by anon with
--     a passcode that is visible in git history -> full user dump, verify/block anyone
--   * admin_users, activity_logs, outreach_* tables were created without RLS, so
--     (depending on default grants) anyone could add themselves as an admin
--
-- Order matters: deploy the new app code first, then run this script.
-- Paste into: Supabase Dashboard -> SQL Editor -> New query -> Run
-- ===========================================================================

-- 1. Table used by the "Market feedback" modal (previously missing, so feedback
--    submissions were silently dropped).
CREATE TABLE IF NOT EXISTS public.market_feedback (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name text,
  email text,
  role text,
  type text NOT NULL DEFAULT 'problem',
  title text,
  message text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- 1b. Lead/contact forms (creator campaign applications, book-a-call, gig proposals)
CREATE TABLE IF NOT EXISTS public.site_inquiries (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  source text NOT NULL,
  context text,
  name text NOT NULL,
  email text,
  phone text,
  message text,
  details jsonb NOT NULL DEFAULT '{}'::jsonb,
  status text NOT NULL DEFAULT 'new',
  created_at timestamptz DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_site_inquiries_created_at ON public.site_inquiries(created_at DESC);

-- 2. Lock down every application table: RLS on, all existing (permissive)
--    policies removed, and no privileges for the public API roles.
DO $$
DECLARE
  t text;
  p record;
  app_tables text[] := ARRAY[
    'waitlist_users', 'admin_users', 'activity_logs', 'booking_requests',
    'career_jobs', 'career_applications', 'site_settings', 'market_feedback', 'site_inquiries',
    'outreach_contact_lists', 'outreach_contacts', 'outreach_campaigns'
  ];
BEGIN
  FOREACH t IN ARRAY app_tables LOOP
    IF to_regclass('public.' || t) IS NULL THEN
      RAISE NOTICE 'Skipping missing table %', t;
      CONTINUE;
    END IF;

    EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', t);

    FOR p IN SELECT policyname FROM pg_policies WHERE schemaname = 'public' AND tablename = t LOOP
      EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I', p.policyname, t);
    END LOOP;

    EXECUTE format('REVOKE ALL ON public.%I FROM anon, authenticated', t);
    EXECUTE format('GRANT ALL ON public.%I TO service_role', t);
  END LOOP;
END $$;

-- 3. Admin RPCs guarded only by a (leaked) passcode: server-only from now on.
DO $$
DECLARE
  f record;
BEGIN
  FOR f IN
    SELECT p.oid::regprocedure AS sig
    FROM pg_proc p JOIN pg_namespace n ON n.oid = p.pronamespace
    WHERE n.nspname = 'public'
      AND p.proname IN ('admin_get_registrations', 'admin_update_registration', 'check_username_available', 'increment_profile_visitors')
  LOOP
    EXECUTE format('REVOKE ALL ON FUNCTION %s FROM PUBLIC, anon, authenticated', f.sig);
    EXECUTE format('GRANT EXECUTE ON FUNCTION %s TO service_role', f.sig);
  END LOOP;
END $$;

-- 4. Column-level grant from an earlier migration
REVOKE SELECT (username) ON public.waitlist_users FROM anon, authenticated;

-- 5. Make new tables created later in `public` private by default, too.
ALTER DEFAULT PRIVILEGES IN SCHEMA public REVOKE ALL ON TABLES FROM anon, authenticated;
ALTER DEFAULT PRIVILEGES IN SCHEMA public REVOKE ALL ON FUNCTIONS FROM anon, authenticated;

-- ===========================================================================
-- Verification — each query below should return ZERO rows.
-- ===========================================================================

-- Tables in public without RLS:
SELECT tablename FROM pg_tables WHERE schemaname = 'public' AND NOT rowsecurity;

-- Any remaining policy that lets the anon/authenticated roles in:
SELECT tablename, policyname, roles FROM pg_policies
WHERE schemaname = 'public' AND (roles && ARRAY['anon', 'authenticated', 'public']::name[]);

-- Any table privilege still held by the public API roles:
SELECT table_name, grantee, privilege_type FROM information_schema.role_table_grants
WHERE table_schema = 'public' AND grantee IN ('anon', 'authenticated');

-- Any function in public still executable by the public API roles:
SELECT p.oid::regprocedure FROM pg_proc p JOIN pg_namespace n ON n.oid = p.pronamespace
WHERE n.nspname = 'public'
  AND (has_function_privilege('anon', p.oid, 'EXECUTE') OR has_function_privilege('authenticated', p.oid, 'EXECUTE'));
