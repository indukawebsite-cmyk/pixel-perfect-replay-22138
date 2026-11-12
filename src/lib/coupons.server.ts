import { couponCodeSchema, couponDiscount, COUPON_USED } from "@/lib/coupon-policy";
import type { Quote } from "@/lib/orders.server";

// Pending gateway orders keep their reservation: releasing on payment.failed
// would race a later capture or a retry against the same Razorpay order.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function couponQuote(admin: any, customerId: string, input: string, quote: Quote) {
  const code = couponCodeSchema.parse(input);
  const { data: coupon, error } = await admin.from("coupons").select("code,discount_percent").eq("code", code).eq("is_active", true).maybeSingle();
  if (error) throw new Error("Could not validate coupon. Please try again.");
  if (!coupon) throw new Error("Invalid coupon code.");
  const { data: redemption, error: historyError } = await admin.from("coupon_redemptions").select("order_id,redeemed_at").eq("coupon_code", code).eq("customer_id", customerId).maybeSingle();
  if (historyError) throw new Error("Could not validate coupon. Please try again.");
  if (redemption?.redeemed_at) throw new Error(COUPON_USED);
  const discount = couponDiscount(quote.subtotal, coupon.discount_percent);
  return { ...quote, discount, total: quote.subtotal - discount + quote.shipping, couponCode: code, reservedOrderId: redemption?.order_id as string | undefined };
}