import { createClient as createSupabaseClient } from '@supabase/supabase-js';

export function getAdminSupabaseClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url) {
    throw new Error('Supabase client configuration error: NEXT_PUBLIC_SUPABASE_URL is missing.');
  }

  const key = serviceRoleKey || anonKey;
  if (!key) {
    throw new Error('Supabase client configuration error: Neither SUPABASE_SERVICE_ROLE_KEY nor NEXT_PUBLIC_SUPABASE_ANON_KEY is set.');
  }

  return createSupabaseClient(url, key, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}
