import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { AdminHeader } from "@/components/admin/AdminUi";
import { getOrder } from "@/lib/admin/api";
import { formatPrice } from "@/lib/catalog";

export const Route = createFileRoute("/_authenticated/admin/orders/$orderId")({
  component: OrderDetail,
});

function OrderDetail() {
  const { orderId } = Route.useParams();
  const q = useQuery({ queryKey: ["admin", "order", orderId], queryFn: () => getOrder(orderId) });
  if (q.isLoading) return <p role="status">Loading order…</p>;
  const o = q.data;
  if (!o) return <p role="alert">Order not found. <Link to="/admin/orders" className="link-lux">Back to orders</Link></p>;
  const date = (v: string) => new Date(v).toLocaleString("en-IN");
  return (
    <>
      <AdminHeader eyebrow={`Placed ${date(o.created_at)}`} title={`Order ${o.order_number}`}>
        <Button asChild variant="luxOutline"><Link to="/admin/orders">All orders</Link></Button>
      </AdminHeader>
      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_320px]">
        <section>
          <h2 className="text-2xl">Items</h2>
          <ul className="mt-4 divide-y divide-border border-y border-border">
            {o.order_items.map((i) => (
              <li key={i.id} className="flex justify-between gap-4 py-3 text-sm">
                <span>{i.product_name} × {i.quantity}</span>
                <span>{formatPrice(Number(i.purchase_price) * i.quantity)}</span>
              </li>
            ))}
          </ul>
          <dl className="mt-4 grid grid-cols-2 gap-2 text-sm">
            <dt>Subtotal</dt><dd className="text-right">{formatPrice(Number(o.subtotal))}</dd>
            <dt>Discount</dt><dd className="text-right">−{formatPrice(Number(o.discount))}</dd>
            <dt>Shipping</dt><dd className="text-right">{formatPrice(Number(o.shipping))}</dd>
            <dt className="font-medium">Total</dt><dd className="text-right font-medium">{formatPrice(Number(o.total))}</dd>
          </dl>
          <h2 className="mt-10 text-2xl">History</h2>
          <ul className="mt-4 flex flex-col gap-2 text-sm">
            <li>{date(o.created_at)} — order created ({o.status})</li>
            {o.payments.map((p) => <li key={p.id}>{date(p.updated_at)} — payment {p.status} · {formatPrice(Number(p.amount))}{p.razorpay_payment_id ? ` · ${p.razorpay_payment_id}` : ""}</li>)}
            {o.shipments.map((s) => <li key={s.id}>{date(s.updated_at)} — shipment {s.status.replaceAll("_", " ")}{s.courier_name ? ` · ${s.courier_name}` : ""}{s.awb_code ? ` · AWB ${s.awb_code}` : ""}</li>)}
          </ul>
        </section>
        <aside className="flex flex-col gap-6 text-sm">
          <div className="border border-border bg-card p-5">
            <p className="eyebrow text-[0.6rem] text-champagne">Customer</p>
            <p className="mt-2 font-medium">{o.customers?.full_name || o.shipping_name}</p>
            <p className="text-muted-foreground">{o.customers?.email}</p>
            <p className="text-muted-foreground">{o.customers?.phone || o.shipping_phone}</p>
          </div>
          <div className="border border-border p-5">
            <p className="eyebrow text-[0.6rem] text-champagne">Ship to</p>
            <p className="mt-2 leading-relaxed">{o.shipping_name}<br />{o.address_line1}{o.address_line2 && <><br />{o.address_line2}</>}<br />{o.city}, {o.state} {o.pin_code}<br />{o.country}</p>
          </div>
          {o.shipments[0]?.tracking_url && <a href={o.shipments[0].tracking_url} target="_blank" rel="noreferrer" className="link-lux">Track shipment</a>}
          <p className="text-xs text-muted-foreground">Order, payment and shipping updates are recorded automatically by the checkout and courier systems once they are switched on.</p>
        </aside>
      </div>
    </>
  );
}
