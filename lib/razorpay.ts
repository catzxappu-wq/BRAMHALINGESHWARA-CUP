import Razorpay from 'razorpay';
import crypto from 'crypto';

const key_id = process.env.RAZORPAY_KEY_ID || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || '';
const key_secret = process.env.RAZORPAY_KEY_SECRET || '';
const webhook_secret = process.env.RAZORPAY_WEBHOOK_SECRET || '';

export function isRazorpayConfigured(): boolean {
  return Boolean(key_id && key_secret);
}

export function getRazorpayClient(): Razorpay | null {
  if (!isRazorpayConfigured()) {
    return null;
  }
  return new Razorpay({
    key_id,
    key_secret,
  });
}

export async function createPaymentOrder(
  amountInRupees: number,
  receipt: string,
  notes: Record<string, string> = {}
) {
  const client = getRazorpayClient();
  if (!client) {
    throw new Error('PAYMENT_GATEWAY_NOT_CONFIGURED');
  }

  // Razorpay takes amount in paise (1 INR = 100 paise)
  const amountInPaise = Math.round(amountInRupees * 100);

  const order = await client.orders.create({
    amount: amountInPaise,
    currency: 'INR',
    receipt,
    notes,
    payment_capture: true,
  });

  return order;
}

export function verifyPaymentSignature(
  orderId: string,
  paymentId: string,
  signature: string
): boolean {
  if (!key_secret) return false;

  const generatedSignature = crypto
    .createHmac('sha256', key_secret)
    .update(`${orderId}|${paymentId}`)
    .digest('hex');

  return generatedSignature === signature;
}

export function verifyWebhookSignature(
  rawBody: string,
  receivedSignature: string
): boolean {
  if (!webhook_secret) return false;

  const expectedSignature = crypto
    .createHmac('sha256', webhook_secret)
    .update(rawBody)
    .digest('hex');

  return expectedSignature === receivedSignature;
}
