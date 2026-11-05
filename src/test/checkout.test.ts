import { describe, expect, it } from "vitest";
import { shippingCharge, SHIPPING_POLICY } from "@/lib/shipping-policy";
import { verifyPaymentSignature, verifyWebhookSignature } from "@/lib/razorpay.server";
import { checkoutAddressSchema, checkoutItemSchema } from "@/lib/checkout-schema";

describe("shipping rule (free above threshold, flat fee below)", () => {
  it("charges the flat fee below the free-shipping threshold", () => {
    expect(shippingCharge(SHIPPING_POLICY.freeAboveInr - 1)).toBe(SHIPPING_POLICY.flatFeeInr);
  });
  it("is free at and above the threshold", () => {
    expect(shippingCharge(SHIPPING_POLICY.freeAboveInr)).toBe(0);
    expect(shippingCharge(SHIPPING_POLICY.freeAboveInr + 5000)).toBe(0);
  });
  it("is free for an empty bag", () => {
    expect(shippingCharge(0)).toBe(0);
  });
});

describe("Razorpay signature verification", () => {
  // Vectors generated with openssl HMAC-SHA256.
  it("accepts a valid checkout signature", () => {
    expect(
      verifyPaymentSignature(
        { orderId: "order_Kx123", paymentId: "pay_Ly456", signature: "684e2ca172ee2f1194433d5791c49beb846770739a83fdce559cc6780b18fc9b" },
        "test_webhook_secret",
      ),
    ).toBe(true);
  });
  it("rejects a tampered payment id", () => {
    expect(
      verifyPaymentSignature(
        { orderId: "order_Kx123", paymentId: "pay_OTHER", signature: "684e2ca172ee2f1194433d5791c49beb846770739a83fdce559cc6780b18fc9b" },
        "test_webhook_secret",
      ),
    ).toBe(false);
  });
  it("accepts a valid webhook signature over the raw body", () => {
    expect(
      verifyWebhookSignature(
        '{"event":"payment.captured"}',
        "149f0921b8dab66ba5504a4de4e376f5e30470d680899c30ffda46ef7391a360",
        "test_webhook_secret",
      ),
    ).toBe(true);
  });
  it("rejects a webhook signed with the wrong secret", () => {
    expect(
      verifyWebhookSignature(
        '{"event":"payment.captured"}',
        "149f0921b8dab66ba5504a4de4e376f5e30470d680899c30ffda46ef7391a360",
        "wrong_secret",
      ),
    ).toBe(false);
  });
});

describe("cart item validation", () => {
  it("accepts a real catalogue slug", () => {
    expect(
      checkoutItemSchema.safeParse({ productId: "jaguar-noir-925-sterling-silver-pendant", quantity: 1 }).success,
    ).toBe(true);
  });
  it("rejects empty, malformed and oversized product references", () => {
    expect(checkoutItemSchema.safeParse({ productId: "", quantity: 1 }).success).toBe(false);
    expect(checkoutItemSchema.safeParse({ productId: "DROP TABLE--", quantity: 1 }).success).toBe(false);
    expect(checkoutItemSchema.safeParse({ productId: "a".repeat(200), quantity: 1 }).success).toBe(false);
  });
  it("rejects zero, negative and bulk quantities", () => {
    expect(checkoutItemSchema.safeParse({ productId: "jaguar-noir", quantity: 0 }).success).toBe(false);
    expect(checkoutItemSchema.safeParse({ productId: "jaguar-noir", quantity: -2 }).success).toBe(false);
    expect(checkoutItemSchema.safeParse({ productId: "jaguar-noir", quantity: 11 }).success).toBe(false);
  });
});

describe("confirmed shipping rule: ₹149 below ₹2,999, free at or above", () => {
  it("charges ₹149 at ₹2,998", () => {
    expect(shippingCharge(2998)).toBe(149);
  });
  it("is free at exactly ₹2,999 (threshold uses the pre-shipping subtotal)", () => {
    expect(shippingCharge(2999)).toBe(0);
  });
});

describe("checkout address validation", () => {
  const valid = {
    name: "Test Buyer",
    email: "buyer@example.com",
    mobile: "9876543210",
    address: "12 Park Street",
    apartment: "",
    pin: "700016",
    city: "Kolkata",
    state: "West Bengal",
    country: "India",
  };
  it("accepts a valid Indian address", () => {
    expect(checkoutAddressSchema.safeParse(valid).success).toBe(true);
  });
  it("rejects an invalid mobile number", () => {
    expect(checkoutAddressSchema.safeParse({ ...valid, mobile: "12345" }).success).toBe(false);
  });
  it("rejects an invalid PIN code", () => {
    expect(checkoutAddressSchema.safeParse({ ...valid, pin: "00000" }).success).toBe(false);
  });
  it("rejects a non-India country", () => {
    expect(checkoutAddressSchema.safeParse({ ...valid, country: "USA" }).success).toBe(false);
  });
});
