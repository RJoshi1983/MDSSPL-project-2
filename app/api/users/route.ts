import type { NextRequest } from 'next/server';
import { errorResponse, requireRole, requireUser } from '@/lib/server/auth';
import { listProfiles } from '@/lib/server/store';

export const dynamic = 'force-dynamic';

// GET /api/users — admin and staff: everyone with an account
export async function GET(req: NextRequest) {
  try {
    const user = await requireUser(req);
    requireRole(user, ['admin', 'staff']);
    return Response.json({ users: await listProfiles(user.db) });
  } catch (e) {
    return errorResponse(e);
  }
}
