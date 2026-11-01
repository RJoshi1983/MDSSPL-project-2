'use client';
// Admin: everyone with an account, and their role.
import { useEffect, useState } from 'react';
import { useUser } from '@/components/AppShell';
import { api } from '@/lib/client';
import { ROLES, type Profile, type Role } from '@/lib/types';

export default function Admin() {
  const me = useUser();
  const [users, setUsers] = useState<Profile[] | null>(null);
  const [msg, setMsg] = useState<{ kind: 'ok' | 'error'; text: string } | null>(null);

  const load = () => api<{ users: Profile[] }>('/api/users').then((r) => setUsers(r.users)).catch((e) => setMsg({ kind: 'error', text: e.message }));
  useEffect(() => { load(); }, []);

  async function change(u: Profile, role: Role) {
    setMsg(null);
    try {
      await api(`/api/users/${u.id}`, { method: 'PATCH', body: { role } });
      setMsg({ kind: 'ok', text: `${u.full_name || u.email} is now ${ROLES.find((r) => r.id === role)?.label}.` });
      load();
    } catch (e: any) {
      setMsg({ kind: 'error', text: e.message });
    }
  }

  return (
    <>
      <h1>Users and roles</h1>
      <p className="muted">
        New clients register themselves. To add a consultant, verifier or admin, ask them to register on the client page, then change their role here.
      </p>
      <section className="card">
        <dl className="caption" style={{ margin: '0 0 16px' }}>
          {ROLES.map((r) => <div key={r.id}><strong>{r.label}:</strong> {r.description}</div>)}
        </dl>
        {msg && <p className={msg.kind} role="alert">{msg.text}</p>}
        {!users ? <p className="muted">Loading…</p> : (
          <div className="table-wrap">
            <table>
              <thead><tr><th>Name</th><th>Organisation</th><th>Email</th><th>Role</th></tr></thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id}>
                    <td>{u.full_name || '—'}</td>
                    <td>{u.organisation || '—'}</td>
                    <td>{u.email}</td>
                    <td>
                      {me.role === 'admin' ? (
                        <select aria-label={`Role for ${u.email}`} value={u.role} onChange={(e) => change(u, e.target.value as Role)} style={{ width: 'auto' }}>
                          {ROLES.map((r) => <option key={r.id} value={r.id}>{r.label}</option>)}
                        </select>
                      ) : ROLES.find((r) => r.id === u.role)?.label}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </>
  );
}
