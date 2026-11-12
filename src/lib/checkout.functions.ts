import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import {
  checkoutAddressSchema,
  checkoutItemsSchema,
  paymentMethodSchema,
} from "@/lib/checkout-schema";
import {
  CheckoutError,
  createOrder,
  findExistingOrder,
  finalizeOrder,
  priceAndCheckStock,
} from "@/lib/orders.server";
import { createRazorpayOrder, razorpayConfig, verifyPaymentSignature } from "@/lib/razorpay.server";
import { createShipmentBestEffort } from "@/lib/shiprocket.server";
import { couponQuote } from "@/lib/coupons.server";
import { couponCodeSchema } from "@/lib/coupon-policy";

const placeOrderInput = z.object({
  items: checkoutItemsSchema,
  customer: checkoutAddressSchema,
  paymentMethod: paymentMethodSchema,
  idempotencyKey: z.string().uuid(),
  couponCode: couponCodeSchema.optional(),
});

const confirmPaymentInput = z.object({
  orderId: z.string().uuid(),
  razorpay_order_id: z.string().min(5).max(64),
  razorpay_payment_id: z.string().min(5).max(64),
  razorpay_signature: z.string().min(10).max(256),
});

type RazorpayLaunch = {
  orderId: string;
  keyId: string;
  amountPaise: number;
  currency: string;
};

export type PlaceOrderResult =
  | { mode: "cod"; orderId: string; orderNumber: string; total: number; status: string }
  | {
      mode: "razorpay";
      orderId: string;
      orderNumber: string;
      total: number;
      razorpay: RazorpayLaunch;
    };

