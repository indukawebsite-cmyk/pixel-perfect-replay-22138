import { createFileRoute, Link } from "@tanstack/react-router";
import { useSuspenseQuery, queryOptions } from "@tanstack/react-query";
import { couponHistory } from "@/lib/coupons.functions";
import { authHead } from "@/components/auth/AuthShell";
import { AdminHeader } from "@/components/admin/AdminUi";

const options = queryOptions({ queryKey: ["admin", "coupons"], queryFn: () => couponHistory() });
export const Route = createFileRoute("/_authenticated/admin/coupons")({
  staticData: { sitemap: false },
  head: () => authHead("Coupons", "Coupon redemptions for House of Induka administrators."),
  loader: ({ context }) => context.queryClient.ensureQueryData(options),
  component: CouponsPage,
});
function CouponsPage() {
  const { data } = useSuspenseQuery(options);
  return <><AdminHeader eyebrow="Sales" title="Coupons" />
    {data.coupons.map((coupon) => <section key={coupon.code} className="mb-8 border-y border-border py-5"><h2 className="text-3xl">{coupon.code}</h2><p className="mt-3 text-sm">{coupon.discount_percent}% off · {coupon.is_active ? "Active" : "Inactive"} · No expiry</p><p className="mt-2 text-sm">Successful redemptions: {data.history.filter((row) => row.coupon_code === coupon.code).length}</p></section>)}
    <h2 className="mb-4 text-2xl">Customer redemption history</h2>
    <div className="overflow-x-auto border border-border"><table className="w-full min-w-[650px] text-left text-sm"><thead className="bg-card"><tr><th className="p-3">Coupon</th><th className="p-3">Customer</th><th className="p-3">Order ID</th><th className="p-3">Redeemed</th></tr></thead><tbody>{data.history.map((row) => <tr key={row.id} className="border-t border-border"><td className="p-3">{row.coupon_code}</td><td className="p-3">{row.customers?.full_name || row.customer_id}<span className="block text-xs text-muted-foreground">{row.customers?.email}</span></td><td className="p-3"><Link to="/admin/orders/$orderId" params={{ orderId: row.order_id }} className="underline">{row.orders?.order_number}<span className="block text-xs">{row.order_id}</span></Link></td><td className="p-3">{row.redeemed_at ? new Date(row.redeemed_at).toLocaleString("en-IN") : "—"}</td></tr>)}</tbody></table>{!data.history.length && <p className="p-6 text-sm text-muted-foreground">No successful redemptions yet.</p>}</div>
  </>;
}