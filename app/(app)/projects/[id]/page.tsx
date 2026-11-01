'use client';
// Project overview: steps, status and actions.
import Link from 'next/link';
import { useState } from 'react';
import { useProject } from '@/components/useProject';
import { api } from '@/lib/client';
import { STATUS_LABEL, type ProjectStatus } from '@/lib/types';
import { svcStyle } from '@/lib/ui';
import { getService } from '@/modules/registry';

const ACTION_LABEL: Record<ProjectStatus, string> = {
  draft: 'Return to draft',
  submitted: 'Submit for review',
  under_review: 'Start review',
  verified: 'Mark as verified',
};

export default function ProjectPage({ params }: { params: { id: string } }) {
  const { view, error, reload } = useProject(params.id);
  const [note, setNote] = useState('');
  const [msg, setMsg] = useState('');

  if (error) return <p className="error">{error}</p>;
  if (!view) return <p className="muted">Loading…</p>;
  const { project, can } = view;
  const s = getService(project.service);
  if (!s) return <p className="error">Unknown service “{project.service}”.</p>;

  const filled = (id: string) => {
    const v = project.data?.[id];
    return v && Object.values(v).some((x) => (Array.isArray(x) ? x.length > 0 : x !== '' && x !== null && x !== undefined));
  };

  async function changeStatus(to: ProjectStatus) {
    setMsg('');
    try {
      await api(`/api/projects/${project.id}`, { method: 'PATCH', body: { status: to, note } });
      setNote('');
      reload();
    } catch (e: any) {
      setMsg(e.message);
    }
  }

  return (
    <div style={svcStyle(s)}>
      <p className="caption"><Link href="/hub">← Projects</Link></p>
      <div className="stripe" style={{ background: 'var(--c)', borderRadius: 3, marginBottom: 16 }} />
      <div className="spread">
        <div>
          <span className="tile" style={{ padding: 0, border: 0, display: 'inline' }}><span className="short">{s.short}</span></span>
          <h1 style={{ marginTop: 8 }}>{project.title}</h1>
          <p className="muted">{s.name} · {project.financial_year || 'Year not set'} · {project.owner_name || ''}</p>
        </div>
        <span className={`badge ${project.status}`}>{STATUS_LABEL[project.status]}</span>
      </div>

      <section className="card">
        <h2>Data entry</h2>
        <p className="muted">Each step is its own page. Your work is saved when you press “Save” on a step.</p>
        <ol className="steps">
          {s.steps.map((st) => (
            <li key={st.id}>
              <span className="t">{st.title}{filled(st.id) && <span className="ok" style={{ marginLeft: 8, fontSize: 13 }}>✓ entered</span>}</span>
              <Link className="btn" href={`/projects/${project.id}/step/${st.id}`}>{can.edit ? (filled(st.id) ? 'Edit' : 'Enter data') : 'View'}</Link>
            </li>
          ))}
        </ol>
      </section>

      <section className="card">
        <div className="spread">
          <div>
            <h2 style={{ margin: 0 }}>Report</h2>
            <p className="muted" style={{ margin: 0 }}>Results are calculated live from the data entered.</p>
          </div>
          <Link className="btn btn-primary" href={`/projects/${project.id}/report`}>Open report</Link>
        </div>
      </section>

      {can.statuses.length > 0 && (
        <section className="card">
          <h2>Workflow</h2>
          <label className="field"><span>Note (optional)</span>
            <input type="text" value={note} onChange={(e) => setNote(e.target.value)} placeholder="e.g. Please attach the March electricity bill" />
          </label>
          <div className="row">
            {can.statuses.map((st) => (
              <button key={st} className={st === 'draft' ? 'btn' : 'btn btn-primary'} onClick={() => changeStatus(st)}>{ACTION_LABEL[st]}</button>
            ))}
          </div>
          {msg && <p className="error" role="alert">{msg}</p>}
        </section>
      )}
    </div>
  );
}
