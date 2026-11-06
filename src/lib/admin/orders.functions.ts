import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

// "cancelled" and "refunded" are deliberately excluded: those states are only
// reachable through the guarded cancellation/return functions, which enforce
// shipment cancellation, refund and exactly-once inventory restoration.
const orderStatusSchema = z.enum([
  "pending",
  "confirmed",
  "processing",
  "shipped",
  "delivered",
]);

export const updateOrderStatus = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z.object({ orderId: z.string().uuid(), status: orderStatusSchema }).parse(input),
  )
  .handler(async ({ data, context }) => {
    const { data: isAdmin } = await context.supabase.rpc("has_role", {
      _user_id: context.userId,
      _role: "admin",
    });
    if (!isAdmin) throw new Error("Forbidden");
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin
      .from("orders")
      .update({ status: data.status })
      .eq("id", data.orderId);
    if (error) throw new Error("Could not update the order status.");
    // Record the actual delivery timestamp — it starts the 7-day return window.
    if (data.status === "delivered") {
      await supabaseAdmin
        .from("shipments")
        .update({ delivered_at: new Date().toISOString() })
        .eq("order_id", data.orderId)
        .is("delivered_at", null);
    }
    return { ok: true };
  });
