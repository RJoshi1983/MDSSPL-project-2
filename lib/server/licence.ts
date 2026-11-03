// Licence (activation code) checking on the server. Only the PUBLIC key lives here:
// it can check codes but cannot make them. The private key stays offline with the administrator.
import { webcrypto } from 'crypto';

export const BUILTIN_PUBLIC_KEY = '{"crv":"P-256","ext":true,"key_ops":["verify"],"kty":"EC","x":"iwAToS9hEzerHwuX2PFMmyoCIfcuA83SFJIPnXUqBAA","y":"MTETQT36-Z3NZyZ4WF-WDTo5ToUpxpE98X3qn8h-4KE"}';

export function publicKeyJson(): string {
  const env = (process.env.LICENCE_PUBLIC_KEY || '').trim();
  const k = env || BUILTIN_PUBLIC_KEY;
  try {
    const j = JSON.parse(k);
    if (j.d) throw new Error('private');
    return JSON.stringify(j);
  } catch {
    return BUILTIN_PUBLIC_KEY;
  }
}

const b64u = (s: string) => Buffer.from(s.replace(/-/g, '+').replace(/_/g, '/'), 'base64');

export async function verifyCode(code: string): Promise<{ ok: boolean; payload?: unknown; error?: string }> {
  const parts = String(code || '').trim().split('.');
  if (parts.length !== 2) return { ok: false, error: 'The code is not in the right format.' };
  let payload: unknown;
  try {
    payload = JSON.parse(b64u(parts[0]).toString('utf8'));
  } catch {
    return { ok: false, error: 'The code is not readable.' };
  }
  try {
    const key = await webcrypto.subtle.importKey('jwk', JSON.parse(publicKeyJson()), { name: 'ECDSA', namedCurve: 'P-256' }, false, ['verify']);
    const ok = await webcrypto.subtle.verify({ name: 'ECDSA', hash: 'SHA-256' }, key, b64u(parts[1]), b64u(parts[0]));
    if (!ok) return { ok: false, error: 'The signature is not valid.' };
    const x = (payload as { x?: string }).x;
    if (x && /^\d{4}-\d{2}-\d{2}/.test(x) && new Date(x).getTime() < Date.now() && (payload as { k?: string }).k) return { ok: false, payload, error: 'The code has expired.' };
    return { ok: true, payload };
  } catch {
    return { ok: false, error: 'The code could not be checked.' };
  }
}
