import { verifyCode } from '@/lib/server/licence';

export const dynamic = 'force-dynamic';

const hits = new Map<string, { n: number; t: number }>();

// POST /api/licence/verify { code }: checks an activation code, access notice or token signed with the MDSSPL private key.
export async function POST(req: Request) {
  const ip = (req.headers.get('x-forwarded-for') || 'local').split(',')[0].trim();
  const now = Date.now();
  const h = hits.get(ip);
  if (h && now - h.t < 10 * 60 * 1000) {
    if (h.n >= 30) return Response.json({ ok: false, error: 'Too many checks. Try again in 10 minutes.' }, { status: 429 });
    h.n++;
  } else hits.set(ip, { n: 1, t: now });
  let body: { code?: string } = {};
  try {
    body = await req.json();
  } catch {
    return Response.json({ ok: false, error: 'Send JSON: {"code": "..."}' }, { status: 400 });
  }
  if (!body.code || body.code.length > 4000) return Response.json({ ok: false, error: 'No code.' }, { status: 400 });
  return Response.json(await verifyCode(body.code));
}
