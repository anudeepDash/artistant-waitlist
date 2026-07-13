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

    // 2. Query using service role client
    const { data: serviceData } = await serviceClient
      .from('waitlist_users')
      .select('*')
      .eq('username', 'test_artist')
      .maybeSingle();
    console.log("Service client query result (should be present):", serviceData ? "Success" : "Failed");

    // 3. Query using anon client (simulates public visitor)
    const { data: anonData, error: anonError } = await anonClient
      .from('waitlist_users')
      .select('*')
      .eq('username', 'test_artist')
      .maybeSingle();

    console.log("Anon client query result:", anonData);
    console.log("Anon client query error:", anonError);

    // 4. Cleanup
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
