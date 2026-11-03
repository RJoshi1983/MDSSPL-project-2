import { publicKeyJson } from '@/lib/server/licence';

export const dynamic = 'force-dynamic';

// GET /api/licence/public-key: the public key that checks activation codes (safe to share).
export async function GET() {
  return Response.json({ publicKey: JSON.parse(publicKeyJson()) });
}
