import { act, renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { collections, demoProducts, sampleProducts } from "@/lib/catalog";
import {
  filterProducts,
  PAGE_SIZE,
  validateExplorerSearch,
  visibleProductCount,
} from "@/lib/product-explorer";
import { addCartItem, cartTotal, setCartQuantity } from "@/lib/demo-cart";
import { CartProvider, DEMO_BAG_KEY, useCart } from "@/components/shop/CartProvider";

describe("Demo shopping catalogue", () => {
  it("provides demo grids for all six collections, without claiming real pricing or stock", () => {
    expect(
      collections.map((c) => demoProducts.filter((p) => p.collection === c.slug).length),
    ).toEqual([4, 4, 4, 4, 4, 4]);
    expect(demoProducts.every((p) => p.isSample && p.price === null)).toBe(true);
    expect(demoProducts[0]?.demoPrice).toBe(1200);
    expect(sampleProducts.every((p) => p.price === null && p.demoPrice === undefined)).toBe(true);
  });
  it("combines category, price range, demo attribute and name search", () => {
    expect(
      filterProducts(demoProducts, {
        category: "earrings",
        min: 1500,
        max: 2200,
        edit: "Statement",
        q: "DEMO purnima",
      }).map((p) => p.id),
    ).toEqual(["demo-purnima-earrings"]);
  });
  it("includes exact price boundaries and excludes unknown prices", () => {
    expect(
      filterProducts([...sampleProducts, ...demoProducts], { min: 1200, max: 1200 }).map(
        (p) => p.id,
      ),
    ).toEqual(["demo-chandni-earrings"]);
  });
  it("handles empty search and reversed price bounds", () => {
    expect(filterProducts(demoProducts, { q: "does not exist" })).toEqual([]);
    expect(filterProducts(demoProducts, { min: 4000, max: 1000 })).toEqual([]);
    expect(filterProducts([], {})).toEqual([]);
  });
  it("sorts Featured and Newest by demo merchandising order", () => {
    expect(filterProducts(demoProducts, { sort: "featured" })[0]?.id).toBe("demo-chandni-earrings");
    expect(filterProducts(demoProducts, { sort: "newest" })[0]?.id).toBe(
      "demo-chandrika-bracelets",
    );
  });
  it("sorts prices both ways without changing the source", () => {
    expect(filterProducts(demoProducts, { sort: "price-asc" }).map((p) => p.demoPrice)).toEqual(
      demoProducts.map((p) => p.demoPrice).sort((a, b) => (a ?? 0) - (b ?? 0)),
    );
    expect(filterProducts(demoProducts, { sort: "price-desc" })[0]?.demoPrice).toBe(4450);
    expect(demoProducts[0]?.id).toBe("demo-chandni-earrings");
  });
  it("shows a first page, loads more and clamps to the available count", () => {
    expect(PAGE_SIZE).toBe(12);
    expect(visibleProductCount({}, 24)).toBe(12);
    expect(visibleProductCount({ shown: 24 }, 24)).toBe(24);
    expect(visibleProductCount({ shown: 100 }, 4)).toBe(4);
    expect(visibleProductCount({}, 0)).toBe(0);
  });
  it("rejects malformed URL values without throwing", () => {
    expect(validateExplorerSearch({ min: "oops", max: Infinity, shown: NaN }).min).toBeUndefined();
    expect(validateExplorerSearch({ max: Infinity }).max).toBeUndefined();
    expect(filterProducts(demoProducts, { category: "unknown" }).length).toBe(24);
  });
});
describe("Visit demo bag", () => {
  const id = "demo-chandni-earrings";
  it("adds demo pieces, increments quantity and totals illustrative INR", () => {
    const items = addCartItem(addCartItem([], id), id);
    expect(items).toEqual([{ productId: id, quantity: 2 }]);
    expect(cartTotal(items)).toBe(2400);
    expect(setCartQuantity(items, id, 0)).toEqual([]);
  });
  it("does not add legacy unpriced samples or unknown products", () => {
    expect(addCartItem([], "sample-1")).toEqual([]);
    expect(addCartItem([], "unknown")).toEqual([]);
  });
  it("keeps quantities across rerenders and same-tab refresh, clearing with the tab session", () => {
    sessionStorage.clear();
    const first = renderHook(useCart, { wrapper: CartProvider });
    act(() => first.result.current.add(id));
    first.rerender();
    expect(first.result.current.items).toEqual([{ productId: id, quantity: 1 }]);
    first.unmount();
    const second = renderHook(useCart, { wrapper: CartProvider });
    expect(second.result.current.items).toEqual([{ productId: id, quantity: 1 }]);
    second.unmount();
    sessionStorage.removeItem(DEMO_BAG_KEY);
    const third = renderHook(useCart, { wrapper: CartProvider });
    expect(third.result.current.items).toEqual([]);
    third.unmount();
  });
});
