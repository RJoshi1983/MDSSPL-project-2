// Server-side Supabase access. The server talks to the database AS the
// signed-in person (public anon key + their login token), so the database's
// own security rules (supabase/schema.sql) decide what each person can do.
import { createClient, SupabaseClient } from '@supabase/supabase-js';

const URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const ANON = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const DEMO_MODE = !(URL && ANON);

/** A database client acting as the person who owns this login token. */
export function supabaseAs(token: string): SupabaseClient {
  if (DEMO_MODE) throw new Error('Supabase is not configured (demo mode).');
  return createClient(URL!, ANON!, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: { headers: { Authorization: `Bearer ${token}` } },
  });
}
