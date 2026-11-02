import type { NextRequest } from 'next/server';

// AI for the MDSSPL app (file extraction, translation, report text, help desk).
// The app sends { prompt, tier } and expects { json: <parsed JSON reply> }.
// The Anthropic key stays on this server (ANTHROPIC_API_KEY in Render).
export const dynamic = 'force-dynamic';

const QUICK = process.env.ANTHROPIC_MODEL_QUICK || 'claude-haiku-5-5';
const DEFAULT = process.env.ANTHROPIC_MODEL || 'claude-sonnet-5-5';
const PER_HOUR = Number(process.env.AI_MAX_PER_HOUR || 60);
const MAX_PROMPT = 220_000; // characters (file extraction sends up to 200,000)

const hits = new Map<string, number[]>();
function allow(ip: string): boolean {
  const now = Date.now();
  const recent = (hits.get(ip) || []).filter((t) => now - t < 3600_000);
  if (recent.length >= PER_HOUR) return false;
  recent.push(now);
  hits.set(ip, recent);
  return true;
}

function fail(status: number, code: string, error: string) {
  return Response.json({ code, error }, { status });
}

export async function GET() {
  return Response.json({ configured: !!process.env.ANTHROPIC_API_KEY });
}

export async function POST(req: NextRequest) {
  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) return fail(503, 'not_configured', 'AI is not set up on this site yet.');
  const ip = (req.headers.get('x-forwarded-for') || '').split(',')[0].trim() || 'unknown';
  if (!allow(ip)) return fail(429, 'rate_limited', 'Too many AI requests from this connection. Try again in an hour.');

  const body = await req.json().catch(() => ({} as any));
  const prompt = typeof body.prompt === 'string' ? body.prompt : '';
  if (!prompt.trim()) return fail(400, 'bad_request', 'Empty prompt.');
  if (prompt.length > MAX_PROMPT) return fail(413, 'too_large', 'The request is too large.');

  const res = await fetch(process.env.ANTHROPIC_API_URL || 'https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: { 'content-type': 'application/json', 'x-api-key': key, 'anthropic-version': '2023-06-01' },
    body: JSON.stringify({
      model: body.tier === 'quick' ? QUICK : DEFAULT,
      max_tokens: 4096,
      system: 'You power features of the MDSSPL sustainability services app. Follow the user prompt exactly. Reply with valid JSON only: no prose, no code fences.',
      messages: [{ role: 'user', content: prompt }],
    }),
  }).catch(() => null);
  if (!res) return fail(502, 'upstream', 'The AI service could not be reached.');
  const j: any = await res.json().catch(() => ({}));
  if (!res.ok) {
    console.error('AI error', res.status, j?.error?.message);
    return fail(502, 'upstream', 'The AI service answered with an error.');
  }
  const text: string = (j.content || []).filter((c: any) => c.type === 'text').map((c: any) => c.text).join('').trim();
  const parsed = parseJson(text);
  if (parsed === undefined) return fail(502, 'bad_json', 'The AI reply was not valid JSON.');
  return Response.json({ json: parsed });
}

function parseJson(t: string): any {
  const s = t.replace(/^```(?:json)?\s*/i, '').replace(/```\s*$/, '').trim();
  try {
    return JSON.parse(s);
  } catch {
    const a = s.search(/[\[{]/);
    const b = Math.max(s.lastIndexOf('}'), s.lastIndexOf(']'));
    if (a >= 0 && b > a) {
      try {
        return JSON.parse(s.slice(a, b + 1));
      } catch {}
    }
  }
  return undefined;
}
