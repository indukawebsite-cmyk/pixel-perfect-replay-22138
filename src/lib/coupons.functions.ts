import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { checkoutItemsSchema } from "@/lib/checkout-schema";
import { couponCodeSchema } from "@/lib/coupon-policy";
import { couponQuote } from "@/lib/coupons.server";
import { priceAndCheckStock } from "@/lib/orders.server";
import { razorpayConfig } from "@/lib/razorpay.server";

export const applyCoupon = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => z.object({ code: couponCodeSchema, items: checkoutItemsSchema }).parse(input))
  .handler(async ({ data, context }) => {
    const { data: customer } = await context.supabase.from("customers").select("id").eq("user_id", context.userId).single();
    if (!customer) throw new Error("Please sign in to apply a coupon.");
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const quote = await priceAndCheckStock(supabaseAdmin, data.items, razorpayConfig().testMode);
    const result = await couponQuote(supabaseAdmin, customer.id, data.code, quote);
    return { code: result.couponCode, subtotal: result.subtotal, discount: result.discount, shipping: result.shipping, total: result.total, reservedOrderId: result.reservedOrderId ?? null };
  });

export const couponHistory = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data: admin } = await context.supabase.rpc("has_role", { _user_id: context.userId, _role: "admin" });
    if (!admin) throw new Error("Forbidden");
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: coupons, error } = await supabaseAdmin.from("coupons").select("*");
    const { data: history, error: historyError } = await supabaseAdmin.from("coupon_redemptions").select("id,coupon_code,customer_id,order_id,redeemed_at,customers(full_name,email),orders(order_number)").not("redeemed_at", "is", null).order("redeemed_at", { ascending: false });
    if (error || historyError) throw new Error("Could not load coupons.");
    return { coupons: coupons ?? [], history: history ?? [] };
  });