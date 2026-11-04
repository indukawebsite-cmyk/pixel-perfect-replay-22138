import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { AdminHeader } from "@/components/admin/AdminUi";
import { LOW_STOCK, overview } from "@/lib/admin/api";
import { formatPrice } from "@/lib/catalog";

export const Route = createFileRoute("/_authenticated/admin/")({
  component: Overview,
});

function Overview() {
  const q = useQuery({ queryKey: ["admin", "overview"], queryFn: overview });
  if (q.isLoading) return <p role="status">Loading overview…</p>;
  if (q.error || !q.data) return <p role="alert">Could not load the overview.</p>;
  const d = q.data;
  const stats = [
    { label: "Total products", value: d.products },
    { label: "Active / inactive", value: `${d.active} / ${d.products - d.active}` },
    { label: "Collections", value: d.collections },
    { label: "Orders", value: d.orders },
    { label: "Pending orders", value: d.pending },
    { label: "Revenue", value: formatPrice(d.revenue) },
  ];
  return (
    <>
      <AdminHeader eyebrow="Overview" title="Store at a glance" />
      <div className="grid grid-cols-2 gap-px bg-border lg:grid-cols-3">
        {stats.map((s) => (
          <div key={s.label} className="bg-card p-6">
            <p className="eyebrow text-[0.6rem] text-muted-foreground">{s.label}</p>
            <p className="mt-3 font-display text-3xl">{s.value}</p>
          </div>
        ))}
      </div>
      {d.orders === 0 && <p className="mt-4 text-xs text-muted-foreground">Checkout isn't live yet, so there are no orders or revenue.</p>}
      <section className="mt-12">
        <h2 className="text-2xl">Low stock <span className="text-base text-muted-foreground">({LOW_STOCK} or fewer)</span></h2>
        {d.lowStock.length === 0 ? (
          <p className="mt-3 text-sm text-muted-foreground">Every product is above the low-stock level.</p>
        ) : (
          <ul className="mt-4 divide-y divide-border border-y border-border">
            {d.lowStock.map((p) => (
              <li key={p.id} className="flex items-center justify-between gap-4 py-3 text-sm">
                <Link to="/admin/products/$productId" params={{ productId: p.id }} className="link-lux min-w-0 truncate">{p.sku} · {p.name}</Link>
                <span className={p.stock === 0 ? "text-destructive" : "text-muted-foreground"}>{p.stock} left</span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </>
  );
}
