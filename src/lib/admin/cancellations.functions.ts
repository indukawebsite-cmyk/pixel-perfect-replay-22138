import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function requireAdmin(context: any) {
  const { data: isAdmin } = await context.supabase.rpc("has_role", {
    _user_id: context.userId,
    _role: "admin",
  });
  if (!isAdmin) throw new Error("Forbidden");
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  return supabaseAdmin;
}

const decisionInput = z.object({
  requestId: z.string().uuid(),
  adminNote: z.string().trim().max(500).optional(),
});

// Approves a cancellation request: cancels any eligible Shiprocket shipment,
// cancels the order with exactly-once stock restore, and starts a full
// Razorpay refund for prepaid orders. COD orders complete with no refund.
export const approveCancellation = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => decisionInput.parse(input))
  .handler(async ({ data, context }) => {
    const admin = await requireAdmin(context);
    const { data: request } = await admin
      .from("cancellation_requests")
      .select("*")
      .eq("id", data.requestId)
      .single();
    if (!request || request.status !== "requested") throw new Error("REQUEST_NOT_OPEN");

    const { cancelShipmentBestEffort } = await import("@/lib/shiprocket.server");
    const shipment = await cancelShipmentBestEffort(admin, request.order_id);
    if (!shipment.ok) throw new Error("SHIPMENT_NOT_CANCELLABLE");

    const { data: result, error } = await admin.rpc("cancel_order_and_restore", {
      p_order_id: request.order_id,
      p_reason: request.reason,
    });
    if (error || !result?.ok) throw new Error("CANCEL_FAILED");

    const { data: payment } = await admin
      .from("payments")
      .select("status")
      .eq("order_id", request.order_id)
      .maybeSingle();
    if (payment?.status === "captured") {
      const { createFullRefund } = await import("@/lib/refunds.server");
      await createFullRefund(admin, {
        orderId: request.order_id,
        kind: "cancellation",
        reason: request.reason,
        idempotencyKey: `cancel-${request.order_id}`,
      });
    }

    await admin
      .from("cancellation_requests")
      .update({
        status: "completed",
        admin_note: data.adminNote ?? null,
        resolved_at: new Date().toISOString(),
        resolved_by: context.userId,
      })
      .eq("id", request.id);
    return { ok: true, stockRestored: Boolean(result.stock_restored) };
  });

export const rejectCancellation = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => decisionInput.parse(input))
  .handler(async ({ data, context }) => {
    const admin = await requireAdmin(context);
    const { error } = await admin
      .from("cancellation_requests")
      .update({
        status: "rejected",
        admin_note: data.adminNote ?? null,
        resolved_at: new Date().toISOString(),
        resolved_by: context.userId,
      })
      .eq("id", data.requestId)
      .eq("status", "requested");
    if (error) throw new Error("UPDATE_FAILED");
    return { ok: true };
  });

// Approves a return: attempts a Shiprocket reverse pickup; when unavailable
// the return stays approved and the admin records courier/AWB manually.
export const approveReturn = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => decisionInput.parse(input))
  .handler(async ({ data, context }) => {
    const admin = await requireAdmin(context);
    const { data: request } = await admin
      .from("return_requests")
      .select("*")
      .eq("id", data.requestId)
      .single();
    if (!request || request.status !== "requested") throw new Error("REQUEST_NOT_OPEN");

    const { createReturnPickupBestEffort } = await import("@/lib/shiprocket.server");
    const pickup = await createReturnPickupBestEffort(admin, request.order_id);

    await admin
      .from("return_requests")
      .update({
        status: "approved",
        admin_note:
          [data.adminNote, pickup.ok ? null : `Reverse pickup unavailable (${pickup.reason ?? "unknown"}) — arrange manually.`]
            .filter(Boolean)
            .join(" ") || null,
        resolved_at: new Date().toISOString(),
        resolved_by: context.userId,
      })
      .eq("id", request.id);
    return { ok: true, reversePickup: pickup.ok };
  });

export const rejectReturn = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => decisionInput.parse(input))
  .handler(async ({ data, context }) => {
    const admin = await requireAdmin(context);
    const { error } = await admin
      .from("return_requests")
      .update({
        status: "rejected",
        admin_note: data.adminNote ?? null,
        resolved_at: new Date().toISOString(),
        resolved_by: context.userId,
      })
      .eq("id", data.requestId)
      .eq("status", "requested");
    if (error) throw new Error("UPDATE_FAILED");
    return { ok: true };
  });

