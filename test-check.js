import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import { createClient as createAnonClient } from './src/lib/supabase/client';

const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const serviceClient = createSupabaseClient(supabaseUrl, serviceRoleKey, {
  auth: { persistSession: false, autoRefreshToken: false }
});

const anonClient = createAnonClient();

async function test() {
  const testUser = {
    user_id: 'test_user_id_123',
    username: 'test_artist',
    email: 'test_artist@artistant.in',
    display_name: 'Test Artist Profile',
    role: 'artist',
    reserved_at: new Date().toISOString()
  };

  try {
    // 1. Insert test record using service role client
    console.log("Inserting test record...");
    const { error: insertError } = await serviceClient
      .from('waitlist_users')
      .insert(testUser);

    if (insertError) {
      console.error("Insert error:", insertError);
      return;
    }

    // 2. Call admin_get_registrations function
    console.log("Calling admin_get_registrations...");
    const { data: adminData, error: adminError } = await serviceClient
      .rpc('admin_get_registrations', { p_passcode: 'ARTISTANT_ADMIN_2026' });

    if (adminError) {
      console.error("admin_get_registrations error:", adminError);
    } else {
      console.log("admin_get_registrations success. Count:", adminData ? adminData.length : 0);
    }

    // 3. Cleanup
    console.log("Cleaning up test record...");
    await serviceClient
      .from('waitlist_users')
      .delete()
      .eq('username', 'test_artist');

  } catch (e) {
    console.error("Test failed:", e);
  }
}
test();
