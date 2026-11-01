import type { NextRequest } from 'next/server';
import { canView, errorResponse, HttpError, requireUser } from '@/lib/server/auth';
import { getHistory, getProject } from '@/lib/server/store';

export const dynamic = 'force-dynamic';

// GET /api/projects/:id/history — the change history of a project
export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await requireUser(req);
    const project = await getProject(user.db, params.id);
    if (!project || !canView(user, project)) throw new HttpError(404, 'Project not found.');
    return Response.json({ history: await getHistory(user.db, project.id) });
  } catch (e) {
    return errorResponse(e);
  }
}
