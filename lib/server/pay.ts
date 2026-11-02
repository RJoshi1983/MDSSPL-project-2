// ONLINE PAYMENTS — Razorpay and Cashfree.
// Everything MDSSPL decides lives in Render → Environment (no code change needed):
//   PAY_GATEWAYS        which providers clients may choose, in order, e.g. "razorpay,cashfree"
//   PAY_CARD_FEE_PCT    convenience fee added to CARD payments only (e.g. 2). UPI and net banking: no fee.
//   PAY_UPI_ID          your UPI ID for free direct UPI payments (QR code + UPI apps)
//   RAZORPAY_KEY_ID / RAZORPAY_KEY_SECRET           from Razorpay Dashboard → Account & Settings → API Keys
//   CASHFREE_APP_ID / CASHFREE_SECRET_KEY / CASHFREE_ENV ("sandbox" or "production")
// Secret keys stay on the server and are never sent to the browser.
import crypto from 'crypto';

export type GatewayId = 'razorpay' | 'cashfree';
export type Method = 'card' | 'upi' | 'netbanking';

export const GATEWAY_NAMES: Record<GatewayId, string> = { razorpay: 'Razorpay', cashfree: 'Cashfree' };

function hasKeys(id: GatewayId): boolean {
  if (id === 'razorpay') return !!(process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET);
  return !!(process.env.CASHFREE_APP_ID && process.env.CASHFREE_SECRET_KEY);
}

export function enabledGateways(): GatewayId[] {
  const wanted = (process.env.PAY_GATEWAYS || 'razorpay,cashfree')
    .split(',')
    .map((s) => s.trim().toLowerCase())
    .filter((s): s is GatewayId => s === 'razorpay' || s === 'cashfree');
  return wanted.filter((g, i) => wanted.indexOf(g) === i && hasKeys(g));
}

export function gatewayMode(id: GatewayId): 'test' | 'live' {
  if (id === 'razorpay') return (process.env.RAZORPAY_KEY_ID || '').startsWith('rzp_live_') ? 'live' : 'test';
  return (process.env.CASHFREE_ENV || 'sandbox').toLowerCase() === 'production' ? 'live' : 'test';
}

export function cardFeePct(): number {
  const v = parseFloat(process.env.PAY_CARD_FEE_PCT || '0');
  return Number.isFinite(v) && v > 0 && v <= 5 ? v : 0;
}

export const r2 = (x: number) => Math.round((x + Number.EPSILON) * 100) / 100;

export function feeFor(method: Method, amount: number): number {
  return method === 'card' ? r2((amount * cardFeePct()) / 100) : 0;
}

const MAX_AMOUNT = Number(process.env.PAY_MAX_AMOUNT || 5_000_000); // ₹50 lakh safety limit

export function checkAmount(a: unknown): number {
  const n = typeof a === 'number' ? a : parseFloat(String(a));
  if (!Number.isFinite(n) || n < 1 || n > MAX_AMOUNT) throw new Error('The amount is not valid.');
  return r2(n);
}

// ---------------- Razorpay ----------------
function rzAuth() {
  return 'Basic ' + Buffer.from(`${process.env.RAZORPAY_KEY_ID}:${process.env.RAZORPAY_KEY_SECRET}`).toString('base64');
}

export async function razorpayCreate(total: number, orderNo: string, notes: Record<string, string>) {
  const res = await fetch('https://api.razorpay.com/v1/orders', {
    method: 'POST',
    headers: { 'content-type': 'application/json', authorization: rzAuth() },
    body: JSON.stringify({ amount: Math.round(total * 100), currency: 'INR', receipt: orderNo.slice(0, 40), notes }),
  });
  const j: any = await res.json().catch(() => ({}));
  if (!res.ok || !j.id) throw new Error('Razorpay could not start the payment' + (j?.error?.description ? ': ' + j.error.description : '.'));
  return { gwOrderId: j.id as string, amountMinor: j.amount as number, keyId: process.env.RAZORPAY_KEY_ID as string };
}

