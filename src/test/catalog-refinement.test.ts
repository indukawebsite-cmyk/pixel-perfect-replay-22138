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
  it("no longer finds pieces by retired collection names", () => {
    expect(searchProducts(" CHANDNI ")).toEqual([]);
    expect(searchProducts("missing-piece")).toEqual([]);
  });
  it("matches search terms within the selected category", () => {
    expect(searchProducts("fixture", "earrings").map((p) => p.id)).toEqual(["fx-earring-b", "fx-earring-a"]);
  });
  it("validates newsletter email", () => {
    expect(validateNewsletterEmail("invalid@")).toBe(false);
    expect(validateNewsletterEmail("guest@example.com")).toBe(true);
  });
});

import { forGender, categoryMatches } from "@/lib/catalog";
describe("Men's and Women's shops", () => {
  const base = allProducts()[0]!;
  const list = [
    { ...base, id: "m", gender: "men" as const },
    { ...base, id: "w", gender: "women" as const },
    { ...base, id: "u", gender: "unisex" as const },
    { ...base, id: "x", gender: undefined },
  ];
  it("lists only confirmed men's and unisex pieces in Shop Men", () => {
    expect(forGender(list, "men").map((p) => p.id)).toEqual(["m", "u"]);
  });
  it("lists only confirmed women's and unisex pieces in Shop Women", () => {
    expect(forGender(list, "women").map((p) => p.id)).toEqual(["w", "u"]);
  });
  it("never places unassigned pieces in either shop", () => {
    expect([...forGender(list, "men"), ...forGender(list, "women")].some((p) => p.id === "x")).toBe(false);
  });
  it("groups pendants under Necklaces / Chains", () => {
    expect(categoryMatches("necklaces", "pendants")).toBe(true);
    expect(categoryMatches("necklaces", "earrings")).toBe(false);
  });
});
