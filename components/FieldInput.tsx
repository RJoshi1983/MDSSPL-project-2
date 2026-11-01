'use client';
// Draws one form field of a service step (text, number, list, table…).
import type { Column, Field } from '@/lib/types';

function Cell({ col, value, onChange, disabled }: { col: Column; value: any; onChange: (v: any) => void; disabled?: boolean }) {
  if (col.type === 'select') {
    return (
      <select aria-label={col.label} value={value ?? ''} onChange={(e) => onChange(e.target.value)} disabled={disabled}>
        <option value="">Select…</option>
        {col.options?.map((o) => <option key={o}>{o}</option>)}
      </select>
    );
  }
  return (
    <input
      aria-label={col.label}
      type={col.type === 'number' ? 'number' : 'text'}
      step="any"
      value={value ?? ''}
      onChange={(e) => onChange(e.target.value)}
      disabled={disabled}
    />
  );
}

export default function FieldInput({ field, value, onChange, disabled }: { field: Field; value: any; onChange: (v: any) => void; disabled?: boolean }) {
  const id = `f-${field.key}`;
  const hint = field.hint ? <span className="hint">{field.hint}</span> : null;

  if (field.type === 'table') {
    const rows: Record<string, any>[] = Array.isArray(value) ? value : [];
    const cols = field.columns || [];
    const update = (i: number, key: string, v: any) => onChange(rows.map((r, j) => (j === i ? { ...r, [key]: v } : r)));
    return (
      <div className="field" style={{ marginBottom: 'var(--space-6)' }}>
        <h3>{field.label}</h3>
        {hint}
        <div className="table-wrap" style={{ marginTop: 8 }}>
          <table className="edit-table">
            <thead>
              <tr>
                {cols.map((c) => <th key={c.key}>{c.label}{c.unit ? ` (${c.unit})` : ''}</th>)}
                <th aria-label="Actions" />
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 && (
                <tr><td colSpan={cols.length + 1} className="muted">No rows yet. Click “Add row”.</td></tr>
              )}
              {rows.map((r, i) => (
                <tr key={i}>
                  {cols.map((c) => (
                    <td key={c.key}><Cell col={c} value={r[c.key]} onChange={(v) => update(i, c.key, v)} disabled={disabled} /></td>
                  ))}
                  <td>
                    {!disabled && (
                      <button type="button" className="btn btn-danger" onClick={() => onChange(rows.filter((_, j) => j !== i))}>Delete</button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {!disabled && (
          <button type="button" className="btn" style={{ marginTop: 8 }} onClick={() => onChange([...rows, {}])}>+ Add row</button>
        )}
      </div>
    );
  }

  if (field.type === 'multiselect') {
    const sel: string[] = Array.isArray(value) ? value : [];
    return (
      <fieldset className="field" style={{ border: 0, padding: 0, margin: '0 0 var(--space-4)' }}>
        <legend style={{ fontWeight: 600, marginBottom: 6 }}>{field.label}</legend>
        <div className="checks">
          {field.options?.map((o) => (
            <label key={o}>
              <input
                type="checkbox"
                checked={sel.includes(o)}
                disabled={disabled}
                onChange={(e) => onChange(e.target.checked ? [...sel, o] : sel.filter((x) => x !== o))}
              />
              {o}
            </label>
          ))}
        </div>
        {hint}
      </fieldset>
    );
  }

  let control;
  if (field.type === 'select') {
    control = (
      <select id={id} value={value ?? ''} onChange={(e) => onChange(e.target.value)} disabled={disabled}>
        <option value="">Select…</option>
        {field.options?.map((o) => <option key={o}>{o}</option>)}
      </select>
    );
  } else if (field.type === 'textarea') {
    control = <textarea id={id} value={value ?? ''} onChange={(e) => onChange(e.target.value)} disabled={disabled} />;
  } else {
    const input = (
      <input
        id={id}
        type={field.type === 'number' ? 'number' : 'text'}
        step="any"
        value={value ?? ''}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
      />
    );
    control = field.unit ? <div className="unit-wrap">{input}<span className="unit">{field.unit}</span></div> : input;
  }

  return (
    <label className="field" htmlFor={id}>
      <span>{field.label}{field.required ? ' *' : ''}</span>
      {control}
      {hint}
    </label>
  );
}
