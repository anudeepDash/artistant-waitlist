export interface OutreachContact {
  id: string;
  email: string;
  name: string;
  first_name?: string;
  username?: string;
  company?: string;
  city?: string;
  custom_note?: string;
  list_id?: string;
  list_name?: string;
  tags?: string[];
  source?: 'waitlist' | 'csv' | 'manual';
  created_at: string;
}

export interface OutreachList {
  id: string;
  name: string;
  description?: string;
  contact_count: number;
  created_at: string;
  updated_at: string;
}

export interface OutreachLogItem {
  id: string;
  email: string;
  name: string;
  status: 'sent' | 'failed';
  message?: string;
  timestamp: string;
}

export interface OutreachCampaign {
  id: string;
  subject: string;
  body_html: string;
  template_type: 'standard' | 'welcome' | 'vip' | 'newsletter' | 'raw' | 'migrated_artist';
  sender_alias?: string;
  cta_text?: string;
  cta_url?: string;
  email_header?: string;
  pill_tag?: string;
  target_audience_label: string;
  total_recipients: number;
  success_count: number;
  failed_count: number;
  status: 'completed' | 'failed' | 'partial';
  created_at: string;
  logs: OutreachLogItem[];
}

export interface OutreachTemplatePreset {
  id: string;
  title: string;
  category: 'Artist Onboarding' | 'Venue & Event Pitch' | 'VIP Invitation' | 'Product Update' | 'Founder 1-on-1';
  description: string;
  subject: string;
  headerTitle?: string;
  pillTag?: string;
  templateType: 'standard' | 'welcome' | 'vip' | 'newsletter' | 'raw';
  bodyHtml: string;
  ctaText?: string;
  ctaUrl?: string;
  senderAlias?: string;
}
