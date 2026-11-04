import { act, renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { fixtureProducts as products } from "./fixtures";
import { filterProducts, PAGE_SIZE, validateExplorerSearch, visibleProductCount } from "@/lib/product-explorer";
import { addCartItem, cartTotal, setCartQuantity } from "@/lib/demo-cart";
import { CartProvider, DEMO_BAG_KEY, useCart } from "@/components/shop/CartProvider";

describe("Catalogue mapping from database rows", () => {
  it("uses the lowest display order as the primary image and keeps gallery order", () => {
    const p = products.find((x) => x.id === "fx-pendant-a");
    expect(p?.image).toBe("https://signed.test/BR001/03.jpg");
    expect(p?.gallery?.map((g) => g.src)).toEqual(["https://signed.test/BR001/03.jpg", "https://signed.test/BR001/02.jpg", "https://signed.test/BR001/01.jpg"]);
  });
  it("carries price, stock, size and orders by SKU number", () => {
    expect(products.map((p) => p.sku)).toEqual(["BR001", "BR004", "BR0013", "BR0015"]);
    expect(products[0]).toMatchObject({ price: 5899, stock: 2, size: "2 × 1 cm (L × W)", collection: "nakshatra", isSample: false });
  });
});
describe("Shop filtering", () => {
  it("combines category, price range and name search", () => {
    expect(filterProducts(products, { category: "earrings", min: 1900, max: 2100, q: "fixture" }).map((p) => p.id)).toEqual(["fx-earring-a"]);
  });
  it("includes exact price boundaries", () => {
    expect(filterProducts(products, { min: 1899, max: 1899 }).map((p) => p.id)).toEqual(["fx-earring-b"]);
  });
  it("supports the pendants category", () => {
    expect(filterProducts(products, { category: "pendants" }).length).toBe(2);
  });
  it("handles empty search and reversed bounds", () => {
    expect(filterProducts(products, { q: "does not exist" })).toEqual([]);
    expect(filterProducts(products, { min: 4000, max: 1000 })).toEqual([]);
  });
  it("sorts by price both ways", () => {
    expect(filterProducts(products, { sort: "price-asc" }).map((p) => p.price)).toEqual([1899, 2099, 5899, 10999]);
    expect(filterProducts(products, { sort: "price-desc" })[0]?.price).toBe(10999);
  });
  it("paginates and rejects malformed URL values", () => {
    expect(PAGE_SIZE).toBe(12);
    expect(visibleProductCount({}, 20)).toBe(12);
    expect(visibleProductCount({ shown: 24 }, 20)).toBe(20);
    expect(validateExplorerSearch({ min: "oops", max: Infinity }).min).toBeUndefined();
    expect(filterProducts(products, { category: "unknown" }).length).toBe(4);
  });
});
describe("Bag", () => {
  const id = "fx-earring-a";
  it("adds real-priced pieces, increments and totals in INR", () => {
    const items = addCartItem(addCartItem([], id), id);
    expect(items).toEqual([{ productId: id, quantity: 2 }]);
    expect(cartTotal(items)).toBe(4198);
    expect(setCartQuantity(items, id, 0)).toEqual([]);
  });
  it("does not add unknown products", () => {
    expect(addCartItem([], "unknown")).toEqual([]);
  });
  it("keeps quantities across same-tab refresh", () => {
    sessionStorage.clear();
    const first = renderHook(useCart, { wrapper: CartProvider });
    act(() => first.result.current.add(id));
    expect(first.result.current.items).toEqual([{ productId: id, quantity: 1 }]);
    first.unmount();
    const second = renderHook(useCart, { wrapper: CartProvider });
    expect(second.result.current.items).toEqual([{ productId: id, quantity: 1 }]);
    second.unmount();
    sessionStorage.removeItem(DEMO_BAG_KEY);
  });
});
