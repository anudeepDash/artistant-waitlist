-- SQL Migration: Email Outreach Suite Support
-- Run this in Supabase SQL Editor if you wish to store outreach contact lists & campaigns directly in Supabase.

CREATE TABLE IF NOT EXISTS outreach_contact_lists (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS outreach_contacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  list_id UUID REFERENCES outreach_contact_lists(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  name TEXT,
  first_name TEXT,
  username TEXT,
  company TEXT,
  city TEXT,
  custom_note TEXT,
  source TEXT DEFAULT 'manual',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS outreach_campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  subject TEXT NOT NULL,
  body_html TEXT NOT NULL,
  template_type TEXT DEFAULT 'standard',
  sender_alias TEXT DEFAULT 'official',
  cta_text TEXT,
  cta_url TEXT,
  email_header TEXT,
  pill_tag TEXT,
  target_audience_label TEXT,
  total_recipients INT DEFAULT 0,
  success_count INT DEFAULT 0,
  failed_count INT DEFAULT 0,
  status TEXT DEFAULT 'completed',
  logs JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for fast lookup by email or list
CREATE INDEX IF NOT EXISTS idx_outreach_contacts_list_id ON outreach_contacts(list_id);
CREATE INDEX IF NOT EXISTS idx_outreach_contacts_email ON outreach_contacts(email);
