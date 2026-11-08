import { describe, expect, it } from "vitest";
import { createRootRoute, createRoute, createRouter } from "@tanstack/react-router";
import { sitemapStaticPaths, sitemapXML } from "@/lib/sitemap";

describe("public sitemap inventory", () => {
  const root = createRootRoute({ staticData: { sitemap: false } });
  const home = createRoute({ getParentRoute: () => root, path: "/", staticData: { sitemap: true } });
  const shop = createRoute({ getParentRoute: () => root, path: "/shop", staticData: { sitemap: true } });
  const checkout = createRoute({ getParentRoute: () => root, path: "/checkout", staticData: { sitemap: false } });
  const product = createRoute({ getParentRoute: () => root, path: "/products/$id", staticData: { sitemap: false } });
  const admin = createRoute({ getParentRoute: () => root, path: "/admin", staticData: { sitemap: "exclude-subtree" } });
  const adminOrders = createRoute({ getParentRoute: () => admin, path: "/orders", staticData: { sitemap: true } });
  const router = createRouter({ routeTree: root.addChildren([home, shop, checkout, product, admin.addChildren([adminOrders])]) });

  it("includes public pages but excludes checkout, noindex products and private descendants", () => {
    expect(sitemapStaticPaths(router)).toEqual(["/", "/shop"]);
  });

  it("uses the production origin and deduplicates entries without fabricating lastmod", () => {
    const xml = sitemapXML("https://www.indukajewels.com", [{ path: "/shop" }, { path: "/shop" }]);
    expect(xml.match(/<loc>/g)).toHaveLength(1);
    expect(xml).toContain("<loc>https://www.indukajewels.com/shop</loc>");
    expect(xml).not.toContain("<lastmod>");
  });

  it("rejects off-site paths and non-origin base URLs", () => {
    expect(() => sitemapXML("https://www.indukajewels.com", [{ path: "//other.example/" }])).toThrow("Invalid sitemap path");
    expect(() => sitemapXML("https://www.indukajewels.com/shop", [])).toThrow("public site origin");
  });
});