import { createFileRoute, Link } from "@tanstack/react-router";
import { useCart } from "@/components/shop/CartProvider";
import { CheckoutForm } from "@/components/shop/CheckoutForm";
import { OrderSummary } from "@/components/shop/OrderSummary";
import { CartLines } from "@/components/shop/CartLines";
import { CheckoutSteps, EmptyCart } from "@/components/shop/CheckoutShell";
import { checkoutHead } from "@/lib/demo-checkout";
export const Route = createFileRoute("/checkout")({ head: () => checkoutHead("Demo checkout", "Preview the INDUKA checkout with fictional details. No payments or real orders."), component: CheckoutPage });
function CheckoutPage() { const { items, ready } = useCart(); return <section className="container-lux py-8 md:py-12"><CheckoutSteps active="checkout" /><h1 className="text-4xl md:text-5xl">Demo checkout</h1>{!ready ? <p role="status" className="py-16">Loading demo bag…</p> : !items.length ? <EmptyCart /> : <div className="mt-8 grid items-start gap-10 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)] lg:gap-14"><CheckoutForm /><OrderSummary items={items}><CartLines items={items} /><Link to="/cart" className="inline-block text-sm underline underline-offset-4">Edit demo bag</Link></OrderSummary></div>}</section>; }