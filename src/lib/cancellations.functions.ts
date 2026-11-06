import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import {
  isCancellableStatus,
  withinCancellationWindow,
  withinReturnWindow,
} from "@/lib/cancellation-policy";

const requestInput = z.object({
  orderId: z.string().uuid(),
  reason: z.string().trim().min(3).max(500),
});

export type CancellationRequestResult =
  | { outcome: "cancelled"; stockRestored: boolean }
  | { outcome: "requested" };

// Customer cancellation. Within 24h of placement (and not shipped) the order
// is cancelled immediately with stock restore and, for prepaid orders, a full
// Razorpay refund. Outside the window an admin approval request is created.
export const requestCancellation = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => requestInput.parse(input))
  .handler(async ({ data, context }): Promise<CancellationRequestResult> => {
    // RLS scopes this read to the caller's own orders.
    const { data: order } = await context.supabase
      .from("orders")
      .select("id, customer_id, status, created_at")
      .eq("id", data.orderId)
      .maybeSingle();
    if (!order) throw new Error("ORDER_NOT_FOUND");
    if (order.status === "cancelled" || order.status === "refunded")
      throw new Error("ALREADY_CANCELLED");
    if (order.status === "delivered") throw new Error("USE_RETURN_WORKFLOW");
    if (order.status === "shipped") throw new Error("SHIPPED_CONTACT_SUPPORT");
    if (!isCancellableStatus(order.status)) throw new Error("NOT_CANCELLABLE");

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const selfService =
      withinCancellationWindow(order.created_at) &&
      (order.status === "pending" || order.status === "confirmed");

    if (!selfService) {
      const { error } = await supabaseAdmin.from("cancellation_requests").insert({
        order_id: order.id,
        customer_id: order.customer_id,
        reason: data.reason,
        status: "requested",
      });
      if (error?.code === "23505") throw new Error("ALREADY_REQUESTED");
      if (error) throw new Error("REQUEST_FAILED");
      return { outcome: "requested" };
    }

    // Self-service path: cancel any booked shipment first — a shipment that
    // cannot be cancelled blocks the cancellation.
    const { cancelShipmentBestEffort } = await import("@/lib/shiprocket.server");
    const shipment = await cancelShipmentBestEffort(supabaseAdmin, order.id);
    if (!shipment.ok) throw new Error("SHIPMENT_NOT_CANCELLABLE");

    const { data: result, error } = await supabaseAdmin.rpc("cancel_order_and_restore", {
      p_order_id: order.id,
      p_reason: data.reason,
    });
    if (error || !result?.ok) throw new Error("CANCEL_FAILED");

    // Prepaid orders get a full refund of subtotal − discount (no shipping).
    const { data: payment } = await supabaseAdmin
      .from("payments")
      .select("status")
      .eq("order_id", order.id)
      .maybeSingle();
    if (payment?.status === "captured") {
      const { createFullRefund } = await import("@/lib/refunds.server");
      await createFullRefund(supabaseAdmin, {
        orderId: order.id,
        kind: "cancellation",
        reason: data.reason,
        idempotencyKey: `cancel-${order.id}`,
      });
    }

    await supabaseAdmin.from("cancellation_requests").insert({
      order_id: order.id,
      customer_id: order.customer_id,
      reason: data.reason,
      status: "completed",
      resolved_at: new Date().toISOString(),
    });
    return { outcome: "cancelled", stockRestored: Boolean(result.stock_restored) };
  });

// Customer return request. Only for delivered orders within 7 calendar days
// of the actual delivery timestamp; always requires admin approval.
export const requestReturn = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => requestInput.parse(input))
  .handler(async ({ data, context }) => {
    const { data: order } = await context.supabase
      .from("orders")
      .select("id, customer_id, status, shipments(delivered_at, status)")
      .eq("id", data.orderId)
      .maybeSingle();
    if (!order) throw new Error("ORDER_NOT_FOUND");
    if (order.status !== "delivered") throw new Error("NOT_DELIVERED");

    const shipment = (order.shipments as { delivered_at: string | null; status: string }[])[0];
    if (!shipment?.delivered_at) throw new Error("DELIVERY_DATE_UNKNOWN");
    if (!withinReturnWindow(shipment.delivered_at)) throw new Error("RETURN_WINDOW_CLOSED");

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin.from("return_requests").insert({
      order_id: order.id,
      customer_id: order.customer_id,
      reason: data.reason,
      status: "requested",
    });
    if (error?.code === "23505") throw new Error("ALREADY_REQUESTED");
    if (error) throw new Error("REQUEST_FAILED");
    return { outcome: "requested" as const };
  });
