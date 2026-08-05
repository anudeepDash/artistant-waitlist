import { OutreachContact, OutreachList, OutreachCampaign } from './outreach-types';

const CONTACTS_STORAGE_KEY = 'artistant_outreach_contacts_v1';
const LISTS_STORAGE_KEY = 'artistant_outreach_lists_v1';
const CAMPAIGNS_STORAGE_KEY = 'artistant_outreach_campaigns_v1';

// Initial default email list
const DEFAULT_LIST: OutreachList = {
  id: 'default-leads',
  name: 'General Outreach Leads',
  description: 'Default list for imported email leads and contacts.',
  contact_count: 0,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

/**
 * Retrieves stored contact lists from LocalStorage.
 */
export function getStoredOutreachLists(): OutreachList[] {
  if (typeof window === 'undefined') return [DEFAULT_LIST];
  try {
    const raw = localStorage.getItem(LISTS_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(LISTS_STORAGE_KEY, JSON.stringify([DEFAULT_LIST]));
      return [DEFAULT_LIST];
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : [DEFAULT_LIST];
  } catch (e) {
    console.error('Failed to load outreach lists from storage:', e);
    return [DEFAULT_LIST];
  }
}

/**
 * Saves contact lists to LocalStorage.
 */
export function saveStoredOutreachLists(lists: OutreachList[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(LISTS_STORAGE_KEY, JSON.stringify(lists));
  } catch (e) {
    console.error('Failed to save outreach lists to storage:', e);
  }
}

/**
 * Retrieves stored custom contacts from LocalStorage.
 */
export function getStoredOutreachContacts(): OutreachContact[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(CONTACTS_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (e) {
    console.error('Failed to load outreach contacts from storage:', e);
    return [];
  }
}

/**
 * Saves custom contacts to LocalStorage.
 */
export function saveStoredOutreachContacts(contacts: OutreachContact[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(CONTACTS_STORAGE_KEY, JSON.stringify(contacts));
  } catch (e) {
    console.error('Failed to save outreach contacts to storage:', e);
  }
}

/**
 * Retrieves stored outreach campaign history.
 */
export function getStoredOutreachCampaigns(): OutreachCampaign[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(CAMPAIGNS_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (e) {
    console.error('Failed to load outreach campaigns from storage:', e);
    return [];
  }
}

/**
 * Saves a completed or updated campaign record to storage history.
 */
export function saveOutreachCampaign(campaign: OutreachCampaign): void {
  if (typeof window === 'undefined') return;
  try {
    const existing = getStoredOutreachCampaigns();
    const index = existing.findIndex((c) => c.id === campaign.id);
    if (index >= 0) {
      existing[index] = campaign;
    } else {
      existing.unshift(campaign);
    }
    localStorage.setItem(CAMPAIGNS_STORAGE_KEY, JSON.stringify(existing));
  } catch (e) {
    console.error('Failed to save outreach campaign to storage:', e);
  }
}