// Manual fallback: records the courier/AWB for a return the admin arranged.
export const setReturnShipment = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z
      .object({
        requestId: z.string().uuid(),
        courier: z.string().trim().min(2).max(100),
        awb: z.string().trim().min(3).max(64),
      })
      .parse(input),
  )
  .handler(async ({ data, context }) => {
    const admin = await requireAdmin(context);
    const { error } = await admin
      .from("return_requests")
      .update({ return_courier: data.courier, return_awb: data.awb })
      .eq("id", data.requestId)
      .eq("status", "approved");
    if (error) throw new Error("UPDATE_FAILED");
    return { ok: true };
  });

export const markReturnReceived = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => decisionInput.parse(input))
  .handler(async ({ data, context }) => {
    const admin = await requireAdmin(context);
    const { error } = await admin
      .from("return_requests")
      .update({ status: "received" })
      .eq("id", data.requestId)
      .eq("status", "approved");
    if (error) throw new Error("UPDATE_FAILED");
    return { ok: true };
  });

// Records the physical inspection. Only a passed inspection restores stock
// (exactly once) and initiates the refund — prepaid via Razorpay, COD as an
// offline refund record for admin confirmation.
export const recordInspection = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z
      .object({
        requestId: z.string().uuid(),
        passed: z.boolean(),
        note: z.string().trim().max(500).optional(),
      })
      .parse(input),
  )
  .handler(async ({ data, context }) => {
    const admin = await requireAdmin(context);
    const { data: request } = await admin
      .from("return_requests")
      .select("*")
      .eq("id", data.requestId)
      .single();
    if (!request || request.status !== "received") throw new Error("REQUEST_NOT_RECEIVED");

    if (!data.passed) {
      await admin
        .from("return_requests")
        .update({ status: "inspection_failed", inspection_note: data.note ?? null })
        .eq("id", request.id);
      return { ok: true, refunded: false };
    }

    await admin
      .from("return_requests")
      .update({ status: "inspection_passed", inspection_note: data.note ?? null })
      .eq("id", request.id);

    const { data: restored, error } = await admin.rpc("restore_returned_stock", {
      p_return_id: request.id,
    });
    if (error || !restored?.ok) throw new Error("STOCK_RESTORE_FAILED");

    const { data: payment } = await admin
      .from("payments")
      .select("status")
      .eq("order_id", request.order_id)
      .maybeSingle();
    if (payment?.status === "captured") {
      const { createFullRefund } = await import("@/lib/refunds.server");
      await createFullRefund(admin, {
        orderId: request.order_id,
        kind: "return",
        reason: request.reason,
        idempotencyKey: `return-${request.order_id}`,
      });
    } else {
      const { createOfflineRefund } = await import("@/lib/refunds.server");
      await createOfflineRefund(admin, {
        orderId: request.order_id,
        kind: "return",
        reason: request.reason,
        idempotencyKey: `return-${request.order_id}`,
      });
    }
    return { ok: true, refunded: true };
  });

// Confirms an offline COD refund (bank transfer / UPI) with reference,
// admin identity and timestamp. Cannot be confirmed twice.
export const confirmOfflineRefund = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z
      .object({
        refundId: z.string().uuid(),
        method: z.enum(["bank_transfer", "upi"]),
        reference: z.string().trim().min(3).max(100),
      })
      .parse(input),
  )
  .handler(async ({ data, context }) => {
    const admin = await requireAdmin(context);
    const { data: refund } = await admin
      .from("refunds")
      .select("*")
      .eq("id", data.refundId)
      .single();
    if (!refund || refund.payment_id) throw new Error("NOT_OFFLINE_REFUND");
    if (refund.status === "processed") throw new Error("ALREADY_CONFIRMED");

    const { error } = await admin
      .from("refunds")
      .update({
        status: "processed",
        offline_method: data.method,
        offline_reference: data.reference,
        offline_confirmed_by: context.userId,
        offline_confirmed_at: new Date().toISOString(),
      })
      .eq("id", refund.id);
    if (error) throw new Error("UPDATE_FAILED");
    await admin
      .from("return_requests")
      .update({ status: "refunded" })
      .eq("order_id", refund.order_id)
      .eq("status", "inspection_passed");
    return { ok: true };
  });
