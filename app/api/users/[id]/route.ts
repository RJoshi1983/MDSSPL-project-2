import type { NextRequest } from 'next/server';
import { errorResponse, HttpError, requireRole, requireUser } from '@/lib/server/auth';
import { setRole } from '@/lib/server/store';
import { ROLES, type Role } from '@/lib/types';

export const dynamic = 'force-dynamic';

// PATCH /api/users/:id — admin only: change someone's role { role }
export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await requireUser(req);
    requireRole(user, ['admin']);
    const { role } = await req.json().catch(() => ({}));
    if (!ROLES.some((r) => r.id === role)) throw new HttpError(400, 'Unknown role.');
    if (params.id === user.id && role !== 'admin') throw new HttpError(400, 'You cannot remove your own admin role.');
    await setRole(params.id, role as Role);
    return Response.json({ ok: true });
  } catch (e) {
    return errorResponse(e);
  }
}
