'use client';
// Separate sign-in pages for clients, staff/verifiers and admins.
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { DemoBanner } from '@/components/AppShell';
import { getMe, isDemo, setDemoUser, signOut, supabase } from '@/lib/client';
import type { Role } from '@/lib/types';

const PORTALS: Record<string, { title: string; roles: Role[]; demo: { id: string; label: string }[]; canRegister: boolean }> = {
  client: { title: 'Client sign-in', roles: ['client'], demo: [{ id: 'demo-client', label: 'Continue as Demo Client' }], canRegister: true },
  staff: {
    title: 'Staff & verifier sign-in',
    roles: ['staff', 'verifier'],
    demo: [
      { id: 'demo-staff', label: 'Continue as Demo Consultant' },
      { id: 'demo-verifier', label: 'Continue as Demo Verifier' },
    ],
    canRegister: false,
  },
  admin: { title: 'Admin sign-in', roles: ['admin'], demo: [{ id: 'demo-admin', label: 'Continue as Demo Admin' }], canRegister: false },
};

export default function SignIn({ params }: { params: { portal: string } }) {
  const portal = PORTALS[params.portal] || PORTALS.client;
  const router = useRouter();
  const [demo, setDemo] = useState<boolean | null>(null);
  const [mode, setMode] = useState<'in' | 'up'>('in');
  const [form, setForm] = useState({ email: '', password: '', full_name: '', organisation: '' });
  const [msg, setMsg] = useState<{ kind: 'error' | 'ok'; text: string } | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    isDemo().then(setDemo);
  }, []);

  async function finish() {
    const me = await getMe();
    if (!me) throw new Error('Signed in, but your profile could not be loaded. Run supabase/schema.sql and try again.');
    if (!portal.roles.includes(me.role)) {
      await signOut();
      throw new Error(`This is a ${me.role} account. Please use the ${me.role === 'client' ? 'client' : me.role === 'admin' ? 'admin' : 'staff & verifier'} sign-in page.`);
    }
    router.push('/hub');
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setMsg(null);
    try {
      if (mode === 'up') {
        const { data, error } = await supabase().auth.signUp({
          email: form.email,
          password: form.password,
          options: { data: { full_name: form.full_name, organisation: form.organisation } },
        });
        if (error) throw error;
        if (!data.session) {
          setMsg({ kind: 'ok', text: 'Account created. Check your email to confirm it, then sign in.' });
          setMode('in');
          return;
        }
      } else {
        const { error } = await supabase().auth.signInWithPassword({ email: form.email, password: form.password });
        if (error) throw error;
      }
      await finish();
    } catch (err: any) {
      setMsg({ kind: 'error', text: err?.message || 'Sign-in failed.' });
    } finally {
      setBusy(false);
    }
  }

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) => setForm({ ...form, [k]: e.target.value });

  return (
    <>
      <DemoBanner />
      <header className="topbar"><div className="topbar-inner"><Link href="/" className="logo">MDSSPL Service Hub</Link></div></header>
      <main className="page narrow" style={{ maxWidth: 480 }}>
        <div className="card">
          <h1 style={{ fontSize: 26 }}>{mode === 'up' ? 'Register as a client' : portal.title}</h1>
          {demo === null && <p className="muted">Loading…</p>}

          {demo === true && (
            <>
              <p className="muted">Demo mode: pick a demo account. No password needed.</p>
              <div style={{ display: 'grid', gap: 8 }}>
                {portal.demo.map((d) => (
                  <button
                    key={d.id}
                    className="btn btn-primary"
                    onClick={async () => {
                      setDemoUser(d.id);
                      try { await finish(); } catch (err: any) { setMsg({ kind: 'error', text: err.message }); }
                    }}
                  >
                    {d.label}
                  </button>
                ))}
              </div>
            </>
          )}

          {demo === false && (
            <form onSubmit={submit}>
              {mode === 'up' && (
                <>
                  <label className="field"><span>Your full name</span><input type="text" required value={form.full_name} onChange={set('full_name')} /></label>
                  <label className="field"><span>Organisation</span><input type="text" required value={form.organisation} onChange={set('organisation')} /></label>
                </>
              )}
              <label className="field"><span>Email</span><input type="email" required autoComplete="email" value={form.email} onChange={set('email')} /></label>
              <label className="field"><span>Password</span><input type="password" required minLength={8} autoComplete={mode === 'up' ? 'new-password' : 'current-password'} value={form.password} onChange={set('password')} /><span className="hint">At least 8 characters.</span></label>
              <button className="btn btn-primary" style={{ width: '100%' }} disabled={busy}>{busy ? 'Please wait…' : mode === 'up' ? 'Create account' : 'Sign in'}</button>
              {portal.canRegister && (
                <p style={{ marginTop: 16 }} className="muted">
                  {mode === 'in' ? 'New client? ' : 'Already registered? '}
                  <a href="#" onClick={(e) => { e.preventDefault(); setMode(mode === 'in' ? 'up' : 'in'); setMsg(null); }}>
                    {mode === 'in' ? 'Create an account' : 'Sign in'}
                  </a>
                </p>
              )}
              {!portal.canRegister && <p style={{ marginTop: 16 }} className="caption">Staff, verifier and admin accounts are set up by an admin.</p>}
            </form>
          )}

          {msg && <p className={msg.kind} role="alert" style={{ marginTop: 16 }}>{msg.text}</p>}
        </div>
        <p className="muted"><Link href="/">← Back to the front page</Link></p>
      </main>
    </>
  );
}
