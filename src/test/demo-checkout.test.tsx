import { describe, expect, it, afterEach } from "vitest";
import { act, cleanup, renderHook } from "@testing-library/react";
import { checkoutSchema, createDemoOrder, orderTotals, restoreDemoBag, validateCoupon } from "@/lib/demo-checkout";
import { addCartItem } from "@/lib/demo-cart";
import { CartProvider, DEMO_BAG_KEY, useCart } from "@/components/shop/CartProvider";
import { DemoOrderProvider, useDemoOrder } from "@/components/shop/DemoOrderProvider";
const customer = { name: "Demo Visitor", email: "demo@example.test", mobile: "9000000000", address: "123 Example Road", apartment: "", pin: "560001", city: "Example City", state: "Example State", country: "India", demoConsent: true };
afterEach(() => { cleanup(); sessionStorage.clear(); });
describe("Demo checkout", () => {
  it("validates all customer fields and requires demo consent", () => {
    expect(checkoutSchema.safeParse(customer).success).toBe(true);
    const bad: Record<string, unknown> = { name: "", email: "wrong", mobile: "12345", address: "<script>", apartment: "x".repeat(101), pin: "000000", city: "", state: "", country: "Other", demoConsent: false };
    for (const [key, value] of Object.entries(bad)) expect(checkoutSchema.safeParse({ ...customer, [key]: value }).success, key).toBe(false);
  });
  it("rejects oversized customer input", () => {
    expect(checkoutSchema.safeParse({ ...customer, address: "a".repeat(251) }).success).toBe(false);
    expect(checkoutSchema.safeParse({ ...customer, name: "a".repeat(101) }).success).toBe(false);
  });
  it("applies no real discounts for demo or unknown coupon codes", () => {
    expect(validateCoupon(" demo ").accepted).toBe(true);
    expect(validateCoupon("SALE").accepted).toBe(false);
    expect(validateCoupon("<script>").accepted).toBe(false);
    expect(validateCoupon("a".repeat(25)).accepted).toBe(false);
    expect(orderTotals(addCartItem([], "demo-chandni-earrings"))).toEqual({ subtotal: 1200, discount: 0, shipping: 150, total: 1350 });
    expect(orderTotals([])).toEqual({ subtotal: 0, discount: 0, shipping: 0, total: 0 });
  });
  it("restores only valid demo products and options from tab storage", () => {
    expect(restoreDemoBag([{ productId: "sample-1", quantity: 1 }, { productId: "missing", quantity: 1 }])).toEqual([]);
    expect(restoreDemoBag([{ productId: "demo-chandni-rings", quantity: 1, variantId: "fake" }])).toEqual([]);
    expect(restoreDemoBag([{ productId: "demo-chandni-rings", quantity: 1 }])).toEqual([]);
    expect(restoreDemoBag([{ productId: "demo-chandni-earrings", quantity: 1.5 }])).toEqual([]);
    expect(restoreDemoBag("bad")).toEqual([]);
  });
  it("handles corrupt tab storage and clears the bag after confirmation", () => {
    sessionStorage.setItem(DEMO_BAG_KEY, "invalid json");
    const hook = renderHook(useCart, { wrapper: CartProvider });
    expect(hook.result.current.items).toEqual([]);
    act(() => hook.result.current.add("demo-chandni-earrings", 2));
    expect(JSON.parse(sessionStorage.getItem(DEMO_BAG_KEY) ?? "[]")[0].quantity).toBe(2);
    act(() => hook.result.current.clear());
    expect(hook.result.current.items).toEqual([]);
  });
  it("creates an item and total snapshot without retaining customer details", () => {
    const items = addCartItem([], "demo-chandni-rings", 2, "demo-b");
    const order = createDemoOrder(items, customer, "DEMO-TEST1234");
    expect(order).toEqual({ reference: "DEMO-TEST1234", items: [{ productId: "demo-chandni-rings", quantity: 2, variantId: "demo-b" }], totals: { subtotal: 3600, discount: 0, shipping: 150, total: 3750 } });
    expect(JSON.stringify(order)).not.toContain(customer.email);
    expect(createDemoOrder([], customer, "DEMO-TEST1234")).toBeNull();
    expect(createDemoOrder(items, { ...customer, email: "wrong" }, "DEMO-TEST1234")).toBeNull();
    const first = items[0]; if (first) first.quantity = 5;
    expect(order?.items[0]?.quantity).toBe(2);
  });
  it("keeps confirmation in memory only and removes it on refresh", () => {
    const order = createDemoOrder(addCartItem([], "demo-chandni-earrings"), customer, "DEMO-TEST1234");
    if (!order) throw new Error("Expected demo snapshot");
    const first = renderHook(useDemoOrder, { wrapper: DemoOrderProvider });
    act(() => first.result.current.confirm(order));
    expect(first.result.current.order?.reference).toBe("DEMO-TEST1234");
    first.unmount();
    const second = renderHook(useDemoOrder, { wrapper: DemoOrderProvider });
    expect(second.result.current.order).toBeNull();
    expect(sessionStorage.length).toBe(0);
  });
});