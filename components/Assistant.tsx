'use client';
// AI ASSISTANT (front end): a "Ask the assistant" button on every signed-in page.
import { usePathname } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { api } from '@/lib/client';

interface Msg { role: 'user' | 'assistant'; content: string }

const SUGGESTIONS = [
  'What do I need to enter on this step?',
  'Explain these results in simple words.',
  'Which standard does this service follow?',
];

export default function Assistant() {
  const path = usePathname() || '';
  const projectId = path.match(/^\/projects\/([^/]+)/)?.[1];
  const [open, setOpen] = useState(false);
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [text, setText] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const end = useRef<HTMLDivElement>(null);

  useEffect(() => { end.current?.scrollIntoView({ block: 'end' }); }, [msgs, busy, open]);

  async function send(q: string) {
    const question = q.trim();
    if (!question || busy) return;
    const next: Msg[] = [...msgs, { role: 'user', content: question }];
    setMsgs(next);
    setText('');
    setBusy(true);
    setError('');
    try {
      const { reply } = await api<{ reply: string }>('/api/assistant', { method: 'POST', body: { messages: next, projectId } });
      setMsgs([...next, { role: 'assistant', content: reply }]);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  }

  if (!open) {
    return (
      <button className="btn btn-primary assistant-fab no-print" onClick={() => setOpen(true)} aria-label="Open the assistant">
        Ask the assistant
      </button>
    );
  }

  return (
    <section className="assistant no-print" aria-label="Assistant">
      <header className="assistant-head">
        <div>
          <strong>MDSSPL assistant</strong>
          <span className="caption" style={{ color: 'inherit', opacity: .85, display: 'block' }}>{projectId ? 'Knows the project you have open' : 'Ask about any service'}</span>
        </div>
        <button className="btn" onClick={() => setOpen(false)} aria-label="Close the assistant">Close</button>
      </header>
      <div className="assistant-body">
        {msgs.length === 0 && (
          <div>
            <p className="muted" style={{ marginBottom: 8 }}>Try asking:</p>
            {SUGGESTIONS.map((s) => (
              <button key={s} className="btn assistant-suggest" onClick={() => send(s)}>{s}</button>
            ))}
          </div>
        )}
        {msgs.map((m, i) => (
          <div key={i} className={`bubble ${m.role === "user" ? "bubble-user" : "bubble-ai"}`}>{m.content}</div>
        ))}
        {busy && <div className="bubble bubble-ai muted">Thinking…</div>}
        {error && <p className="error" role="alert">{error}</p>}
        <div ref={end} />
      </div>
      <form className="assistant-form" onSubmit={(e) => { e.preventDefault(); send(text); }}>
        <textarea
          aria-label="Your question"
          value={text}
          placeholder="Type your question…"
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(text); } }}
        />
        <button className="btn btn-primary" disabled={busy || !text.trim()}>Send</button>
      </form>
      <p className="caption" style={{ margin: '0 12px 10px' }}>AI answers can be wrong. Check figures against the standard before using them.</p>
    </section>
  );
}
