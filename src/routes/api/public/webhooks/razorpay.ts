import { createFileRoute } from "@tanstack/react-router";

// Razorpay webhook endpoint. The signature is verified over the raw body
// before anything is read or written; processing is idempotent because the
// database rejects duplicate payment IDs and stock is deducted exactly once.
export const Route = createFileRoute("/api/public/webhooks/razorpay")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const secret = process.env["RAZORPAY_WEBHOOK_SECRET"];
        if (!secret) return new Response("Webhook not configured", { status: 503 });

        const signature = request.headers.get("x-razorpay-signature") ?? "";
        const raw = await request.text();
        const { verifyWebhookSignature } = await import("@/lib/razorpay.server");
        if (!verifyWebhookSignature(raw, signature, secret)) {
          return new Response("Invalid signature", { status: 401 });
        }

        let event: {
          event?: string;
          payload?: {
            payment?: { entity?: { id?: string; order_id?: string } };
            refund?: { entity?: { id?: string; payment_id?: string } };
          };
        };
        try {
          event = JSON.parse(raw);
        } catch {
          return new Response("Bad payload", { status: 400 });
        }

        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
        const payment = event.payload?.payment?.entity;

        if (event.event === "payment.captured" && payment?.order_id && payment.id) {
          const { data: row } = await supabaseAdmin
            .from("payments")
            .select("order_id")
            .eq("razorpay_order_id", payment.order_id)
            .maybeSingle();
          if (row) {
            const { finalizeOrder } = await import("@/lib/orders.server");
            await finalizeOrder(supabaseAdmin, row.order_id, true, payment.id);
            const { createShipmentBestEffort } = await import("@/lib/shiprocket.server");
            await createShipmentBestEffort(supabaseAdmin, row.order_id);
          }
        } else if (event.event === "payment.failed" && payment?.order_id) {
          await supabaseAdmin
            .from("payments")
            .update({ status: "failed" })
            .eq("razorpay_order_id", payment.order_id)
            .eq("status", "created");
        } else if (
          (event.event === "refund.processed" || event.event === "refund.failed") &&
          event.payload?.refund?.entity?.id
        ) {
          // Refund lifecycle: matched by the unique Razorpay refund ID stored
          // when the refund was initiated. Re-delivery is a no-op.
          const refundId = event.payload.refund.entity.id;
          const newStatus = event.event === "refund.processed" ? "processed" : "failed";
          const { data: row } = await supabaseAdmin
            .from("refunds")
            .update({ status: newStatus })
            .eq("razorpay_refund_id", refundId)
            .in("status", ["created", "pending"])
            .select("order_id, kind")
            .maybeSingle();
          if (row && newStatus === "processed") {
            await supabaseAdmin
              .from("payments")
              .update({ status: "refunded" })
              .eq("order_id", row.order_id)
              .eq("status", "captured");
            if (row.kind === "return") {
              await supabaseAdmin
                .from("return_requests")
                .update({ status: "refunded" })
                .eq("order_id", row.order_id)
                .eq("status", "inspection_passed");
            }
          }
        }

        return Response.json({ received: true });
      },
    },
  },
});
