'use client';
// The project report: results, the data behind them and the change history.
// "Download PDF" uses the browser's print dialog → "Save as PDF".
import Link from 'next/link';
import { useEffect, useState } from 'react';
import Results from '@/components/Results';
import { useProject } from '@/components/useProject';
import { api } from '@/lib/client';
import { STATUS_LABEL, type Field } from '@/lib/types';
import { fmtDate, svcStyle } from '@/lib/ui';
import { getService } from '@/modules/registry';

function show(f: Field, v: any): string {
  if (v === undefined || v === null || v === '') return '—';
  if (Array.isArray(v)) return f.type === 'table' ? `${v.length} row(s)` : v.join(', ') || '—';
  return `${v}${f.unit ? ' ' + f.unit : ''}`;
}

export default function ReportPage({ params }: { params: { id: string } }) {
  const { view, error } = useProject(params.id);
  const [history, setHistory] = useState<any[]>([]);
  useEffect(() => {
    api<{ history: any[] }>(`/api/projects/${params.id}/history`).then((r) => setHistory(r.history)).catch(() => {});
  }, [params.id]);

  if (error) return <p className="error">{error}</p>;
  if (!view) return <p className="muted">Loading…</p>;
  const { project, results } = view;
  const s = getService(project.service);
  if (!s) return null;
  const g = project.data?.general || {};

  return (
    <div style={svcStyle(s)}>
      <div className="spread no-print" style={{ marginBottom: 16 }}>
        <Link href={`/projects/${project.id}`} className="caption">← Back to project</Link>
        <button className="btn btn-primary" onClick={() => window.print()}>Download PDF / Print</button>
      </div>

      <header className="card" style={{ borderTop: '8px solid var(--c)' }}>
        <p className="caption">MDSSPL · {s.name}</p>
        <h1>{project.title}</h1>
        <p className="muted" style={{ margin: 0 }}>
          {g.organisation || project.owner_name || '—'}{g.facility ? ` · ${g.facility}` : ''}{g.location ? ` · ${g.location}` : ''}<br />
          Reporting year: {project.financial_year || '—'} · Status: <span className={`badge ${project.status}`}>{STATUS_LABEL[project.status]}</span><br />
          Standards: {s.standards.join(', ')}
        </p>
      </header>

      <Results sections={results} />

      <section className="card">
        <h2>Data entered</h2>
        {s.steps.map((st) => {
          const d = project.data?.[st.id] || {};
          return (
            <div key={st.id} style={{ marginBottom: 16 }}>
              <h3>{st.title}</h3>
              <div className="table-wrap">
                <table>
                  <tbody>
                    {st.fields.map((f) => (
                      <tr key={f.key}><td style={{ width: '55%' }}>{f.label}</td><td>{show(f, d[f.key])}</td></tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {st.fields.filter((f) => f.type === 'table' && Array.isArray(d[f.key]) && d[f.key].length).map((f) => (
                <div key={f.key} className="table-wrap" style={{ marginTop: 8 }}>
                  <table>
                    <thead><tr>{f.columns!.map((c) => <th key={c.key}>{c.label}{c.unit ? ` (${c.unit})` : ''}</th>)}</tr></thead>
                    <tbody>{d[f.key].map((r: any, i: number) => <tr key={i}>{f.columns!.map((c) => <td key={c.key}>{r[c.key] ?? '—'}</td>)}</tr>)}</tbody>
                  </table>
                </div>
              ))}
            </div>
          );
        })}
      </section>

      <section className="card">
        <h2>Change history</h2>
        {history.length === 0 ? <p className="muted">No changes recorded.</p> : (
          <div className="table-wrap">
            <table>
              <thead><tr><th>When</th><th>Who</th><th>What</th></tr></thead>
              <tbody>
                {history.map((h) => (
                  <tr key={h.id}>
                    <td className="caption">{fmtDate(h.at)}</td>
                    <td>{h.user_name || '—'}</td>
                    <td>{h.action}{h.detail?.step ? `: ${s.steps.find((x) => x.id === h.detail.step)?.title || h.detail.step}` : ''}{h.detail?.to ? `: ${STATUS_LABEL[h.detail.from as keyof typeof STATUS_LABEL]} → ${STATUS_LABEL[h.detail.to as keyof typeof STATUS_LABEL]}` : ''}{h.detail?.note ? ` — “${h.detail.note}”` : ''}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
      <p className="caption">Emission factors are example values marked “verify latest” in the results. Confirm them against the current source before issuing this report.</p>
    </div>
  );
}
