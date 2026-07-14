-- Migration: Add phone column to waitlist_users table
-- Run this in the Supabase SQL Editor: https://supabase.com/dashboard/project/gpuedwozcbzlkhdkcebm/sql/new

ALTER TABLE public.waitlist_users 
ADD COLUMN IF NOT EXISTS phone TEXT;
