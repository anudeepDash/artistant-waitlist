-- Migration: Add cover_photo_url to waitlist_users
-- The directory, the claim page and cover photo uploads all use this column.
ALTER TABLE waitlist_users
ADD COLUMN IF NOT EXISTS cover_photo_url TEXT;
