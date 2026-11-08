import { authHead } from "@/components/auth/AuthShell";
import { useEffect, useMemo, useState, type FormEvent } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { AdminHeader, Confirm, Field, areaClass, errorMessage, inputClass } from "@/components/admin/AdminUi";
import {
  deleteCollection, listCollections, listProducts, saveCollection, setCollectionProducts, signedUrl, slugify,
  uploadCollectionBanner, type CollectionInput,
} from "@/lib/admin/api";
import { getCollection } from "@/lib/catalog";

export const Route = createFileRoute("/_authenticated/admin/collections/$collectionId")({
  staticData: { sitemap: false },
  head: () => authHead("Edit collection", "Edit collection for House of Induka administrators."),
  component: CollectionEditor,
});

const empty: CollectionInput = { name: "", slug: "", subtitle: "", description: "", is_active: false };

function CollectionEditor() {
  const { collectionId } = Route.useParams();
  const isNew = collectionId === "new";
  const qc = useQueryClient();
  const navigate = useNavigate();
  const collections = useQuery({ queryKey: ["admin", "collections"], queryFn: listCollections });
  const products = useQuery({ queryKey: ["admin", "products"], queryFn: listProducts });
  const current = collections.data?.find((c) => c.id === collectionId);
  const banner = useQuery({ queryKey: ["admin", "banner", current?.image_url], queryFn: () => signedUrl(current?.image_url ?? null), enabled: Boolean(current?.image_url) });
  const [form, setForm] = useState<CollectionInput>(empty);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [term, setTerm] = useState("");

  const [loadedId, setLoadedId] = useState<string | null>(null);
  useEffect(() => {
    if (!current || loadedId === current.id) return;
    setLoadedId(current.id);
    setForm({ name: current.name, slug: current.slug, subtitle: current.subtitle ?? "", description: current.description ?? "", is_active: current.is_active });
  }, [current, loadedId]);
  useEffect(() => {
    if (products.data && !isNew) setSelected(new Set(products.data.filter((p) => p.collection_id === collectionId).map((p) => p.id)));
  }, [products.data, collectionId, isNew]);

  const refresh = () => qc.invalidateQueries({ queryKey: ["admin"] });
  const set = <K extends keyof CollectionInput>(k: K, v: CollectionInput[K]) => setForm((f) => ({ ...f, [k]: v }));

  const save = useMutation({
    mutationFn: async () => {
      if (!form.name.trim()) throw new Error("Add a collection name.");
      const id = await saveCollection(isNew ? null : collectionId, {
        ...form, name: form.name.trim(), slug: slugify(form.slug || form.name), subtitle: form.subtitle || null, description: form.description || null,
      });
      if (!isNew && products.data) {
        const before = new Set(products.data.filter((p) => p.collection_id === collectionId).map((p) => p.id));
        await setCollectionProducts(id, [...selected].filter((p) => !before.has(p)), [...before].filter((p) => !selected.has(p)));
      }
      return id;
    },
    onSuccess: (id) => {
      toast.success(isNew ? "Collection created (hidden)" : "Collection saved");
      void refresh();
      if (isNew) void navigate({ to: "/admin/collections/$collectionId", params: { collectionId: id } });
    },
    onError: (e) => toast.error(errorMessage(e).includes("duplicate") ? "That URL name is already used by another collection." : errorMessage(e)),
  });
  const upload = useMutation({
    mutationFn: (file: File) => uploadCollectionBanner({ id: collectionId, slug: current!.slug }, file),
    onSuccess: () => { toast.success("Banner updated"); void refresh(); },
    onError: (e) => toast.error(errorMessage(e)),
  });
  const remove = useMutation({
    mutationFn: () => deleteCollection(collectionId),
    onSuccess: () => { toast.success("Collection deleted — its products are kept, now without a collection"); void refresh(); void navigate({ to: "/admin/collections" }); },
    onError: (e) => toast.error(errorMessage(e)),
  });

  const visible = useMemo(() => {
    const t = term.trim().toLowerCase();
    return (products.data ?? []).filter((p) => !t || p.name.toLowerCase().includes(t) || (p.sku ?? "").toLowerCase().includes(t));
  }, [products.data, term]);
  const colName = new Map((collections.data ?? []).map((c) => [c.id, c.name]));

  if (collections.isLoading) return <p role="status">Loading collection…</p>;
  if (!isNew && !current) return <p role="alert">Collection not found. <Link to="/admin/collections" className="link-lux">Back to collections</Link></p>;
  const fallbackBanner = current ? getCollection(current.slug)?.image : undefined;
  const onSubmit = (e: FormEvent) => { e.preventDefault(); save.mutate(); };

  return (
    <>
      <AdminHeader eyebrow={isNew ? "New collection" : "Collection"} title={isNew ? "Add collection" : form.name}>
        <Button asChild variant="luxOutline"><Link to="/admin/collections">All collections</Link></Button>
      </AdminHeader>
      <form onSubmit={onSubmit} className="grid gap-10 xl:grid-cols-[minmax(0,1fr)_340px]">
        <div className="flex flex-col gap-8">
          <section className="grid gap-4 sm:grid-cols-2">
            <Field label="Name"><input className={inputClass} value={form.name} onChange={(e) => set("name", e.target.value)} required /></Field>
            <Field label="URL name" hint={!isNew ? "Changing this changes the collection's web address." : "Left blank, it is made from the name."}><input className={inputClass} value={form.slug} onChange={(e) => set("slug", e.target.value)} /></Field>
            <div className="sm:col-span-2"><Field label="Subtitle"><input className={inputClass} value={form.subtitle ?? ""} onChange={(e) => set("subtitle", e.target.value)} /></Field></div>
            <div className="sm:col-span-2"><Field label="Description"><textarea className={areaClass} value={form.description ?? ""} onChange={(e) => set("description", e.target.value)} /></Field></div>
          </section>
          {!isNew && (
            <section className="flex flex-col gap-4 border-t border-border pt-6">
              <div className="flex flex-wrap items-end justify-between gap-3">
                <h2 className="text-2xl">Products <span className="text-base text-muted-foreground">({selected.size} selected)</span></h2>
                <input aria-label="Search products" placeholder="Search name or SKU" className={`${inputClass} sm:w-64`} value={term} onChange={(e) => setTerm(e.target.value)} />
              </div>
              <ul className="max-h-[480px] divide-y divide-border overflow-y-auto border border-border">
                {visible.map((p) => {
                  const elsewhere = p.collection_id && p.collection_id !== collectionId ? colName.get(p.collection_id) : null;
                  return (
                    <li key={p.id}>
                      <label className="flex cursor-pointer items-center gap-3 p-3 text-sm hover:bg-muted">
                        <input type="checkbox" className="h-4 w-4 accent-primary" checked={selected.has(p.id)}
                          onChange={(e) => setSelected((s) => { const n = new Set(s); if (e.target.checked) n.add(p.id); else n.delete(p.id); return n; })} />
                        <span className="min-w-0 flex-1 truncate">{p.sku} · {p.name}</span>
                        {elsewhere && <span className="text-xs text-muted-foreground">{selected.has(p.id) ? `moves from ${elsewhere}` : `in ${elsewhere}`}</span>}
                      </label>
                    </li>
                  );
                })}
              </ul>
            </section>
          )}
        </div>
        <aside className="flex flex-col gap-6">
          <div className="flex flex-col gap-4 border border-border bg-card p-5">
            <label className="flex items-center justify-between gap-3 text-sm">
              Visible in shop
              <Switch checked={form.is_active} onCheckedChange={(v) => set("is_active", v)} aria-label="Visible in shop" />
            </label>
            {form.is_active && !current?.is_active && <p className="text-xs text-destructive">Saving will make this collection visible to every visitor.</p>}
            <Button type="submit" variant="lux" disabled={save.isPending}>{save.isPending ? "Saving…" : isNew ? "Create collection" : "Save changes"}</Button>
          </div>
          {!isNew && (
            <div className="flex flex-col gap-3 border border-border p-5">
              <span className="text-sm font-medium">Banner</span>
              {(banner.data ?? fallbackBanner) ? <img src={banner.data ?? fallbackBanner} alt={`${form.name} banner`} className="aspect-[3/2] w-full object-cover" /> : <div className="aspect-[3/2] bg-muted" />}
              <p className="text-xs text-muted-foreground">{current?.image_url ? "Uploaded banner (private until the collection is visible)." : "Showing the site's built-in banner."}</p>
              <label className="flex cursor-pointer items-center justify-center gap-2 border border-dashed border-input p-3 text-sm hover:bg-muted">
                <Upload className="h-4 w-4" />{upload.isPending ? "Uploading…" : "Upload new banner"}
                <input type="file" accept="image/*" className="sr-only" disabled={upload.isPending}
                  onChange={(e) => { const f = e.target.files?.[0]; e.target.value = ""; if (f) upload.mutate(f); }} />
              </label>
            </div>
          )}
          {!isNew && (
            <Confirm
              trigger={<Button type="button" variant="ghost" className="text-destructive">Delete collection</Button>}
              title={`Delete ${form.name}?`}
              description="The collection is removed. Its products stay in the catalogue without a collection. This can't be undone."
              action="Delete collection"
              onConfirm={() => remove.mutate()}
            />
          )}
        </aside>
      </form>
    </>
  );
}
