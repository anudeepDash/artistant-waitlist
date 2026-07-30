-- ===========================================================================
-- Migration: Create booking_requests table for storing client booking requests
--
-- Run this script in the Supabase SQL Editor:
-- https://supabase.com/dashboard/project/gpuedwozcbzlkhdkcebm/sql/new
-- ===========================================================================

CREATE TABLE IF NOT EXISTS public.booking_requests (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  artist_username text NOT NULL,
  artist_display_name text,
  client_name text NOT NULL,
  client_email text NOT NULL,
  client_phone text NOT NULL,
  event_date text NOT NULL,
  city text NOT NULL,
  event_type text NOT NULL,
  budget text,
  notes text,
  status text DEFAULT 'pending',
  created_at timestamptz DEFAULT now()
);

-- Performance indices
CREATE INDEX IF NOT EXISTS idx_booking_requests_artist_username ON public.booking_requests(artist_username);
CREATE INDEX IF NOT EXISTS idx_booking_requests_created_at ON public.booking_requests(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_booking_requests_status ON public.booking_requests(status);

-- Enable RLS and grant necessary privileges
ALTER TABLE public.booking_requests ENABLE ROW LEVEL SECURITY;

-- Grant access permissions to service_role, anon, and authenticated roles
GRANT ALL ON public.booking_requests TO service_role, anon, authenticated;

-- Row Level Security (RLS) Policies
DROP POLICY IF EXISTS "Allow public insert to booking_requests" ON public.booking_requests;
CREATE POLICY "Allow public insert to booking_requests"
  ON public.booking_requests
  FOR INSERT
  TO anon, authenticated, service_role
  WITH CHECK (true);

DROP POLICY IF EXISTS "Allow select booking_requests" ON public.booking_requests;
CREATE POLICY "Allow select booking_requests"
  ON public.booking_requests
  FOR SELECT
  TO anon, authenticated, service_role
  USING (true);

DROP POLICY IF EXISTS "Allow update booking_requests" ON public.booking_requests;
CREATE POLICY "Allow update booking_requests"
  ON public.booking_requests
  FOR UPDATE
  TO anon, authenticated, service_role
  USING (true);

DROP POLICY IF EXISTS "Allow delete booking_requests" ON public.booking_requests;
CREATE POLICY "Allow delete booking_requests"
  ON public.booking_requests
  FOR DELETE
  TO anon, authenticated, service_role
  USING (true);
