// DATA LAYER — every read and write of the database goes through here.
// With Supabase configured it uses the real database; otherwise an
// in-memory demo store (data disappears when the server restarts).
import type { Profile, Project, ProjectData, ProjectStatus, Role } from '@/lib/types';
import { DEMO_MODE, supabaseAdmin } from './supabase';

export interface HistoryItem {
  id: string | number;
  project_id: string;
  user_id: string;
  user_name?: string;
  action: string;
  detail: any;
  at: string;
}

interface Mem {
  profiles: Map<string, Profile>;
  projects: Map<string, Project>;
  history: HistoryItem[];
}

function mem(): Mem {
  const g = globalThis as any;
  if (!g.__mdssplStore) {
    const profiles = new Map<string, Profile>();
    const seed: [string, Role, string][] = [
      ['demo-client', 'client', 'Demo Client'],
      ['demo-staff', 'staff', 'Demo Consultant'],
      ['demo-verifier', 'verifier', 'Demo Verifier'],
      ['demo-admin', 'admin', 'Demo Admin'],
    ];
    for (const [id, role, name] of seed) {
      profiles.set(id, { id, role, full_name: name, email: `${id}@example.com`, organisation: role === 'client' ? 'Demo Industries Ltd' : 'MDSSPL' });
    }
    g.__mdssplStore = { profiles, projects: new Map(), history: [] } as Mem;
  }
  return g.__mdssplStore as Mem;
}

const now = () => new Date().toISOString();
const uid = () => (globalThis.crypto?.randomUUID ? globalThis.crypto.randomUUID() : String(Date.now()) + Math.random().toString(16).slice(2));

// ---------- profiles ----------
export async function getProfile(id: string): Promise<Profile | null> {
  if (DEMO_MODE) return mem().profiles.get(id) ?? null;
  const { data, error } = await supabaseAdmin().from('profiles').select('*').eq('id', id).maybeSingle();
  if (error) throw error;
  return data as Profile | null;
}

export async function listProfiles(): Promise<Profile[]> {
  if (DEMO_MODE) return [...mem().profiles.values()];
  const { data, error } = await supabaseAdmin().from('profiles').select('*').order('created_at', { ascending: true });
  if (error) throw error;
  return data as Profile[];
}

export async function setRole(id: string, role: Role): Promise<void> {
  if (DEMO_MODE) {
    const p = mem().profiles.get(id);
    if (p) p.role = role;
    return;
  }
  const { error } = await supabaseAdmin().from('profiles').update({ role }).eq('id', id);
  if (error) throw error;
}

// ---------- projects ----------
export async function listProjects(filter: { ownerId?: string; minStatus?: ProjectStatus[] }): Promise<Project[]> {
  if (DEMO_MODE) {
    const m = mem();
    return [...m.projects.values()]
      .filter((p) => (!filter.ownerId || p.owner_id === filter.ownerId) && (!filter.minStatus || filter.minStatus.includes(p.status)))
      .map((p) => ({ ...p, owner_name: m.profiles.get(p.owner_id)?.organisation || m.profiles.get(p.owner_id)?.full_name }))
      .sort((a, b) => b.updated_at.localeCompare(a.updated_at));
  }
  let q = supabaseAdmin().from('projects').select('*, owner:profiles(full_name, organisation)').order('updated_at', { ascending: false });
  if (filter.ownerId) q = q.eq('owner_id', filter.ownerId);
  if (filter.minStatus) q = q.in('status', filter.minStatus);
  const { data, error } = await q;
  if (error) throw error;
  return (data as any[]).map(({ owner, ...p }) => ({ ...p, owner_name: owner?.organisation || owner?.full_name }));
}

export async function getProject(id: string): Promise<Project | null> {
  if (DEMO_MODE) {
    const m = mem();
    const p = m.projects.get(id);
    return p ? { ...p, owner_name: m.profiles.get(p.owner_id)?.organisation } : null;
  }
  const { data, error } = await supabaseAdmin().from('projects').select('*, owner:profiles(full_name, organisation)').eq('id', id).maybeSingle();
  if (error) throw error;
  if (!data) return null;
  const { owner, ...p } = data as any;
  return { ...p, owner_name: owner?.organisation || owner?.full_name };
}

export async function createProject(input: { owner_id: string; service: string; title: string; financial_year: string; data?: ProjectData }): Promise<Project> {
  const row = { ...input, status: 'draft' as ProjectStatus, data: input.data ?? {} };
  if (DEMO_MODE) {
    const p: Project = { id: uid(), created_at: now(), updated_at: now(), ...row };
    mem().projects.set(p.id, p);
    return p;
  }
  const { data, error } = await supabaseAdmin().from('projects').insert(row).select('*').single();
  if (error) throw error;
  return data as Project;
}

export async function updateProject(id: string, patch: Partial<Pick<Project, 'data' | 'status' | 'title' | 'financial_year'>>): Promise<Project> {
  if (DEMO_MODE) {
    const p = mem().projects.get(id);
    if (!p) throw new Error('Not found');
    Object.assign(p, patch, { updated_at: now() });
    return p;
  }
  const { data, error } = await supabaseAdmin().from('projects').update({ ...patch, updated_at: now() }).eq('id', id).select('*').single();
  if (error) throw error;
  return data as Project;
}

// ---------- change history ----------
export async function logChange(project_id: string, user_id: string, action: string, detail: any = {}): Promise<void> {
  if (DEMO_MODE) {
    mem().history.push({ id: uid(), project_id, user_id, action, detail, at: now() });
    return;
  }
  await supabaseAdmin().from('activity_log').insert({ project_id, user_id, action, detail });
}

export async function getHistory(project_id: string): Promise<HistoryItem[]> {
  if (DEMO_MODE) {
    const m = mem();
    return m.history.filter((h) => h.project_id === project_id).map((h) => ({ ...h, user_name: m.profiles.get(h.user_id)?.full_name })).reverse();
  }
  const { data, error } = await supabaseAdmin().from('activity_log').select('*, who:profiles(full_name)').eq('project_id', project_id).order('at', { ascending: false }).limit(200);
  if (error) throw error;
  return (data as any[]).map(({ who, ...h }) => ({ ...h, user_name: who?.full_name }));
}
