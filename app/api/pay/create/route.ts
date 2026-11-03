import type { NextRequest } from 'next/server';
import { cashfreeCreate, checkAmount, enabledGateways, feeFor, gatewayMode, r2, razorpayCreate, type GatewayId, type Method } from '@/lib/server/pay';

export const dynamic = 'force-dynamic';

const hits = new Map<string, number[]>();
function allow(ip: string) {
  const now = Date.now();
  const L = (hits.get(ip) || []).filter((t) => now - t < 600_000);
  if (L.length >= 20) return false;
  L.push(now);
  hits.set(ip, L);
  return true;
}

// POST /api/pay/create — start a payment with the provider the client chose.
// { gateway, method, orderNo, uin (project number), amount, name, email, phone }
export async function POST(req: NextRequest) {
  try {
    const ip = (req.headers.get('x-forwarded-for') || '').split(',')[0].trim() || 'unknown';
    if (!allow(ip)) return Response.json({ error: 'Too many payment attempts. Please wait a few minutes.' }, { status: 429 });
    const b = await req.json().catch(() => ({} as any));
    const gateway = String(b.gateway) as GatewayId;
    if (!enabledGateways().includes(gateway)) return Response.json({ error: 'That payment provider is not available.' }, { status: 400 });
    const method = (['card', 'upi', 'netbanking'].includes(b.method) ? b.method : 'card') as Method;
    const orderNo = String(b.orderNo || '').replace(/[^A-Za-z0-9_-]/g, '').slice(0, 40);
    if (orderNo.length < 3) return Response.json({ error: 'The order number is missing.' }, { status: 400 });
    const uin = String(b.uin || '').replace(/[^A-Za-z0-9_-]/g, '').slice(0, 60);
    const amount = checkAmount(b.amount);
    const fee = feeFor(method, amount);
    const total = r2(amount + fee);
    const cust = { name: String(b.name || '').slice(0, 100), email: String(b.email || '').slice(0, 120), phone: String(b.phone || '').slice(0, 20) };
    if (gateway === 'razorpay') {
      const r = await razorpayCreate(total, orderNo, { order: orderNo, uin, method, invoice: String(amount), fee: String(fee) });
      return Response.json({ gateway, mode: gatewayMode(gateway), amount, fee, total, ...r });
    }
    const c = await cashfreeCreate(total, orderNo, method, cust);
    return Response.json({ gateway, mode: gatewayMode(gateway), amount, fee, total, ...c });
  } catch (e: any) {
    const m = e?.message === 'fetch failed' ? 'The payment provider could not be reached. Please try again in a minute.' : e?.message;
    return Response.json({ error: m || 'The payment could not be started.' }, { status: 400 });
  }
}