export const placeOrder = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => placeOrderInput.parse(input))
  .handler(async ({ data, context }): Promise<PlaceOrderResult> => {
    const cfg = razorpayConfig();
    if (data.paymentMethod === "razorpay" && !cfg.configured)
      throw new CheckoutError("ONLINE_PAYMENT_UNAVAILABLE");

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    // The customer row normally exists from sign-up; create it if missing.
    const { data: existingCustomer } = await context.supabase
      .from("customers")
      .select("id")
      .eq("user_id", context.userId)
      .maybeSingle();
    let customerId = existingCustomer?.id as string | undefined;
    if (!customerId) {
      const { data: created, error } = await supabaseAdmin
        .from("customers")
        .insert({
          user_id: context.userId,
          email: data.customer.email,
          full_name: data.customer.name,
          phone: data.customer.mobile,
        })
        .select("id")
        .single();
      if (error) throw new CheckoutError("ACCOUNT_SETUP_FAILED");
      customerId = created.id;
    }

    // A repeated submit (refresh, double click, retry) reuses the same order.
    let quote = await priceAndCheckStock(supabaseAdmin, data.items, cfg.testMode);
    let reservedOrderId: string | undefined;
    if (data.couponCode) {
      const discounted = await couponQuote(supabaseAdmin, customerId, data.couponCode, quote);
      quote = discounted;
      reservedOrderId = discounted.reservedOrderId;
    }
    let existing = await findExistingOrder(supabaseAdmin, customerId, data.idempotencyKey);
    if (reservedOrderId) {
      const { data: reserved } = await supabaseAdmin.from("orders").select("*,order_items(product_id,variant_id,quantity,purchase_price)").eq("id", reservedOrderId).eq("customer_id", customerId).single();
      const sameItems = reserved?.order_items.length === quote.lines.length && quote.lines.every((line) => reserved.order_items.some((item) => item.product_id === line.productId && item.variant_id === line.variantId && item.quantity === line.quantity && Number(item.purchase_price) === line.price));
      if (!reserved || reserved.status !== "pending" || reserved.coupon_payment_method !== data.paymentMethod || Number(reserved.total) !== quote.total || !sameItems || reserved.shipping_name !== data.customer.name || reserved.shipping_phone !== data.customer.mobile || reserved.address_line1 !== data.customer.address || (reserved.address_line2 ?? "") !== data.customer.apartment || reserved.pin_code !== data.customer.pin || reserved.city !== data.customer.city || reserved.state !== data.customer.state) {
        throw new CheckoutError("Your coupon is reserved for an unfinished checkout. Retry with the original bag, delivery details and payment method, or remove the coupon.");
      }
      existing = reserved;
    }
    if (existing) {
      if (data.paymentMethod === "cod") {
        await finalizeOrder(supabaseAdmin, existing.id, false);
        await createShipmentBestEffort(supabaseAdmin, existing.id);
        return {
          mode: "cod",
          orderId: existing.id,
          orderNumber: existing.order_number,
          total: Number(existing.total),
          status: "confirmed",
        };
      }
      const { data: payment } = await supabaseAdmin
        .from("payments")
        .select("razorpay_order_id, amount")
        .eq("order_id", existing.id)
        .maybeSingle();
      if (!payment?.razorpay_order_id) throw new CheckoutError("PAYMENT_SETUP_FAILED");
      return {
        mode: "razorpay",
        orderId: existing.id,
        orderNumber: existing.order_number,
        total: Number(existing.total),
        razorpay: {
          orderId: payment.razorpay_order_id,
          keyId: cfg.keyId,
          amountPaise: Math.round(Number(payment.amount) * 100),
          currency: "INR",
        },
      };
    }

    // Authoritative pricing and stock checks happen here, server-side.
    const order = await createOrder(supabaseAdmin, {
      customerId,
      address: data.customer,
      quote,
      idempotencyKey: data.idempotencyKey,
      paymentMethod: data.paymentMethod,
    });
    if (!order) throw new CheckoutError("ORDER_CREATE_FAILED");

    if (data.paymentMethod === "cod") {
      await finalizeOrder(supabaseAdmin, order.id, false);
      await createShipmentBestEffort(supabaseAdmin, order.id);
      return {
        mode: "cod",
        orderId: order.id,
        orderNumber: order.order_number,
        total: quote.total,
        status: "confirmed",
      };
    }

    const razorpayOrder = await createRazorpayOrder({
      amountInr: quote.total,
      receipt: order.order_number,
      notes: { induka_order_id: order.id },
    });
    const { error: linkError } = await supabaseAdmin
      .from("payments")
      .update({ razorpay_order_id: razorpayOrder.id })
      .eq("order_id", order.id);
    if (linkError) throw new CheckoutError("PAYMENT_SETUP_FAILED");

    return {
      mode: "razorpay",
      orderId: order.id,
      orderNumber: order.order_number,
      total: quote.total,
      razorpay: {
        orderId: razorpayOrder.id,
        keyId: cfg.keyId,
        amountPaise: razorpayOrder.amount,
        currency: razorpayOrder.currency,
      },
    };
  });

export const confirmRazorpayPayment = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => confirmPaymentInput.parse(input))
  .handler(async ({ data, context }) => {
    const cfg = razorpayConfig();
    if (!cfg.configured) throw new CheckoutError("ONLINE_PAYMENT_UNAVAILABLE");

    // The caller must own the order (RLS enforces this on their session).
    const { data: owned } = await context.supabase
      .from("orders")
      .select("id, order_number, status")
      .eq("id", data.orderId)
      .maybeSingle();
    if (!owned) throw new CheckoutError("ORDER_NOT_FOUND");

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: payment } = await supabaseAdmin
      .from("payments")
      .select("id, razorpay_order_id, status")
      .eq("order_id", data.orderId)
      .maybeSingle();
    if (!payment || payment.razorpay_order_id !== data.razorpay_order_id)
      throw new CheckoutError("PAYMENT_NOT_FOUND");

    // Never trust the browser's success callback without the signature.
    const valid = verifyPaymentSignature(
      {
        orderId: data.razorpay_order_id,
        paymentId: data.razorpay_payment_id,
        signature: data.razorpay_signature,
      },
      cfg.keySecret,
    );
    if (!valid) throw new CheckoutError("SIGNATURE_INVALID");

    await finalizeOrder(supabaseAdmin, data.orderId, true, data.razorpay_payment_id);
    await createShipmentBestEffort(supabaseAdmin, data.orderId);
    return { ok: true, orderNumber: owned.order_number, status: "confirmed" };
  });
