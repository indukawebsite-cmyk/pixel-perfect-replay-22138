import { authHead } from "@/components/auth/AuthShell";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Button } from "@/components/ui/button";
import { AdminHeader } from "@/components/admin/AdminUi";
import { getOrder } from "@/lib/admin/api";
import { updateOrderStatus } from "@/lib/admin/orders.functions";
import {
  approveCancellation,
  approveReturn,
  confirmOfflineRefund,
  markReturnReceived,
  recordInspection,
  rejectCancellation,
  rejectReturn,
} from "@/lib/admin/cancellations.functions";
import { formatPrice } from "@/lib/catalog";

// Cancelled/refunded are excluded on purpose: those states are only reachable
// through the guarded cancellation/return actions below.
const ORDER_STATUSES = ["pending", "confirmed", "processing", "shipped", "delivered"] as const;

export const Route = createFileRoute("/_authenticated/admin/orders/$orderId")({
  staticData: { sitemap: false },
  head: () => authHead("Order administration", "Order administration for House of Induka administrators."),
  component: OrderDetail,
});

function OrderDetail() {
  const { orderId } = Route.useParams();
  const q = useQuery({ queryKey: ["admin", "order", orderId], queryFn: () => getOrder(orderId) });
  const setStatus = useServerFn(updateOrderStatus);
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
          <CancellationPanel order={o} onChanged={() => q.refetch()} />
          <ReturnPanel order={o} onChanged={() => q.refetch()} />
          {o.refunds.length > 0 && (
            <div className="border border-border p-5">
              <p className="eyebrow text-[0.6rem] text-champagne">Refunds</p>
              <ul className="mt-2 flex flex-col gap-2">
                {o.refunds.map((r) => (
                  <li key={r.id}>
                    {r.kind} · {formatPrice(Number(r.amount))} · {r.status}
                    {r.razorpay_refund_id && <span className="text-muted-foreground"> · {r.razorpay_refund_id}</span>}
                    {r.offline_reference && <span className="text-muted-foreground"> · {r.offline_method}: {r.offline_reference}</span>}
                    {!r.payment_id && r.status !== "processed" && (
                      <ConfirmOffline refundId={r.id} onChanged={() => q.refetch()} />
                    )}
                  </li>
                ))}
              </ul>
            </div>
          )}
          <div className="border border-border p-5">
            <label htmlFor="order-status" className="eyebrow text-[0.6rem] text-champagne">Order status</label>
            <select
              id="order-status"
              value={o.status}
              onChange={(event) => {
                const status = event.target.value;
                void setStatus({ data: { orderId: o.id, status: status as (typeof ORDER_STATUSES)[number] } }).then(() => q.refetch());
              }}
              className="mt-3 h-11 w-full border border-input bg-background px-3 text-sm"
            >
              {ORDER_STATUSES.map((s) => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
            </select>
          </div>
        </aside>
      </div>
    </>
  );
}

/* eslint-disable @typescript-eslint/no-explicit-any */
function CancellationPanel({ order, onChanged }: { order: any; onChanged: () => void }) {
  const approve = useServerFn(approveCancellation);
  const reject = useServerFn(rejectCancellation);
  const open = order.cancellation_requests.filter((r: any) => r.status === "requested");
  const past = order.cancellation_requests.filter((r: any) => r.status !== "requested");
  if (!open.length && !past.length) return null;
  const act = (fn: any, requestId: string) =>
    void fn({ data: { requestId } }).then(onChanged).catch((e: Error) => alert(e.message));
  return (
    <div className="border border-border p-5">
      <p className="eyebrow text-[0.6rem] text-champagne">Cancellation requests</p>
      <ul className="mt-2 flex flex-col gap-3">
        {open.map((r: any) => (
          <li key={r.id}>
            <p className="text-muted-foreground">"{r.reason}"</p>
            <div className="mt-2 flex gap-2">
              <Button variant="lux" size="sm" onClick={() => act(approve, r.id)}>Approve & cancel</Button>
              <Button variant="luxOutline" size="sm" onClick={() => act(reject, r.id)}>Reject</Button>
            </div>
          </li>
        ))}
        {past.map((r: any) => (
          <li key={r.id} className="text-muted-foreground">
            {r.status} · "{r.reason}"{r.admin_note && ` · ${r.admin_note}`}
          </li>
        ))}
      </ul>
    </div>
  );
}

function ReturnPanel({ order, onChanged }: { order: any; onChanged: () => void }) {
  const approve = useServerFn(approveReturn);
  const reject = useServerFn(rejectReturn);
  const received = useServerFn(markReturnReceived);
  const inspect = useServerFn(recordInspection);
  if (!order.return_requests.length) return null;
  const act = (fn: any, data: Record<string, unknown>) =>
    void fn({ data }).then(onChanged).catch((e: Error) => alert(e.message));
  return (
    <div className="border border-border p-5">
      <p className="eyebrow text-[0.6rem] text-champagne">Return requests</p>
      <ul className="mt-2 flex flex-col gap-3">
        {order.return_requests.map((r: any) => (
          <li key={r.id}>
            <p>{r.status.replaceAll("_", " ")} · <span className="text-muted-foreground">"{r.reason}"</span></p>
            {r.admin_note && <p className="text-muted-foreground">{r.admin_note}</p>}
            {r.return_awb && <p className="text-muted-foreground">Return shipment: {r.return_courier} · {r.return_awb}</p>}
            <div className="mt-2 flex flex-wrap gap-2">
              {r.status === "requested" && (
                <>
                  <Button variant="lux" size="sm" onClick={() => act(approve, { requestId: r.id })}>Approve</Button>
                  <Button variant="luxOutline" size="sm" onClick={() => act(reject, { requestId: r.id })}>Reject</Button>
                </>
              )}
              {r.status === "approved" && (
                <Button variant="lux" size="sm" onClick={() => act(received, { requestId: r.id })}>Mark received</Button>
              )}
              {r.status === "received" && (
                <>
                  <Button variant="lux" size="sm" onClick={() => act(inspect, { requestId: r.id, passed: true })}>Inspection passed</Button>
                  <Button variant="luxOutline" size="sm" onClick={() => act(inspect, { requestId: r.id, passed: false })}>Inspection failed</Button>
                </>
              )}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

function ConfirmOffline({ refundId, onChanged }: { refundId: string; onChanged: () => void }) {
  const confirm = useServerFn(confirmOfflineRefund);
  return (
    <Button
      variant="luxOutline"
      size="sm"
      className="ml-2"
      onClick={() => {
        const reference = window.prompt("UPI / bank transfer reference:");
        if (!reference) return;
        const method = window.confirm("Paid via UPI? (Cancel = bank transfer)") ? "upi" : "bank_transfer";
        void confirm({ data: { refundId, method, reference } }).then(onChanged).catch((e: Error) => alert(e.message));
      }}
    >
      Confirm offline refund
    </Button>
  );
}