export async function razorpayVerify(orderId: string, paymentId: string, signature: string) {
  const expected = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET as string).update(`${orderId}|${paymentId}`).digest('hex');
  const a = Buffer.from(expected);
  const b = Buffer.from(String(signature || ''));
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) throw new Error('The payment signature does not match.');
  const res = await fetch(`https://api.razorpay.com/v1/payments/${encodeURIComponent(paymentId)}`, { headers: { authorization: rzAuth() } });
  const p: any = await res.json().catch(() => ({}));
  if (!res.ok || p.order_id !== orderId) throw new Error('The payment could not be confirmed with Razorpay.');
  if (!['authorized', 'captured'].includes(p.status)) throw new Error('The payment is ' + (p.status || 'not complete') + '.');
  return { ref: paymentId, amount: r2((p.amount || 0) / 100), method: String(p.method || ''), status: p.status as string };
}

// ---------------- Cashfree ----------------
function cfBase() {
  return gatewayMode('cashfree') === 'live' ? 'https://api.cashfree.com/pg' : 'https://sandbox.cashfree.com/pg';
}
function cfHeaders() {
  return {
    'content-type': 'application/json',
    'x-client-id': process.env.CASHFREE_APP_ID as string,
    'x-client-secret': process.env.CASHFREE_SECRET_KEY as string,
    'x-api-version': '2023-08-01',
  };
}

export async function cashfreeCreate(total: number, orderNo: string, method: Method, cust: { name: string; email: string; phone: string }) {
  const phone = String(cust.phone || '').replace(/\D/g, '').slice(-10);
  if (phone.length < 10) throw new Error('A 10-digit phone number is needed for Cashfree. Add it to your registration details.');
  const gwOrderId = (orderNo.replace(/[^A-Za-z0-9_-]/g, '-') + '-' + Date.now().toString(36)).slice(0, 45);
  const res = await fetch(cfBase() + '/orders', {
    method: 'POST',
    headers: cfHeaders(),
    body: JSON.stringify({
      order_id: gwOrderId,
      order_amount: total,
      order_currency: 'INR',
      customer_details: { customer_id: ('c' + (cust.email || phone).replace(/[^A-Za-z0-9_-]/g, '_')).slice(0, 50), customer_email: cust.email || undefined, customer_phone: phone, customer_name: cust.name || undefined },
      order_meta: { payment_methods: method === 'card' ? 'cc,dc' : method === 'upi' ? 'upi' : 'nb' },
      order_note: orderNo,
    }),
  });
  const j: any = await res.json().catch(() => ({}));
  if (!res.ok || !j.payment_session_id) throw new Error('Cashfree could not start the payment' + (j?.message ? ': ' + j.message : '.'));
  return { gwOrderId, sessionId: j.payment_session_id as string };
}

export async function cashfreeVerify(gwOrderId: string) {
  const res = await fetch(cfBase() + '/orders/' + encodeURIComponent(gwOrderId), { headers: cfHeaders() });
  const j: any = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error('The payment could not be confirmed with Cashfree.');
  if (j.order_status !== 'PAID') throw new Error('The payment is ' + String(j.order_status || 'not complete').toLowerCase() + '.');
  let ref = gwOrderId;
  let method = '';
  const pr = await fetch(cfBase() + '/orders/' + encodeURIComponent(gwOrderId) + '/payments', { headers: cfHeaders() });
  const pj: any = await pr.json().catch(() => []);
  const ok = Array.isArray(pj) ? pj.find((p: any) => p.payment_status === 'SUCCESS') : null;
  if (ok) {
    ref = String(ok.cf_payment_id || ref);
    method = String(ok.payment_group || '');
  }
  return { ref, amount: r2(Number(j.order_amount) || 0), method, status: 'PAID' };
}
