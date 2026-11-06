// Server-only refund orchestration. Full refunds only; the amount is always
// computed from stored order records (subtotal − discount, shipping excluded)
// and never accepted from a caller.
import { refundAmountFor } from "@/lib/cancellation-policy";
import { createRazorpayRefund, listRazorpayRefunds } from "@/lib/razorpay.server";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AdminClient = any;

export class RefundError extends Error {}

export type RefundKind = "cancellation" | "return";

/**
 * Creates (or returns the existing) full refund for an order's captured
 * Razorpay payment. Idempotent via a unique idempotency key, a unique
 * Razorpay refund ID, and a check for prior non-failed refunds.
 */
export async function createFullRefund(
  admin: AdminClient,
  opts: { orderId: string; kind: RefundKind; reason: string; idempotencyKey: string },
) {
  const { data: order } = await admin
    .from("orders")
    .select("id, subtotal, discount")
    .eq("id", opts.orderId)
    .single();
  if (!order) throw new RefundError("ORDER_NOT_FOUND");

  const { data: payment } = await admin
    .from("payments")
    .select("id, razorpay_payment_id, status, amount")
    .eq("order_id", opts.orderId)
    .maybeSingle();
  if (!payment?.razorpay_payment_id || payment.status !== "captured")
    throw new RefundError("PAYMENT_NOT_REFUNDABLE");

  const amount = refundAmountFor(order);
  if (!(amount > 0) || amount > Number(payment.amount)) throw new RefundError("REFUND_AMOUNT_INVALID");

  // A prior non-failed refund for this payment + kind is reused, never duplicated.
  const { data: prior } = await admin
    .from("refunds")
    .select("*")
    .eq("payment_id", payment.id)
    .eq("kind", opts.kind)
    .neq("status", "failed")
    .maybeSingle();
  if (prior) return prior;

  const { data: refund, error } = await admin
    .from("refunds")
    .insert({
      order_id: opts.orderId,
      payment_id: payment.id,
      kind: opts.kind,
      amount,
      reason: opts.reason,
      idempotency_key: opts.idempotencyKey,
      status: "created",
    })
    .select()
    .single();
  if (error) {
    if (error.code === "23505") {
      const { data: existing } = await admin
        .from("refunds")
        .select("*")
        .eq("idempotency_key", opts.idempotencyKey)
        .maybeSingle();
      if (existing) return existing;
    }
    throw new RefundError("REFUND_RECORD_FAILED");
  }

  try {
    const rpRefund = await createRazorpayRefund(payment.razorpay_payment_id, amount);
    await admin
      .from("refunds")
      .update({ razorpay_refund_id: rpRefund.id, status: "pending" })
      .eq("id", refund.id);
    return { ...refund, razorpay_refund_id: rpRefund.id, status: "pending" };
  } catch {
    // Ambiguous failure (timeout etc.): reconcile with Razorpay before any
    // retry so an already-created refund is adopted instead of duplicated.
    const existing = await listRazorpayRefunds(payment.razorpay_payment_id).catch(() => []);
    const match = existing.find((r) => Math.abs(r.amount / 100 - amount) < 0.01);
    if (match) {
      await admin
        .from("refunds")
        .update({ razorpay_refund_id: match.id, status: "pending" })
        .eq("id", refund.id);
      return { ...refund, razorpay_refund_id: match.id, status: "pending" };
    }
    await admin.from("refunds").update({ status: "failed" }).eq("id", refund.id);
    throw new RefundError("REFUND_API_FAILED");
  }
}

/**
 * Records an offline (bank transfer / UPI) refund for a COD return. No money
 * moves inside the app; an admin confirms the transfer later.
 */
export async function createOfflineRefund(
  admin: AdminClient,
  opts: { orderId: string; kind: RefundKind; reason: string; idempotencyKey: string },
) {
  const { data: order } = await admin
    .from("orders")
    .select("id, subtotal, discount")
    .eq("id", opts.orderId)
    .single();
  if (!order) throw new RefundError("ORDER_NOT_FOUND");
  const amount = refundAmountFor(order);
  if (!(amount > 0)) throw new RefundError("REFUND_AMOUNT_INVALID");

  const { data: refund, error } = await admin
    .from("refunds")
    .insert({
      order_id: opts.orderId,
      payment_id: null,
      kind: opts.kind,
      amount,
      reason: opts.reason,
      idempotency_key: opts.idempotencyKey,
      status: "created",
    })
    .select()
    .single();
  if (error) {
    if (error.code === "23505") {
      const { data: existing } = await admin
        .from("refunds")
        .select("*")
        .eq("idempotency_key", opts.idempotencyKey)
        .maybeSingle();
      if (existing) return existing;
    }
    throw new RefundError("REFUND_RECORD_FAILED");
  }
  return refund;
}
