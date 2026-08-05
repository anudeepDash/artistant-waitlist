-- Run this script in the Supabase SQL Editor to enable site settings storage:
-- https://supabase.com/dashboard/project/gpuedwozcbzlkhdkcebm/sql/new

CREATE TABLE IF NOT EXISTS public.site_settings (
  id text PRIMARY KEY DEFAULT 'default',
  settings jsonb NOT NULL DEFAULT '{}'::jsonb,
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;
GRANT ALL ON public.site_settings TO service_role, anon, authenticated;

-- Allow public/anon select of site settings
DROP POLICY IF EXISTS "Allow public select site_settings" ON public.site_settings;
CREATE POLICY "Allow public select site_settings"
  ON public.site_settings FOR SELECT TO anon, authenticated, service_role USING (true);

-- Allow service_role / authenticated updates
DROP POLICY IF EXISTS "Allow service_role write site_settings" ON public.site_settings;
CREATE POLICY "Allow service_role write site_settings"
  ON public.site_settings FOR ALL TO service_role, authenticated USING (true) WITH CHECK (true);
