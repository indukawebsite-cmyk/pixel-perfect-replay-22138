import { it, expect, vi } from "vitest";
import { createOrder } from "@/lib/orders.server";
import { couponDiscount } from "@/lib/coupon-policy";

it.each(["cod", "razorpay"] as const)("%s persists the server-calculated coupon total for orders and payments", async (paymentMethod) => {
  const inserted: Record<string, unknown> = {};
  const admin = { from: (table: string) => ({ insert: (value: unknown) => {
    inserted[table] = value;
    return table === "orders" ? { select: () => ({ single: async () => ({ data: { id: "order-fixture", order_number: "FIXTURE" }, error: null }) }) } : Promise.resolve({ error: null });
  } }) };
  const discount = couponDiscount(2949.50, 20);
  await createOrder(admin, {
    customerId: "fixture-customer", paymentMethod, idempotencyKey: "fixture-key",
    address: { name: "Fixture", email: "fixture@example.com", mobile: "9876543210", address: "Fixture address", apartment: "", pin: "700016", city: "Kolkata", state: "West Bengal", country: "India" },
    quote: { lines: [], subtotal: 2949.50, discount, shipping: 149, total: 2508.60, couponCode: "FAMILYFIRST" },
  });
  expect(inserted.orders).toMatchObject({ subtotal: 2949.50, discount: 589.90, total: 2508.60, coupon_code: "FAMILYFIRST", coupon_payment_method: paymentMethod });
  expect(inserted.payments).toMatchObject({ order_id: "order-fixture", amount: 2508.60 });
});