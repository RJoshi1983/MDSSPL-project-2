// Server-only Supabase client (uses the secret service-role key).
import { createClient, SupabaseClient } from '@supabase/supabase-js';

export const DEMO_MODE = !(
  process.env.NEXT_PUBLIC_SUPABASE_URL &&
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY &&
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

let admin: SupabaseClient | null = null;
export function supabaseAdmin(): SupabaseClient {
  if (DEMO_MODE) throw new Error('Supabase is not configured (demo mode).');
  if (!admin) {
    admin = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
  }
  return admin;
}
