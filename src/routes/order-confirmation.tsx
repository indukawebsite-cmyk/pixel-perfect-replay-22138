import { createFileRoute, Link } from "@tanstack/react-router";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useDemoOrder } from "@/components/shop/DemoOrderProvider";
import { CartLines } from "@/components/shop/CartLines";
import { OrderSummary } from "@/components/shop/OrderSummary";
import { CheckoutSteps } from "@/components/shop/CheckoutShell";
import { checkoutHead } from "@/lib/demo-checkout";
export const Route = createFileRoute("/order-confirmation")({ head: () => checkoutHead("Demo confirmation", "An illustrative INDUKA order preview only. No real order has been placed."), component: ConfirmationPage });
function ConfirmationPage() {
  const { order } = useDemoOrder();
  return <section className="container-lux py-8 md:py-12"><CheckoutSteps active="confirmation" />{!order ? <div className="py-12 text-center"><h1 className="text-4xl">No demo confirmation</h1><p className="mx-auto mt-5 max-w-md text-sm leading-loose text-muted-foreground">Demo confirmations last only while this page session is open. No real order exists.</p><Button asChild variant="lux" size="xl" className="mt-8"><Link to="/cart">View demo bag</Link></Button></div> : <><div className="max-w-2xl"><Check className="mb-5 h-8 w-8 text-cocoa" strokeWidth={1} /><p className="mb-3 text-xs font-medium uppercase">Demo only · Not an order</p><h1 className="text-4xl md:text-5xl">Your demo preview is ready</h1><p className="mt-5 text-sm leading-loose text-muted-foreground">No real order has been placed, no payment was taken and nothing will be shipped. Customer details were not retained or sent.</p><p className="mt-5 text-sm">Demo reference <span className="ml-2 font-medium">{order.reference}</span></p></div><div className="mt-10 grid items-start gap-10 lg:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)] lg:gap-14"><div><h2 className="text-3xl">Previewed pieces</h2><CartLines items={order.items} /></div><OrderSummary items={order.items} coupon={false}><Button asChild variant="lux" className="h-13 w-full tracking-normal"><Link to="/shop">Continue shopping</Link></Button><p className="text-xs leading-loose text-muted-foreground">This local preview disappears on refresh. It is not an invoice or proof of purchase.</p></OrderSummary></div></>}</section>;
}