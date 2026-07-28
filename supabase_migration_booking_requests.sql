-- Migration: Create booking_requests table for storing client booking requests for artists
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

-- Enable RLS and grant necessary privileges
ALTER TABLE public.booking_requests ENABLE ROW LEVEL SECURITY;

-- Allow service_role full access
GRANT ALL ON public.booking_requests TO service_role;
