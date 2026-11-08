import { authHead } from "@/components/auth/AuthShell";
import { useMemo, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { AdminHeader, inputClass } from "@/components/admin/AdminUi";
import { listOrders } from "@/lib/admin/api";
import { formatPrice } from "@/lib/catalog";

export const Route = createFileRoute("/_authenticated/admin/orders/")({
  staticData: { sitemap: false },
  head: () => authHead("Manage orders", "Manage orders for House of Induka administrators."),
  component: OrdersPage,
});

const STATUSES = ["pending", "confirmed", "processing", "shipped", "delivered", "cancelled", "refunded"];

function OrdersPage() {
  const q = useQuery({ queryKey: ["admin", "orders"], queryFn: listOrders });
  const [term, setTerm] = useState("");
  const [status, setStatus] = useState("all");
  const rows = useMemo(() => {
    const t = term.trim().toLowerCase();
    return (q.data ?? []).filter((o) =>
      (status === "all" || o.status === status) &&
      (!t || o.order_number.toLowerCase().includes(t) || o.shipping_name.toLowerCase().includes(t) || (o.customers?.email ?? "").toLowerCase().includes(t)));
  }, [q.data, term, status]);
  return (
    <>
      <AdminHeader eyebrow="Sales" title="Orders" />
      <div className="mb-6 grid gap-3 sm:grid-cols-2 lg:max-w-2xl">
        <input aria-label="Search orders" placeholder="Order number, name or email" className={inputClass} value={term} onChange={(e) => setTerm(e.target.value)} />
        <select aria-label="Order status" className={inputClass} value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="all">All statuses</option>
          {STATUSES.map((s) => <option key={s} value={s} className="capitalize">{s}</option>)}
        </select>
      </div>
      {q.isLoading ? <p role="status">Loading orders…</p> : q.error ? <p role="alert">Could not load orders.</p> : (
        <div className="overflow-x-auto border border-border">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead className="bg-card text-[0.65rem] uppercase tracking-[0.14em] text-muted-foreground">
              <tr><th className="p-3">Order</th><th className="p-3">Customer</th><th className="p-3">Date</th><th className="p-3 text-right">Total</th><th className="p-3">Order</th><th className="p-3">Payment</th><th className="p-3">Shipping</th></tr>
            </thead>
            <tbody className="divide-y divide-border">
              {rows.map((o) => (
                <tr key={o.id}>
                  <td className="p-3"><Link to="/admin/orders/$orderId" params={{ orderId: o.id }} className="font-medium hover:underline">{o.order_number}</Link></td>
                  <td className="p-3">{o.customers?.full_name || o.shipping_name}<span className="block text-xs text-muted-foreground">{o.customers?.email}</span></td>
                  <td className="p-3">{new Date(o.created_at).toLocaleDateString("en-IN")}</td>
                  <td className="p-3 text-right">{formatPrice(Number(o.total))}</td>
                  <td className="p-3 capitalize">{o.status}</td>
                  <td className="p-3 capitalize">{o.payments[0]?.status ?? "—"}</td>
                  <td className="p-3 capitalize">{o.shipments[0]?.status.replaceAll("_", " ") ?? "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {!rows.length && (
            <p className="p-6 text-sm text-muted-foreground">
              {q.data?.length ? "No orders match these filters." : "No orders yet. Orders will appear here once checkout and payments are switched on."}
            </p>
          )}
        </div>
      )}
    </>
  );
}
