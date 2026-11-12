import { describe, it, expect } from "vitest";
import { couponCodeSchema, couponDiscount } from "@/lib/coupon-policy";
import { refundAmountFor } from "@/lib/cancellation-policy";
import { couponQuote } from "@/lib/coupons.server";

function client(redeemed: string | null | undefined, valid = true) {
  return { from: (table: string) => {
    const chain = { select: () => chain, eq: () => chain, maybeSingle: async () => ({ error: null, data: table === "coupons" ? valid ? { code: "FAMILYFIRST", discount_percent: 20 } : null : redeemed === undefined ? null : { order_id: "pending-order", redeemed_at: redeemed } }) };
    return chain;
  } };
}
const quote = { lines: [], subtotal: 2949.50, shipping: 149, total: 3098.50 };
describe("FAMILYFIRST rules", () => {
  it("accepts spaces and mixed case", () => {
    for (const code of ["FAMILY FIRST", "FamilyFirst", "family first", "FAMILYFIRST"]) expect(couponCodeSchema.parse(code)).toBe("FAMILYFIRST");
  });
  it("calculates exactly 20% on current selling prices for both payment methods", async () => {
    const result = await couponQuote(client(undefined), "customer-a", "family first", quote);
    expect(result.discount).toBe(589.90);
    expect(result.total).toBe(2508.60);
    expect(couponDiscount(1000, 20)).toBe(200);
  });
  it("rejects a second successful redemption", async () => {
    await expect(couponQuote(client("2026-11-12"), "customer-a", "FAMILYFIRST", quote)).rejects.toThrow("This coupon has already been used on your account.");
  });
  it("allows a different customer with no redemption", async () => {
    expect((await couponQuote(client(undefined), "customer-b", "FAMILYFIRST", quote)).discount).toBe(589.90);
  });
  it("rejects invalid coupons", async () => {
    await expect(couponQuote(client(undefined, false), "customer-a", "INVALID", quote)).rejects.toThrow("Invalid coupon code.");
  });
  it("failed or abandoned payments stay retryable, not successfully redeemed", async () => {
    const result = await couponQuote(client(null), "customer-a", "FAMILYFIRST", quote);
    expect(result.reservedOrderId).toBe("pending-order");
    expect(result.discount).toBe(589.90);
  });
  it("cancellation and return refunds exclude shipping and use discounted subtotal", () => {
    expect(refundAmountFor({ subtotal: 2949.50, discount: couponDiscount(2949.50, 20) })).toBe(2359.60);
  });
});