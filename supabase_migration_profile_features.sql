-- Migration: Add profile_visitors_count and custom_status_message

ALTER TABLE waitlist_users 
ADD COLUMN profile_visitors_count INTEGER DEFAULT 0,
ADD COLUMN custom_status_message TEXT;
