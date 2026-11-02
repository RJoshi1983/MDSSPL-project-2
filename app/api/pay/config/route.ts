import { cardFeePct, enabledGateways, GATEWAY_NAMES, gatewayMode } from '@/lib/server/pay';

export const dynamic = 'force-dynamic';

// GET /api/pay/config — what the payment screen may offer (no secrets).
export async function GET() {
  const gateways = enabledGateways().map((id) => ({ id, name: GATEWAY_NAMES[id], mode: gatewayMode(id), methods: ['card', 'upi', 'netbanking'] }));
  return Response.json({ gateways, cardFeePct: cardFeePct(), upiId: (process.env.PAY_UPI_ID || '').trim(), upiName: (process.env.PAY_UPI_NAME || '').trim() });
}
