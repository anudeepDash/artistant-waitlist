-- Migration: Add youtube_channel_url to waitlist_users
ALTER TABLE waitlist_users 
ADD COLUMN IF NOT EXISTS youtube_channel_url TEXT;
