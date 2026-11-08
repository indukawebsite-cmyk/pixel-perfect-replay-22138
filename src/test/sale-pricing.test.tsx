import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { getProduct, isOnSale, salePercent } from "@/lib/catalog";
import { ProductCard } from "@/components/shop/ProductCard";
import { CartProvider } from "@/components/shop/CartProvider";
import { WishlistProvider } from "@/components/shop/WishlistProvider";

// ProductCard links to the product page; a plain anchor keeps the test router-free.
vi.mock("@tanstack/react-router", () => ({
  Link: ({ children, ...props }: { children?: React.ReactNode }) => <a {...props}>{children}</a>,
}));

afterEach(cleanup);

describe("Sale pricing rules", () => {
  it("maps the stored original price onto the product", () => {
    const sale = getProduct("fx-pendant-b");
    expect(sale?.price).toBe(10999);
    expect(sale?.compareAtPrice).toBe(21998);
    expect(getProduct("fx-pendant-a")?.compareAtPrice).toBeUndefined();
  });
  it("treats a product as on sale only when the original price is higher", () => {
    expect(isOnSale(getProduct("fx-pendant-b")!)).toBe(true);
    expect(isOnSale(getProduct("fx-pendant-a")!)).toBe(false);
    expect(isOnSale({ ...getProduct("fx-pendant-b")!, compareAtPrice: 10999 })).toBe(false);
    expect(isOnSale({ ...getProduct("fx-pendant-b")!, compareAtPrice: 1 })).toBe(false);
  });
  it("rounds the discount percentage from the stored prices", () => {
    expect(salePercent(getProduct("fx-pendant-b")!)).toBe(50);
    expect(salePercent(getProduct("fx-pendant-a")!)).toBe(0);
    expect(salePercent({ ...getProduct("fx-pendant-b")!, price: 2949.5, compareAtPrice: 5899 })).toBe(50);
  });
  it("shows the badge, sale label and struck-through original price on sale cards", () => {
    render(
      <CartProvider>
        <WishlistProvider>
          <ProductCard product={getProduct("fx-pendant-b")!} />
        </WishlistProvider>
      </CartProvider>,
    );
    expect(screen.getByText("50% off")).toBeInTheDocument();
    expect(screen.getByText("Diwali Special Sale")).toBeInTheDocument();
    expect(screen.getByText("₹21,998")).toBeInTheDocument();
    expect(screen.getByText("₹10,999")).toBeInTheDocument();
  });
  it("shows no sale markup on full-price cards", () => {
    render(
      <CartProvider>
        <WishlistProvider>
          <ProductCard product={getProduct("fx-pendant-a")!} />
        </WishlistProvider>
      </CartProvider>,
    );
    expect(screen.queryByText(/% off/)).toBeNull();
    expect(screen.queryByText("Diwali Special Sale")).toBeNull();
    expect(screen.getByText("₹5,899")).toBeInTheDocument();
  });
});
