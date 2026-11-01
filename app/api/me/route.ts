import type { NextRequest } from 'next/server';
import { errorResponse, requireUser } from '@/lib/server/auth';
import { DEMO_MODE } from '@/lib/server/supabase';

export const dynamic = 'force-dynamic';

// GET /api/me — who am I?
export async function GET(req: NextRequest) {
  try {
    const user = await requireUser(req);
    return Response.json({ user, demo: DEMO_MODE });
  } catch (e) {
    return errorResponse(e);
  }
}
