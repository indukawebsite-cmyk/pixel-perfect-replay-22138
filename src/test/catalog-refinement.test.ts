import { describe, expect, it } from "vitest";
import { collections, allProducts } from "@/lib/catalog";
import { searchProducts, validateNewsletterEmail } from "@/lib/catalog-search";
import { setCatalog } from "@/lib/live-catalog";

describe("Catalogue constraints", () => {
  it("uses exactly the six official collections", () => {
    expect(collections.map((c) => [c.name, c.slug, c.meaning])).toEqual([
      ["Chandni", "chandni", "The Moonlight Collection"],
      ["Ardh Chand", "ardh-chand", "The Crescent Collection"],
      ["Purnima", "purnima", "The Full Moon Collection"],
      ["Tara", "tara", "The Starlight Collection"],
      ["Nakshatra", "nakshatra", "The Constellation Collection"],
      ["Chandrika", "chandrika", "The Lunar Radiance Collection"],
    ]);
  });
  it("ships no built-in sample or demo products", () => {
    setCatalog({ status: "idle", products: [] });
    expect(allProducts()).toEqual([]);
    expect(searchProducts("")).toEqual([]);
  });
  it("searches names and collections without case sensitivity", () => {
    expect(searchProducts(" CHANDNI ").map((p) => p.id)).toEqual(["fx-pendant-b", "fx-earring-a"]);
    expect(searchProducts("missing-piece")).toEqual([]);
  });
  it("matches search terms within the selected category", () => {
    expect(searchProducts("fixture", "earrings").map((p) => p.id)).toEqual(["fx-earring-a", "fx-earring-b"]);
  });
  it("validates newsletter email", () => {
    expect(validateNewsletterEmail("invalid@")).toBe(false);
    expect(validateNewsletterEmail("guest@example.com")).toBe(true);
  });
});
