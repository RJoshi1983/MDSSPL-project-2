// Tells the MDSSPL app which Supabase database to use.
// Only the PUBLIC (publishable / anon) key is ever sent; the database's own
// row-level security keeps each signed-in user's data private.
export const dynamic = 'force-dynamic';

export async function GET() {
  const base = (process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || '').replace(/\/+$/, '').replace(/\/rest\/v1$/, '');
  const key = process.env.SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
  // Never hand out a secret key, even if one was pasted into the wrong setting by mistake.
  const secret = /^sb_secret_/.test(key) || /"role"\s*:\s*"service_role"/.test(decodeJwtPayload(key));
  if (!base || !key || secret) return Response.json({ configured: false });
  return Response.json({ configured: true, url: base + '/rest/v1', key });
}

function decodeJwtPayload(k: string): string {
  const p = k.split('.')[1];
  if (!p) return '';
  try {
    return Buffer.from(p.replace(/-/g, '+').replace(/_/g, '/'), 'base64').toString('utf8');
  } catch {
    return '';
  }
}
