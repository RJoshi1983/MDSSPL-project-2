import type { NextRequest } from 'next/server';
import { errorResponse, HttpError, requireRole, requireUser, VERIFIER_STATUSES } from '@/lib/server/auth';
import { createProject, listProjects, logChange } from '@/lib/server/store';
import { getService } from '@/modules/registry';

export const dynamic = 'force-dynamic';

// GET /api/projects — the projects this user may see
export async function GET(req: NextRequest) {
  try {
    const user = await requireUser(req);
    const projects =
      user.role === 'client'
        ? await listProjects({ ownerId: user.id })
        : user.role === 'verifier'
          ? await listProjects({ minStatus: VERIFIER_STATUSES })
          : await listProjects({});
    // the list does not need every data entry
    return Response.json({ projects: projects.map(({ data, ...p }) => p) });
  } catch (e) {
    return errorResponse(e);
  }
}

// POST /api/projects — start a new project { service, title, financial_year, owner_id? }
export async function POST(req: NextRequest) {
  try {
    const user = await requireUser(req);
    requireRole(user, ['client', 'staff', 'admin']);
    const body = await req.json().catch(() => ({}));
    const service = getService(String(body.service || ''));
    if (!service) throw new HttpError(400, 'Unknown service.');
    const title = String(body.title || '').trim().slice(0, 200) || `${service.short} project`;
    const fy = String(body.financial_year || '').slice(0, 20);
    // staff/admin may open a project on behalf of a client
    const owner_id = user.role !== 'client' && body.owner_id ? String(body.owner_id) : user.id;
    const p = await createProject({ owner_id, service: service.id, title, financial_year: fy, data: { general: { organisation: user.organisation, financial_year: fy } } });
    await logChange(p.id, user.id, 'created', { service: service.id, title });
    return Response.json({ project: p }, { status: 201 });
  } catch (e) {
    return errorResponse(e);
  }
}
