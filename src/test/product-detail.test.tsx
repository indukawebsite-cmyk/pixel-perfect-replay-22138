import { act, cleanup, fireEvent, render, renderHook, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { getProduct } from "@/lib/catalog";
import {
  productGallery,
  validPin,
  validQuantity,
  relatedProducts,
  recordViewed,
} from "@/lib/product-detail";
import { VariantSelector } from "@/components/shop/VariantSelector";
import { QuantitySelector } from "@/components/shop/QuantitySelector";
import { ProductAccordion } from "@/components/shop/ProductAccordion";
import {
  RecentlyViewedProvider,
  useRecentlyViewed,
} from "@/components/shop/RecentlyViewedProvider";
import { useState } from "react";
afterEach(cleanup);
describe("Product detail rules", () => {
  it("resolves pieces by slug from the live catalogue", () => {
    expect(getProduct("fx-pendant-a")?.sku).toBe("BR001");
    expect(getProduct("missing")).toBeUndefined();
  });
  it("shows every stored photo in order, with the primary first", () => {
    const product = getProduct("fx-earring-b");
    if (!product) throw new Error("Missing fixture");
    const gallery = productGallery(product);
    expect(gallery.length).toBe(4);
    expect(gallery[0]?.src).toBe(product.image);
    expect(gallery[0]?.label).toBe("Main view");
  });
  it("shows material and purity from the catalogue in product specifications", async () => {
    const product = getProduct("fx-pendant-a");
    if (!product) throw new Error("Missing fixture");
    expect(product.material).toBe("925 Sterling Silver");
    expect(product.purity).toBe("925 (92.5% Silver)");
    render(<ProductAccordion product={product} />);
    fireEvent.click(screen.getByRole("button", { name: "Product details" }));
    expect(await screen.findByText("Material")).toBeInTheDocument();
    expect(screen.getByText("925 Sterling Silver")).toBeInTheDocument();
    expect(screen.getByText("Purity")).toBeInTheDocument();
    expect(screen.getByText("925 (92.5% Silver)")).toBeInTheDocument();
    expect(screen.getByText(product.sku ?? "")).toBeInTheDocument();
  });
  it("omits material and purity rows when the catalogue has none", async () => {
    const product = getProduct("fx-pendant-a");
    if (!product) throw new Error("Missing fixture");
    render(<ProductAccordion product={{ ...product, material: undefined, purity: undefined }} />);
    fireEvent.click(screen.getByRole("button", { name: "Product details" }));
    expect(await screen.findByText("SKU")).toBeInTheDocument();
    expect(screen.queryByText("Material")).toBeNull();
    expect(screen.queryByText("Purity")).toBeNull();
  });
  it("accepts whole positive quantities and rejects invalid input", () => {
    expect(validQuantity(1)).toBe(true);
    expect(validQuantity(3)).toBe(true);
    for (const value of [0, -1, 1.5, NaN, Infinity]) expect(validQuantity(value)).toBe(false);
  });
  it("changes quantity through the selector and prevents zero", () => {
    function Harness() {
      const [value, setValue] = useState("1");
      return <QuantitySelector value={value} onChange={setValue} />;
    }
    render(<Harness />);
    expect(screen.getByRole("button", { name: "Decrease quantity" })).toBeDisabled();
    fireEvent.click(screen.getByRole("button", { name: "Increase quantity" }));
    expect(screen.getByLabelText("Quantity")).toHaveValue(2);
    fireEvent.change(screen.getByLabelText("Quantity"), { target: { value: "1.5" } });
    expect(screen.getByLabelText("Quantity")).toHaveAttribute("aria-invalid", "true");
  });
  it("renders and selects variants when supplied", () => {
    const variants = [{ id: "a", label: "Option A", isDemo: false }, { id: "b", label: "Option B", isDemo: false }];
    function Harness() {
      const [selected, select] = useState("a");
      return <VariantSelector variants={variants} selected={selected} onSelect={select} />;
    }
    render(<Harness />);
    fireEvent.click(screen.getByRole("button", { name: "Option B" }));
    expect(screen.getByRole("button", { name: "Option B" })).toHaveAttribute("aria-pressed", "true");
  });
  it("puts same-collection pieces first in related products", () => {
    const product = getProduct("fx-pendant-b");
    if (!product) throw new Error("Missing fixture");
    const related = relatedProducts(product);
    expect(related.some((item) => item.id === product.id)).toBe(false);
    expect(related[0]?.id).toBe("fx-earring-a");
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
