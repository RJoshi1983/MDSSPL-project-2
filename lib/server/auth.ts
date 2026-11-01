// Works out who is calling the API and what they may do.
import type { NextRequest } from 'next/server';
import type { Profile, Project, ProjectStatus, Role } from '@/lib/types';
import { DEMO_MODE, supabaseAs } from './supabase';
import { getProfile, type Db } from './store';

import { HttpError } from './errors';
export { HttpError };

export type Profile2 = Profile & { db: Db };

/** Returns the signed-in user's profile plus a database connection acting as them, or throws 401. */
export async function requireUser(req: NextRequest): Promise<Profile2> {
  if (DEMO_MODE) {
    const id = req.headers.get('x-demo-user') || '';
    const p = await getProfile(null, id);
    if (!p) throw new HttpError(401, 'Please sign in.');
    return { ...p, db: null };
  }
  const token = (req.headers.get('authorization') || '').replace(/^Bearer\s+/i, '');
  if (!token) throw new HttpError(401, 'Please sign in.');
  const db = supabaseAs(token);
  const { data, error } = await db.auth.getUser(token);
  if (error || !data.user) throw new HttpError(401, 'Your session has expired. Please sign in again.');
  const p = await getProfile(db, data.user.id);
  if (!p) throw new HttpError(403, 'Your account has no profile yet. Ask an admin.');
  return { ...p, db };
}

export function requireRole(user: Profile, roles: Role[]) {
  if (!roles.includes(user.role)) throw new HttpError(403, 'You do not have permission to do this.');
}

/** Statuses a verifier can see. */
export const VERIFIER_STATUSES: ProjectStatus[] = ['submitted', 'under_review', 'verified'];

export function canView(user: Profile, p: Project): boolean {
  if (user.role === 'admin' || user.role === 'staff') return true;
  if (user.role === 'verifier') return VERIFIER_STATUSES.includes(p.status);
  return p.owner_id === user.id;
}

export function canEditData(user: Profile, p: Project): boolean {
  if (p.status === 'verified') return false;
  if (user.role === 'admin' || user.role === 'staff') return true;
  if (user.role === 'client') return p.owner_id === user.id && p.status === 'draft';
  return false;
}

/** Which status changes each role may make from the current status. */
export function allowedStatusChanges(user: Profile, p: Project): ProjectStatus[] {
  const s = p.status;
  switch (user.role) {
    case 'client':
      return p.owner_id === user.id && s === 'draft' ? ['submitted'] : [];
    case 'staff':
      return s === 'verified' ? [] : (['draft', 'submitted', 'under_review'] as ProjectStatus[]).filter((x) => x !== s);
    case 'verifier':
      return s === 'submitted' ? ['under_review', 'draft'] : s === 'under_review' ? ['verified', 'draft'] : [];
    case 'admin':
      return (['draft', 'submitted', 'under_review', 'verified'] as ProjectStatus[]).filter((x) => x !== s);
  }
}

export function errorResponse(e: unknown) {
  const status = e instanceof HttpError ? e.status : 500;
  const message = e instanceof Error ? e.message : 'Something went wrong.';
  if (status === 500) console.error(e);
  return Response.json({ error: message }, { status });
}
