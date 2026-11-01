import { DEMO_MODE } from '@/lib/server/supabase';

export const dynamic = 'force-dynamic';

// GET /api/mode — tells the browser whether real accounts are switched on
export async function GET() {
  return Response.json({ demo: DEMO_MODE });
}
