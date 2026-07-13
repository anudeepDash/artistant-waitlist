-- Migration: Add feature_founding_card setting to waitlist_users
ALTER TABLE waitlist_users 
ADD COLUMN IF NOT EXISTS feature_founding_card BOOLEAN DEFAULT false;
