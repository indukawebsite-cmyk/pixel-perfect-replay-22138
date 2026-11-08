import { createFileRoute, Link } from "@tanstack/react-router";
import { useCart } from "@/components/shop/CartProvider";
import { CheckoutForm } from "@/components/shop/CheckoutForm";
import { OrderSummary } from "@/components/shop/OrderSummary";
import { CartLines } from "@/components/shop/CartLines";
import { CheckoutSteps, EmptyCart } from "@/components/shop/CheckoutShell";
import { checkoutHead } from "@/lib/demo-checkout";
export const Route = createFileRoute("/checkout")({
  staticData: { sitemap: false },
  head: () => checkoutHead("Checkout", "Place your INDUKA order with secure payment or cash on delivery."),
  component: CheckoutPage,
});
function CheckoutPage() {
  const { items, ready } = useCart();
  return (
    <section className="container-lux py-8 md:py-12">
      <CheckoutSteps active="checkout" />
      <h1 className="text-4xl md:text-5xl">Checkout</h1>
      {!ready ? (
        <p role="status" className="py-16">
          Loading your bag…
        </p>
      ) : !items.length ? (
        <EmptyCart />
      ) : (
        <div className="mt-8 grid items-start gap-10 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)] lg:gap-14">
          <CheckoutForm />
          <OrderSummary items={items}>
            <CartLines items={items} />
            <Link to="/cart" className="inline-block text-sm underline underline-offset-4">
              Edit bag
            </Link>
          </OrderSummary>
        </div>
      )}
    </section>
  );
}
