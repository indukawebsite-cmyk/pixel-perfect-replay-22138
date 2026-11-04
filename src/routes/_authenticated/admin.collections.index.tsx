import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AdminHeader, StatusPill } from "@/components/admin/AdminUi";
import { listCollections } from "@/lib/admin/api";

export const Route = createFileRoute("/_authenticated/admin/collections/")({
  component: CollectionsPage,
});

function CollectionsPage() {
  const q = useQuery({ queryKey: ["admin", "collections"], queryFn: listCollections });
  return (
    <>
      <AdminHeader eyebrow="Catalogue" title="Collections">
        <Button asChild variant="lux"><Link to="/admin/collections/$collectionId" params={{ collectionId: "new" }}><Plus className="h-4 w-4" />Add collection</Link></Button>
      </AdminHeader>
      {q.isLoading ? <p role="status">Loading collections…</p> : q.error ? <p role="alert">Could not load collections.</p> : (
        <div className="overflow-x-auto border border-border">
          <table className="w-full min-w-[560px] text-left text-sm">
            <thead className="bg-card text-[0.65rem] uppercase tracking-[0.14em] text-muted-foreground">
              <tr><th className="p-3">Collection</th><th className="p-3">Subtitle</th><th className="p-3 text-right">Products</th><th className="p-3">Banner</th><th className="p-3">Status</th></tr>
            </thead>
            <tbody className="divide-y divide-border">
              {(q.data ?? []).map((c) => (
                <tr key={c.id}>
                  <td className="p-3"><Link to="/admin/collections/$collectionId" params={{ collectionId: c.id }} className="font-medium hover:underline">{c.name}</Link><span className="block text-xs text-muted-foreground">/{c.slug}</span></td>
                  <td className="p-3">{c.subtitle ?? "—"}</td>
                  <td className="p-3 text-right">{c.products.length}</td>
                  <td className="p-3 text-xs text-muted-foreground">{c.image_url ? "Uploaded" : "Default"}</td>
                  <td className="p-3"><StatusPill active={c.is_active} on="Visible" off="Hidden" /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
