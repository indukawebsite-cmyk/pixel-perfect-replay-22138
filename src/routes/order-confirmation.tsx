import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { CheckoutSteps } from "@/components/shop/CheckoutShell";
import { checkoutHead } from "@/lib/demo-checkout";
import { formatPrice } from "@/lib/catalog";

type OrderRecord = {
  id: string;
  order_number: string;
  status: string;
  subtotal: number;
  discount: number;
  shipping: number;
  total: number;
  shipping_name: string;
  address_line1: string;
  address_line2: string | null;
  city: string;
  state: string;
  pin_code: string;
  country: string;
  created_at: string;
  order_items: { id: string; product_name: string; quantity: number; purchase_price: number }[];
  payments: { id: string; status: string; amount: number }[];
  shipments: { id: string; status: string; courier_name: string | null; awb_code: string | null; tracking_url: string | null }[];
};

export const Route = createFileRoute("/order-confirmation")({
  staticData: { sitemap: false },
  validateSearch: (search: Record<string, unknown>): { order?: string } =>
    typeof search["order"] === "string" && /^[0-9a-f-]{36}$/i.test(search["order"])
      ? { order: search["order"] }
      : {},
  head: () => checkoutHead("Order confirmation", "Your INDUKA order has been received."),
  component: ConfirmationPage,
});

function paymentLabel(status?: string) {
  if (status === "captured") return "Paid online";
  if (status === "failed") return "Payment failed";
  return "Pay on delivery";
}

function ConfirmationPage() {
  const { order } = Route.useSearch();
  const [record, setRecord] = useState<OrderRecord | null>(null);
  const [loading, setLoading] = useState(Boolean(order));

  useEffect(() => {
    if (!order) return;
    let cancelled = false;
    void supabase
      .from("orders")
      .select("*, order_items(*), payments(*), shipments(*)")
      .eq("id", order)
      .maybeSingle()
      .then(({ data }) => {
        if (!cancelled) {
          setRecord((data as OrderRecord | null) ?? null);
          setLoading(false);
        }
      });
    return () => {
      cancelled = true;
    };
  }, [order]);

  return (
    <section className="container-lux py-8 md:py-12">
      <CheckoutSteps active="confirmation" />
      {loading ? (
        <p role="status" className="py-16">
          Loading your order…
        </p>
      ) : !record ? (
        <div className="py-12 text-center">
          <h1 className="text-4xl">No order to show</h1>
          <p className="mx-auto mt-5 max-w-md text-sm leading-loose text-muted-foreground">
            We could not find a recent order for this link. Your orders are visible in your account
            once you are signed in.
          </p>
          <Button asChild variant="lux" size="xl" className="mt-8">
            <Link to="/shop">Continue shopping</Link>
          </Button>
        </div>
      ) : (
        <>
          <div className="max-w-2xl">
            <Check className="mb-5 h-8 w-8 text-cocoa" strokeWidth={1} />
            <h1 className="text-4xl md:text-5xl">Thank you — your order is confirmed</h1>
            <p className="mt-5 text-sm leading-loose text-muted-foreground">
              We are preparing your jewellery for dispatch. You will receive tracking details as
              soon as your parcel is on its way.
            </p>
            <p className="mt-5 text-sm">
              Order number <span className="ml-2 font-medium">{record.order_number}</span>
            </p>
            <p className="mt-2 text-sm text-muted-foreground">
              {paymentLabel(record.payments[0]?.status)} · {formatPrice(Number(record.total))}
            </p>
          </div>
          <div className="mt-10 grid items-start gap-10 lg:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)] lg:gap-14">
            <div>
              <h2 className="text-3xl">Your pieces</h2>
              <ul className="mt-5 divide-y divide-border border-y border-border">
                {record.order_items.map((item) => (
                  <li key={item.id} className="flex justify-between gap-4 py-4 text-sm">
                    <span>
                      {item.product_name} × {item.quantity}
                    </span>
                    <span>{formatPrice(Number(item.purchase_price) * item.quantity)}</span>
                  </li>
                ))}
              </ul>
              <dl className="mt-5 space-y-3 text-sm">
                <div className="flex justify-between gap-4">
                  <dt>Subtotal</dt>
                  <dd>{formatPrice(Number(record.subtotal))}</dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt>Shipping</dt>
                  <dd>{formatPrice(Number(record.shipping))}</dd>
                </div>
                <div className="flex justify-between gap-4 border-t border-border pt-4 text-lg font-medium">
                  <dt>Total</dt>
                  <dd>{formatPrice(Number(record.total))}</dd>
                </div>
              </dl>
            </div>
            <div className="space-y-6">
              <div className="border border-border p-6 text-sm">
                <p className="eyebrow text-[0.6rem] text-champagne">Delivering to</p>
                <p className="mt-3 leading-relaxed">
                  {record.shipping_name}
                  <br />
                  {record.address_line1}
                  {record.address_line2 && (
                    <>
                      <br />
                      {record.address_line2}
                    </>
                  )}
                  <br />
                  {record.city}, {record.state} {record.pin_code}
                  <br />
                  {record.country}
                </p>
              </div>
              {record.shipments[0]?.tracking_url && (
                <a
                  href={record.shipments[0].tracking_url}
                  target="_blank"
                  rel="noreferrer"
                  className="link-lux text-sm"
                >
                  Track your parcel
                </a>
              )}
              <Button asChild variant="lux" className="h-13 w-full tracking-normal">
                <Link to="/shop">Continue shopping</Link>
              </Button>
            </div>
          </div>
        </>
      )}
    </section>
  );
}
