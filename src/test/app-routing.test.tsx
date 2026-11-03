import { QueryClient } from "@tanstack/react-query";
import { createRouter, rootRouteId } from "@tanstack/react-router";
import { describe, expect, it } from "vitest";

import { routeTree } from "@/routeTree.gen";

// Match routes without running loaders or rendering: loaders may need a server or
// network the test run lacks, and jsdom never loads the stylesheets React waits on.
describe("App routing", () => {
  it("matches a page for / instead of falling back to not found", () => {
    const router = createRouter({ routeTree, context: { queryClient: new QueryClient() } });

    const matches = router.matchRoutes("/");

    expect(matches.at(-1)?.routeId).not.toBe(rootRouteId);
  });
  it.each([
    "/shop",
    "/collections",
    "/about",
    "/contact",
    "/account",
    "/wishlist",
    "/faqs",
    "/shipping",
    "/returns",
    "/privacy",
    "/terms",
    "/social",
    "/products/sample-1",
    "/collections/ardh-chandra",
    "/cart",
    "/checkout",
    "/order-confirmation",
    "/auth",
    "/signup",
    "/forgot-password",
    "/reset-password",
    "/admin",
  ])("matches the linked destination %s", (path) => {
    const router = createRouter({ routeTree, context: { queryClient: new QueryClient() } });
    const match = router.matchRoutes(path).at(-1);
    expect(match?.routeId).not.toBe(rootRouteId);
    expect(match?.pathname.replace(/\/$/, "")).toBe(path);
  });
});
