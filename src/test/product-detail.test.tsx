import { act, cleanup, fireEvent, render, renderHook, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { getProduct, sampleProducts, demoProducts } from "@/lib/catalog";
import { productGallery, validPin, validQuantity, relatedProducts, recordViewed } from "@/lib/product-detail";
import { addCartItem, cartTotal, setCartQuantity } from "@/lib/demo-cart";
import { VariantSelector } from "@/components/shop/VariantSelector";
import { QuantitySelector } from "@/components/shop/QuantitySelector";
import { RecentlyViewedProvider, useRecentlyViewed } from "@/components/shop/RecentlyViewedProvider";
import { useState } from "react";
afterEach(cleanup);
describe("Product detail rules", () => {
  it("resolves the requested piece without inventing specifications", () => {
    expect(getProduct("demo-chandni-rings")?.name).toBe("Demo Chandni Rings");
    expect(getProduct("missing")).toBeUndefined();
    expect([...demoProducts, ...sampleProducts].every((product) => product.specifications === undefined && product.price === null)).toBe(true);
  });
  it("provides honestly labelled detail crops rather than invented alternate photographs", () => {
    const product = getProduct("demo-chandni-rings");
    if (!product) throw new Error("Missing demo ring");
    const gallery = productGallery(product);
    expect(gallery.length).toBe(2);
    expect(gallery[1]?.src).toBe(gallery[0]?.src);
    expect(gallery[1]?.detailCrop).toBe(true);
  });
  it("accepts whole positive quantities and rejects invalid input", () => {
    expect(validQuantity(1)).toBe(true);
    expect(validQuantity(3)).toBe(true);
    for (const value of [0, -1, 1.5, NaN, Infinity]) expect(validQuantity(value)).toBe(false);
  });
  it("changes quantity through the selector and prevents zero", () => {
    function Harness() { const [value, setValue] = useState("1"); return <QuantitySelector value={value} onChange={setValue} />; }
    render(<Harness />);
    expect(screen.getByRole("button", { name: "Decrease quantity" })).toBeDisabled();
    fireEvent.click(screen.getByRole("button", { name: "Increase quantity" }));
    expect(screen.getByLabelText("Quantity")).toHaveValue(2);
    fireEvent.change(screen.getByLabelText("Quantity"), { target: { value: "1.5" } });
    expect(screen.getByLabelText("Quantity")).toHaveAttribute("aria-invalid", "true");
  });
  it("only supplies demo variants for demo rings and allows selection", () => {
    expect(getProduct("demo-chandni-earrings")?.variants).toBeUndefined();
    const variants = getProduct("demo-chandni-rings")?.variants;
    expect(variants?.map((variant) => variant.id)).toEqual(["demo-a", "demo-b"]);
    function Harness() { const [selected, select] = useState("demo-a"); return <VariantSelector variants={variants} selected={selected} onSelect={select} />; }
    render(<Harness />);
    fireEvent.click(screen.getByRole("button", { name: "Demo option B" }));
    expect(screen.getByRole("button", { name: "Demo option B" })).toHaveAttribute("aria-pressed", "true");
  });
  it("keeps selected variants separate and adds requested quantity to the existing bag", () => {
    const id = "demo-chandni-rings";
    const items = addCartItem(addCartItem([], id, 2, "demo-a"), id, 3, "demo-b");
    expect(items).toEqual([{ productId: id, quantity: 2, variantId: "demo-a" }, { productId: id, quantity: 3, variantId: "demo-b" }]);
    expect(cartTotal(items)).toBe(9000);
    expect(setCartQuantity(items, id, 0, "demo-a")).toEqual([{ productId: id, quantity: 3, variantId: "demo-b" }]);
    expect(addCartItem(items, id, 1, "fake")).toEqual(items);
    expect(addCartItem(items, id, 0, "demo-a")).toEqual(items);
    expect(setCartQuantity(items, id, 1.5, "demo-a")).toEqual(items);
  });
  it("checks Indian PIN format without claiming live availability", () => {
    expect(validPin("560001")).toBe(true);
    for (const value of ["000000", "12345", "1234567", "abcdef"]) expect(validPin(value)).toBe(false);
  });
  it("returns other related products from the correct collection", () => {
    const product = getProduct("demo-chandni-rings");
    if (!product) throw new Error("Missing demo ring");
    const related = relatedProducts(product);
    expect(related.some((item) => item.id === product.id)).toBe(false);
    expect(related.slice(0, 3).map((item) => item.collection)).toEqual(["chandni", "chandni", "chandni"]);
  });
  it("deduplicates recent views and clears them on a new visit", () => {
    expect(recordViewed(["sample-1", "sample-2"], "sample-2")).toEqual(["sample-2", "sample-1"]);
    const first = renderHook(useRecentlyViewed, { wrapper: RecentlyViewedProvider });
    act(() => first.result.current.record("sample-1"));
    expect(first.result.current.ids).toEqual(["sample-1"]);
    first.unmount();
    const second = renderHook(useRecentlyViewed, { wrapper: RecentlyViewedProvider });
    expect(second.result.current.ids).toEqual([]);
  });
});