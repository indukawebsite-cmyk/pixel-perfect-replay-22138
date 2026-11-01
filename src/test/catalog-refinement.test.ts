import { describe, expect, it } from "vitest";
import { collections, sampleProducts } from "@/lib/catalog";
import { searchProducts, validateNewsletterEmail } from "@/lib/catalog-search";

describe("Catalogue refinement constraints", () => {
  it("preserves the six official collection names", () => { expect(collections.map((c) => c.name)).toEqual(["Chandni", "Ardh Chandra", "Purnima", "Tara", "Nakshatra", "Chandrika"]); });
  it("does not assign invented prices to sample products", () => { expect(sampleProducts.length).toBeGreaterThan(0); expect(sampleProducts.every((p) => p.price === null && p.isSample)).toBe(true); });
  it("searches names and collections without case sensitivity", () => { expect(searchProducts(" CHANDNI ").map((p) => p.id)).toEqual(["sample-2", "sample-3", "sample-8"]); expect(searchProducts("missing-piece")).toEqual([]); });
  it("matches multiple search terms and the selected category", () => { expect(searchProducts("sample chain", "bracelets").map((p) => p.id)).toEqual(["sample-8"]); });
  it("validates newsletter email before reporting its unavailable status", () => { expect(validateNewsletterEmail("invalid@")).toBe(false); expect(validateNewsletterEmail(" ")).toBe(false); expect(validateNewsletterEmail("guest@example.com")).toBe(true); });
});
