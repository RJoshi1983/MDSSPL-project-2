'use client';
// Browser-side helpers: who is signed in, and calling the back-end API.
import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import type { Profile } from './types';

const DEMO_KEY = 'mdsspl-demo-user';
let sb: SupabaseClient | null = null;
let modeCache: Promise<boolean> | null = null;

export function isDemo(): Promise<boolean> {
  if (!modeCache) {
    modeCache = fetch('/api/mode')
      .then((r) => r.json())
      .then((j) => !!j.demo)
      .catch(() => true);
  }
  return modeCache;
}

export function supabase(): SupabaseClient {
  if (!sb) {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (!url || !key) throw new Error('Supabase keys are missing.');
    sb = createClient(url, key);
  }
  return sb;
}

function getDemoUser(): string | null {
  try {
    return localStorage.getItem(DEMO_KEY);
  } catch {
    return null;
  }
}

export function setDemoUser(id: string | null) {
  try {
    if (id) localStorage.setItem(DEMO_KEY, id);
    else localStorage.removeItem(DEMO_KEY);
  } catch {
    /* storage blocked: demo sign-in lasts for this page only */
  }
}

async function authHeaders(): Promise<Record<string, string>> {
  if (await isDemo()) {
    const id = getDemoUser();
    return id ? { 'x-demo-user': id } : {};
  }
  const { data } = await supabase().auth.getSession();
  const token = data.session?.access_token;
  return token ? { Authorization: `Bearer ${token}` } : {};
}

/** Call the back end. Throws an Error with the server's message on failure. */
export async function api<T = any>(path: string, init: { method?: string; body?: any } = {}): Promise<T> {
  const headers: Record<string, string> = { ...(await authHeaders()) };
  if (init.body !== undefined) headers['Content-Type'] = 'application/json';
  const res = await fetch(path, {
    method: init.method || 'GET',
    headers,
    body: init.body !== undefined ? JSON.stringify(init.body) : undefined,
    cache: 'no-store',
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) {
    const err = new Error(json.error || `Request failed (${res.status})`) as Error & { status?: number };
    err.status = res.status;
    throw err;
  }
  return json as T;
}

export async function getMe(): Promise<Profile | null> {
  try {
    const { user } = await api<{ user: Profile }>('/api/me');
    return user;
  } catch {
    return null;
  }
}

export async function signOut() {
  if (await isDemo()) setDemoUser(null);
  else await supabase().auth.signOut();
}
