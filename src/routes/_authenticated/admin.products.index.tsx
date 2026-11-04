import { useMemo, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { AdminHeader, Confirm, StatusPill, errorMessage, inputClass } from "@/components/admin/AdminUi";
import { CATEGORIES, LOW_STOCK, listCollections, listProducts, setProductActive, stockOf } from "@/lib/admin/api";
import { formatPrice } from "@/lib/catalog";

export const Route = createFileRoute("/_authenticated/admin/products/")({
  component: ProductsPage,
});

function ProductsPage() {
  const qc = useQueryClient();
  const products = useQuery({ queryKey: ["admin", "products"], queryFn: listProducts });
  const collections = useQuery({ queryKey: ["admin", "collections"], queryFn: listCollections });
  const [term, setTerm] = useState("");
  const [category, setCategory] = useState("all");
  const [status, setStatus] = useState("all");
  const [collection, setCollection] = useState("all");
  const toggle = useMutation({
    mutationFn: ({ id, active }: { id: string; active: boolean }) => setProductActive(id, active),
    onSuccess: (_, v) => { toast.success(v.active ? "Product is now live" : "Product hidden from the shop"); void qc.invalidateQueries({ queryKey: ["admin"] }); },
    onError: (e) => toast.error(errorMessage(e)),
  });
  const colName = new Map((collections.data ?? []).map((c) => [c.id, c.name]));
  const rows = useMemo(() => {
    const t = term.trim().toLowerCase();
    return (products.data ?? []).filter((p) =>
      (!t || p.name.toLowerCase().includes(t) || (p.sku ?? "").toLowerCase().includes(t)) &&
      (category === "all" || p.category === category) &&
      (status === "all" || (status === "active") === p.is_active) &&
      (collection === "all" || (collection === "none" ? !p.collection_id : p.collection_id === collection)));
  }, [products.data, term, category, status, collection]);

  return (
    <>
      <AdminHeader eyebrow="Catalogue" title="Products">
        <Button asChild variant="lux"><Link to="/admin/products/$productId" params={{ productId: "new" }}><Plus className="h-4 w-4" />Add product</Link></Button>
      </AdminHeader>
      <div className="mb-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <input aria-label="Search products" placeholder="Search name or SKU" className={inputClass} value={term} onChange={(e) => setTerm(e.target.value)} />
        <select aria-label="Category" className={inputClass} value={category} onChange={(e) => setCategory(e.target.value)}>
          <option value="all">All categories</option>
          {CATEGORIES.map((c) => <option key={c} value={c}>{c[0]!.toUpperCase() + c.slice(1)}</option>)}
        </select>
        <select aria-label="Status" className={inputClass} value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="all">All statuses</option><option value="active">Active</option><option value="inactive">Inactive</option>
        </select>
        <select aria-label="Collection" className={inputClass} value={collection} onChange={(e) => setCollection(e.target.value)}>
          <option value="all">All collections</option><option value="none">No collection</option>
          {(collections.data ?? []).map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
      </div>
      {products.isLoading ? <p role="status">Loading products…</p> : products.error ? <p role="alert">Could not load products.</p> : (
        <div className="overflow-x-auto border border-border">
          <table className="w-full min-w-[760px] text-left text-sm">
            <thead className="bg-card text-[0.65rem] uppercase tracking-[0.14em] text-muted-foreground">
              <tr><th className="p-3">Product</th><th className="p-3">Category</th><th className="p-3">Collection</th><th className="p-3 text-right">Price</th><th className="p-3 text-right">Stock</th><th className="p-3">Status</th><th className="p-3">Live</th></tr>
            </thead>
            <tbody className="divide-y divide-border">
              {rows.map((p) => {
                const stock = stockOf(p);
                return (
                  <tr key={p.id} className="align-middle">
                    <td className="p-3">
                      <Link to="/admin/products/$productId" params={{ productId: p.id }} className="flex items-center gap-3">
                        {p.product_images[0]?.thumb ? <img src={p.product_images[0].thumb} alt="" loading="lazy" className="h-12 w-10 shrink-0 object-cover" /> : <span className="h-12 w-10 shrink-0 bg-muted" />}
                        <span className="min-w-0"><span className="block font-medium hover:underline">{p.name}</span><span className="text-xs text-muted-foreground">{p.sku ?? "No SKU"} · {p.product_images.length} photos</span></span>
                      </Link>
                    </td>
                    <td className="p-3 capitalize">{p.category}</td>
                    <td className="p-3">{p.collection_id ? colName.get(p.collection_id) : <span className="text-muted-foreground">—</span>}</td>
                    <td className="p-3 text-right">{formatPrice(Number(p.price))}</td>
                    <td className={`p-3 text-right ${stock <= LOW_STOCK ? "text-destructive" : ""}`}>{stock}</td>
                    <td className="p-3"><StatusPill active={p.is_active} /></td>
                    <td className="p-3">
                      <Confirm
                        trigger={<Switch checked={p.is_active} aria-label={`${p.is_active ? "Hide" : "Publish"} ${p.name}`} />}
                        title={p.is_active ? "Hide this product?" : "Make this product live?"}
                        description={p.is_active ? `${p.name} will disappear from the shop.` : `${p.name} and its photos will become visible to every visitor.`}
                        action={p.is_active ? "Hide product" : "Make live"}
                        onConfirm={() => toggle.mutate({ id: p.id, active: !p.is_active })}
                      />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {!rows.length && <p className="p-6 text-sm text-muted-foreground">No products match these filters.</p>}
        </div>
      )}
      <p className="mt-3 text-xs text-muted-foreground">{rows.length} of {products.data?.length ?? 0} products</p>
    </>
  );
}
