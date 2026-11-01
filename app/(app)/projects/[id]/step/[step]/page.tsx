'use client';
// One data-entry step on its own page.
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import FieldInput from '@/components/FieldInput';
import { useProject } from '@/components/useProject';
import { api } from '@/lib/client';
import { svcStyle } from '@/lib/ui';
import { getService } from '@/modules/registry';

export default function StepPage({ params }: { params: { id: string; step: string } }) {
  const router = useRouter();
  const { view, error } = useProject(params.id);
  const [values, setValues] = useState<Record<string, any>>({});
  const [msg, setMsg] = useState<{ kind: 'ok' | 'error'; text: string } | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (view) setValues(view.project.data?.[params.step] || {});
  }, [view, params.step]);

  if (error) return <p className="error">{error}</p>;
  if (!view) return <p className="muted">Loading…</p>;
  const { project, can } = view;
  const s = getService(project.service);
  const idx = s?.steps.findIndex((x) => x.id === params.step) ?? -1;
  if (!s || idx < 0) return <p className="error">Step not found.</p>;
  const step = s.steps[idx];
  const next = s.steps[idx + 1];
  const prev = s.steps[idx - 1];

  async function save(goNext: boolean) {
    setSaving(true);
    setMsg(null);
    const missing = step.fields.filter((f) => f.required && !String(values[f.key] ?? '').trim()).map((f) => f.label);
    if (missing.length) {
      setSaving(false);
      setMsg({ kind: 'error', text: `Please fill in: ${missing.join(', ')}.` });
      return;
    }
    try {
      await api(`/api/projects/${project.id}`, { method: 'PATCH', body: { step: step.id, values } });
      if (goNext) router.push(next ? `/projects/${project.id}/step/${next.id}` : `/projects/${project.id}/report`);
      else setMsg({ kind: 'ok', text: 'Saved.' });
    } catch (e: any) {
      setMsg({ kind: 'error', text: e.message });
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="narrow" style={{ ...svcStyle(s), margin: '0 auto' }}>
      <p className="caption"><Link href={`/projects/${project.id}`}>← {project.title}</Link></p>
      <div className="progress" aria-label={`Step ${idx + 1} of ${s.steps.length}`}>
        {s.steps.map((x, i) => <span key={x.id} className={i <= idx ? 'on' : ''} />)}
      </div>
      <p className="caption">{s.short} · Step {idx + 1} of {s.steps.length}</p>
      <h1 style={{ fontSize: 26, lineHeight: '32px' }}>{step.title}</h1>
      {step.intro && <p className="muted">{step.intro}</p>}
      {!can.edit && <p className="badge" style={{ marginBottom: 16 }}>Read only — this project is {project.status.replace('_', ' ')}.</p>}

      <form className="card" onSubmit={(e) => { e.preventDefault(); save(true); }}>
        {step.fields.map((f) => (
          <FieldInput key={f.key} field={f} value={values[f.key]} disabled={!can.edit} onChange={(v) => setValues((old) => ({ ...old, [f.key]: v }))} />
        ))}
        {msg && <p className={msg.kind} role="alert">{msg.text}</p>}
        <div className="spread no-print">
          {prev ? <Link className="btn" href={`/projects/${project.id}/step/${prev.id}`}>← Back</Link> : <span />}
          <div className="row">
            {can.edit && <button type="button" className="btn" disabled={saving} onClick={() => save(false)}>Save</button>}
            {can.edit ? (
              <button className="btn btn-primary" disabled={saving}>{saving ? 'Saving…' : next ? 'Save and continue →' : 'Save and see report →'}</button>
            ) : (
              <Link className="btn btn-primary" href={next ? `/projects/${project.id}/step/${next.id}` : `/projects/${project.id}/report`}>Next →</Link>
            )}
          </div>
        </div>
      </form>
    </div>
  );
}
