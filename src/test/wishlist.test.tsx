import { act, renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { WishlistProvider, useWishlist } from "@/components/shop/WishlistProvider";

describe("Visit wishlist", () => {
  it("adds a sample once and removes it on the next toggle", () => {
    const { result } = renderHook(useWishlist, { wrapper: WishlistProvider });
    act(() => result.current.toggle("sample-1"));
    expect(result.current.ids).toEqual(["sample-1"]);
    act(() => result.current.toggle("sample-1"));
    expect(result.current.ids).toEqual([]);
  });
  it("does not persist saved samples across a new visit", () => {
    const first = renderHook(useWishlist, { wrapper: WishlistProvider });
    act(() => first.result.current.toggle("sample-2"));
    expect(first.result.current.ids).toEqual(["sample-2"]);
    first.unmount();
    const second = renderHook(useWishlist, { wrapper: WishlistProvider });
    expect(second.result.current.ids).toEqual([]);
  });
});