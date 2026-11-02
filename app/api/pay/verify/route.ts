import type { NextRequest } from 'next/server';
import { cashfreeVerify, enabledGateways, razorpayVerify, type GatewayId } from '@/lib/server/pay';

export const dynamic = 'force-dynamic';

// POST /api/pay/verify — confirm with the provider that the money was really paid.
// Razorpay: { gateway, gwOrderId, paymentId, signature }   Cashfree: { gateway, gwOrderId }
export async function POST(req: NextRequest) {
  try {
    const b = await req.json().catch(() => ({} as any));
    const gateway = String(b.gateway) as GatewayId;
    if (!enabledGateways().includes(gateway)) return Response.json({ error: 'That payment provider is not available.' }, { status: 400 });
    const r = gateway === 'razorpay'
      ? await razorpayVerify(String(b.gwOrderId || ''), String(b.paymentId || ''), String(b.signature || ''))
      : await cashfreeVerify(String(b.gwOrderId || ''));
    console.log('payment verified', gateway, r.ref, r.amount);
    return Response.json({ ok: true, gateway, ...r });
  } catch (e: any) {
    const m = e?.message === 'fetch failed' ? 'The payment provider could not be reached to confirm the payment. If money was taken, enter the payment ID in the form below.' : e?.message;
    return Response.json({ ok: false, error: m || 'The payment could not be confirmed.' }, { status: 400 });
  }
}
