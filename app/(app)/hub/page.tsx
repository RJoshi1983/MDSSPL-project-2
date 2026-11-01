'use client';
// After sign-in: the nine services and the user's projects.
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useUser } from '@/components/AppShell';
import { api } from '@/lib/client';
import { FINANCIAL_YEARS } from '@/lib/calc';
import { STATUS_LABEL, type Project, type Profile } from '@/lib/types';
import { fmtDate, svcStyle } from '@/lib/ui';
import { getService, SERVICES } from '@/modules/registry';

export default function Hub() {
  const user = useUser();
  const router = useRouter();
  const [projects, setProjects] = useState<Project[] | null>(null);
  const [clients, setClients] = useState<Profile[]>([]);
  const [filter, setFilter] = useState('');
  const [starting, setStarting] = useState<string | null>(null);
  const [form, setForm] = useState({ title: '', financial_year: FINANCIAL_YEARS[3], owner_id: '' });
  const [error, setError] = useState('');

  const canStart = user.role !== 'verifier';

  useEffect(() => {
    api<{ projects: Project[] }>('/api/projects').then((r) => setProjects(r.projects)).catch((e) => setError(e.message));
    if (user.role === 'staff' || user.role === 'admin') {
      api<{ users: Profile[] }>('/api/users').then((r) => setClients(r.users.filter((u) => u.role === 'client'))).catch(() => {});
    }
  }, [user.role]);

  async function start(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    try {
      const { project } = await api<{ project: Project }>('/api/projects', { method: 'POST', body: { service: starting, ...form } });
      router.push(`/projects/${project.id}/step/general`);
    } catch (err: any) {
      setError(err.message);
    }
  }

  const shown = (projects || []).filter((p) => !filter || p.service === filter);
  const heading = user.role === 'client' ? 'Your projects' : user.role === 'verifier' ? 'Projects for verification' : 'All projects';

  return (
    <>
      <h1>Welcome, {user.full_name || user.email}</h1>
      <p className="muted">{user.organisation}</p>

      {canStart && (
        <section style={{ marginBottom: 'var(--space-8)' }}>
          <h2>Start a project</h2>
          <div className="grid">
            {SERVICES.map((s) => (
              <div key={s.id} className="tile" style={svcStyle(s)}>
                <span className="short">{s.short}</span>
                <h3>{s.name}</h3>
                <p>{s.summary}</p>
                {starting === s.id ? (
                  <form onSubmit={start}>
                    <label className="field"><span>Project title</span>
                      <input type="text" value={form.title} placeholder={`${s.short} ${form.financial_year}`} onChange={(e) => setForm({ ...form, title: e.target.value })} />
                    </label>
                    <label className="field"><span>Reporting year</span>
                      <select value={form.financial_year} onChange={(e) => setForm({ ...form, financial_year: e.target.value })}>
                        {FINANCIAL_YEARS.map((y) => <option key={y}>{y}</option>)}
                      </select>
                    </label>
                    {clients.length > 0 && (
                      <label className="field"><span>For client</span>
                        <select value={form.owner_id} onChange={(e) => setForm({ ...form, owner_id: e.target.value })}>
                          <option value="">Myself (internal)</option>
                          {clients.map((c) => <option key={c.id} value={c.id}>{c.organisation || c.full_name}</option>)}
                        </select>
                      </label>
                    )}
                    <div className="row">
                      <button className="btn btn-primary">Create</button>
                      <button type="button" className="btn" onClick={() => setStarting(null)}>Cancel</button>
                    </div>
                  </form>
                ) : (
                  <button className="btn" onClick={() => { setStarting(s.id); setForm({ ...form, title: '' }); }}>Start {s.short} project</button>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      <section className="card">
        <div className="spread" style={{ marginBottom: 16 }}>
          <h2 style={{ margin: 0 }}>{heading}</h2>
          <label className="row"><span className="caption">Service</span>
            <select value={filter} onChange={(e) => setFilter(e.target.value)} style={{ width: 'auto' }}>
              <option value="">All services</option>
              {SERVICES.map((s) => <option key={s.id} value={s.id}>{s.short}</option>)}
            </select>
          </label>
        </div>
        {error && <p className="error" role="alert">{error}</p>}
        {projects === null ? (
          <p className="muted">Loading…</p>
        ) : shown.length === 0 ? (
          <p className="muted">No projects yet.{canStart ? ' Start one from a service above.' : ''}</p>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr><th>Service</th><th>Project</th>{user.role !== 'client' && <th>Client</th>}<th>Year</th><th>Status</th><th>Updated</th></tr>
              </thead>
              <tbody>
                {shown.map((p) => {
                  const s = getService(p.service);
                  return (
                    <tr key={p.id}>
                      <td><span className="tile" style={{ ...svcStyle(s), padding: 0, border: 0, display: 'inline' }}><span className="short">{s?.short || p.service}</span></span></td>
                      <td><Link href={`/projects/${p.id}`}>{p.title}</Link></td>
                      {user.role !== 'client' && <td>{p.owner_name || '—'}</td>}
                      <td>{p.financial_year}</td>
                      <td><span className={`badge ${p.status}`}>{STATUS_LABEL[p.status]}</span></td>
                      <td className="caption">{fmtDate(p.updated_at)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </>
  );
}
