-- Migration: Add section reordering and contact toggle settings
ALTER TABLE waitlist_users 
ADD COLUMN IF NOT EXISTS section_order TEXT[] DEFAULT '{"gallery", "video", "audio"}',
ADD COLUMN IF NOT EXISTS contact_email_enabled BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS contact_phone_enabled BOOLEAN DEFAULT false;
