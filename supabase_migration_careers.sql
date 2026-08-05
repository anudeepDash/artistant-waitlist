-- Run this script in the Supabase SQL Editor to enable Careers & Job Applications management:
-- https://supabase.com/dashboard/project/gpuedwozcbzlkhdkcebm/sql/new

-- 1. Create career_jobs table
CREATE TABLE IF NOT EXISTS public.career_jobs (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  title text NOT NULL,
  department text NOT NULL,
  location text NOT NULL DEFAULT 'Remote / Bengaluru',
  job_type text NOT NULL DEFAULT 'Full-Time',
  experience_level text DEFAULT 'Mid - Senior',
  salary_range text DEFAULT '₹18L - ₹32L + Equity',
  description text NOT NULL,
  requirements jsonb DEFAULT '[]'::jsonb,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- 2. Create career_applications table
CREATE TABLE IF NOT EXISTS public.career_applications (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  job_id uuid REFERENCES public.career_jobs(id) ON DELETE SET NULL,
  job_title text NOT NULL,
  applicant_name text NOT NULL,
  email text NOT NULL,
  phone text,
  portfolio_url text,
  resume_url text,
  experience_years text,
  cover_note text,
  status text NOT NULL DEFAULT 'pending',
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.career_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.career_applications ENABLE ROW LEVEL SECURITY;

GRANT ALL ON public.career_jobs TO service_role, anon, authenticated;
GRANT ALL ON public.career_applications TO service_role, anon, authenticated;

-- Policies for career_jobs
DROP POLICY IF EXISTS "Allow public select career_jobs" ON public.career_jobs;
CREATE POLICY "Allow public select career_jobs"
  ON public.career_jobs FOR SELECT TO anon, authenticated, service_role USING (true);

DROP POLICY IF EXISTS "Allow service_role write career_jobs" ON public.career_jobs;
CREATE POLICY "Allow service_role write career_jobs"
  ON public.career_jobs FOR ALL TO service_role, authenticated USING (true) WITH CHECK (true);

-- Policies for career_applications
DROP POLICY IF EXISTS "Allow public insert career_applications" ON public.career_applications;
CREATE POLICY "Allow public insert career_applications"
  ON public.career_applications FOR INSERT TO anon, authenticated, service_role WITH CHECK (true);

DROP POLICY IF EXISTS "Allow service_role read_write career_applications" ON public.career_applications;
CREATE POLICY "Allow service_role read_write career_applications"
  ON public.career_applications FOR ALL TO service_role, authenticated USING (true) WITH CHECK (true);
