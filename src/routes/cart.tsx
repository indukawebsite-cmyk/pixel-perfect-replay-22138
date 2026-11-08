import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCart } from "@/components/shop/CartProvider";
import { CartLines } from "@/components/shop/CartLines";
import { OrderSummary } from "@/components/shop/OrderSummary";
import { CheckoutSteps, EmptyCart } from "@/components/shop/CheckoutShell";
import { checkoutHead } from "@/lib/demo-checkout";
export const Route = createFileRoute("/cart")({
  staticData: { sitemap: false },
  head: () => checkoutHead("Your bag", "Review your INDUKA pieces before checkout."),
  component: CartPage,
});
function CartPage() {
  const { items, setQuantity, ready } = useCart();
  return (
    <section className="container-lux py-8 md:py-12">
      <CheckoutSteps active="cart" />
      <h1 className="text-4xl md:text-5xl">Your bag</h1>
      {!ready ? (
        <p role="status" className="py-16">
          Loading your bag…
        </p>
      ) : !items.length ? (
        <EmptyCart />
      ) : (
        <div className="mt-10 grid items-start gap-10 lg:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)] lg:gap-14">
          <div>
            <CartLines items={items} onQuantity={setQuantity} />
            <Button asChild variant="link" className="mt-4 px-0">
              <Link to="/shop">
                <ArrowLeft />
                Continue shopping
              </Link>
            </Button>
          </div>
          <OrderSummary items={items}>
            <Button asChild variant="lux" className="h-13 w-full tracking-normal">
              <Link to="/checkout">
                Continue to checkout
                <ArrowRight />
              </Link>
            </Button>
          </OrderSummary>
        </div>
      )}
    </section>
  );
}
