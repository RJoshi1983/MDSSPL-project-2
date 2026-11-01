// Shows the calculated results of a project as tables.
import type { ResultSection } from '@/lib/types';

const fmt = (v: number | string) => (typeof v === 'number' ? v.toLocaleString('en-IN', { maximumFractionDigits: 3 }) : v);

export default function Results({ sections }: { sections: ResultSection[] }) {
  return (
    <>
      {sections.map((s) => (
        <section key={s.title} className="card">
          <h2>{s.title}</h2>
          {s.rows.length === 0 ? (
            <p className="muted">Nothing entered yet.</p>
          ) : (
            <div className="table-wrap">
              <table>
                <tbody>
                  {s.rows.map((r, i) => (
                    <tr key={i} className={r.strong ? 'strong' : ''}>
                      <td>{r.label}{r.note && <span className="hint">{r.note}</span>}</td>
                      <td className={typeof r.value === 'number' ? 'num' : 'val'}>{fmt(r.value)}{r.unit ? ` ${r.unit}` : ''}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      ))}
    </>
  );
}
