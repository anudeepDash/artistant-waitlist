-- Migration: Add gallery_photos column to waitlist_users table
ALTER TABLE waitlist_users 
ADD COLUMN IF NOT EXISTS gallery_photos TEXT[] DEFAULT '{}';
