import type { NextRequest } from 'next/server';
import { allowedStatusChanges, canEditData, canView, errorResponse, HttpError, requireUser } from '@/lib/server/auth';
import { getProject, logChange, updateProject } from '@/lib/server/store';
import { getService } from '@/modules/registry';
import type { ProjectStatus } from '@/lib/types';

export const dynamic = 'force-dynamic';

async function load(req: NextRequest, id: string) {
  const user = await requireUser(req);
  const project = await getProject(id);
  if (!project || !canView(user, project)) throw new HttpError(404, 'Project not found.');
  return { user, project };
}

// GET /api/projects/:id — one project with its data, results and what you may do
export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { user, project } = await load(req, params.id);
    const service = getService(project.service);
    const results = service ? service.calculate(project.data || {}) : [];
    return Response.json({
      project,
      results,
      can: { edit: canEditData(user, project), statuses: allowedStatusChanges(user, project) },
    });
  } catch (e) {
    return errorResponse(e);
  }
}

// PATCH /api/projects/:id — save one step { step, values } and/or change { status } or { title }
export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { user, project } = await load(req, params.id);
    const body = await req.json().catch(() => ({}));
    const service = getService(project.service);
    const patch: Record<string, any> = {};

    if (body.step !== undefined) {
      if (!canEditData(user, project)) throw new HttpError(403, 'This project can no longer be edited.');
      const step = service?.steps.find((s) => s.id === body.step);
      if (!step) throw new HttpError(400, 'Unknown step.');
      const allowed = new Set(step.fields.map((f) => f.key));
      const values: Record<string, any> = {};
      for (const [k, v] of Object.entries(body.values || {})) if (allowed.has(k)) values[k] = v;
      patch.data = { ...(project.data || {}), [step.id]: values };
      if (step.id === 'general' && values.financial_year) patch.financial_year = String(values.financial_year);
    }
    if (body.title !== undefined) {
      if (!canEditData(user, project)) throw new HttpError(403, 'This project can no longer be edited.');
      patch.title = String(body.title).trim().slice(0, 200);
    }
    if (body.status !== undefined) {
      const to = body.status as ProjectStatus;
      if (!allowedStatusChanges(user, project).includes(to)) throw new HttpError(403, 'You cannot move this project to that status.');
      patch.status = to;
    }
    if (!Object.keys(patch).length) throw new HttpError(400, 'Nothing to save.');

    const updated = await updateProject(project.id, patch);
    if (body.step !== undefined) await logChange(project.id, user.id, 'saved step', { step: body.step });
    if (body.status !== undefined) await logChange(project.id, user.id, 'status changed', { from: project.status, to: body.status, note: String(body.note || '').slice(0, 500) });
    if (body.title !== undefined) await logChange(project.id, user.id, 'renamed', { title: patch.title });
    return Response.json({ project: updated });
  } catch (e) {
    return errorResponse(e);
  }
}
