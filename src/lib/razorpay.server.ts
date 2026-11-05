// Server-only Razorpay helpers. Keys live in the encrypted secret store and
// are read inside handlers, never in browser code.
import { createHmac, timingSafeEqual } from "node:crypto";

export type RazorpayConfig = {
  keyId: string;
  keySecret: string;
  configured: boolean;
  // Test mode whenever test keys (or no keys) are in use — used to relax
  // catalogue checks while the storefront stays unpublished.
  testMode: boolean;
};

export function razorpayConfig(): RazorpayConfig {
  const keyId = process.env["RAZORPAY_KEY_ID"] ?? "";
  const keySecret = process.env["RAZORPAY_KEY_SECRET"] ?? "";
  return {
    keyId,
    keySecret,
    configured: Boolean(keyId && keySecret),
    testMode: !keyId || keyId.startsWith("rzp_test_"),
  };
}

export type RazorpayOrder = { id: string; amount: number; currency: string; status: string };

export async function createRazorpayOrder(opts: {
  amountInr: number;
  receipt: string;
  notes: Record<string, string>;
}): Promise<RazorpayOrder> {
  const { keyId, keySecret } = razorpayConfig();
  const response = await fetch("https://api.razorpay.com/v1/orders", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      authorization: `Basic ${btoa(`${keyId}:${keySecret}`)}`,
    },
    body: JSON.stringify({
      amount: Math.round(opts.amountInr * 100),
      currency: "INR",
      receipt: opts.receipt,
      notes: opts.notes,
    }),
  });
  if (!response.ok) throw new Error(`Razorpay order creation failed (${response.status})`);
  return (await response.json()) as RazorpayOrder;
}

function safeEqual(a: string, b: string): boolean {
  const ba = Buffer.from(a);
  const bb = Buffer.from(b);
  return ba.length === bb.length && timingSafeEqual(ba, bb);
}

// Verifies the checkout callback: HMAC_SHA256(order_id|payment_id, key_secret).
export function verifyPaymentSignature(
  opts: { orderId: string; paymentId: string; signature: string },
  keySecret: string,
): boolean {
  const expected = createHmac("sha256", keySecret)
    .update(`${opts.orderId}|${opts.paymentId}`)
    .digest("hex");
  return safeEqual(expected, opts.signature.trim());
}

// Verifies webhook deliveries: HMAC_SHA256(raw_body, webhook_secret).
export function verifyWebhookSignature(
  rawBody: string,
  signature: string,
  webhookSecret: string,
): boolean {
  const expected = createHmac("sha256", webhookSecret).update(rawBody).digest("hex");
  return safeEqual(expected, signature.trim());
}
