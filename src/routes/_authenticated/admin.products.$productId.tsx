import { useEffect, useState, type FormEvent } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { ArrowDown, ArrowUp, Star, Trash2, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { AdminHeader, Confirm, Field, StatusPill, areaClass, errorMessage, inputClass } from "@/components/admin/AdminUi";
import {
  CATEGORIES, deleteImage, getProduct, listCollections, reorderImages, saveProduct, slugify, stockOf,
  uploadProductImages, type AdminImage, type ProductInput,
} from "@/lib/admin/api";

export const Route = createFileRoute("/_authenticated/admin/products/$productId")({
  component: ProductEditor,
});

const empty: ProductInput = {
  name: "", slug: "", sku: "", price: 0, compare_at_price: null, category: "pendants", collection_id: null, is_active: false,
  description: "", tagline: "", highlights: [], material: "", purity: "", length_cm: null, width_cm: null,
  meta_title: "", meta_description: "", stock: 0,
};

const num = (v: string) => (v.trim() === "" ? null : Number(v));

function ProductEditor() {
  const { productId } = Route.useParams();
  const isNew = productId === "new";
  const qc = useQueryClient();
  const navigate = useNavigate();
  const product = useQuery({ queryKey: ["admin", "product", productId], queryFn: () => getProduct(productId), enabled: !isNew });
  const collections = useQuery({ queryKey: ["admin", "collections"], queryFn: listCollections });
  const [form, setForm] = useState<ProductInput>(empty);
  const [highlights, setHighlights] = useState("");
  const [images, setImages] = useState<AdminImage[]>([]);

  const [loadedId, setLoadedId] = useState<string | null>(null);
  useEffect(() => {
    const p = product.data;
    if (!p) return;
    setImages(p.product_images);
    // Fill the form once per product so photo refreshes never overwrite unsaved edits.
    if (loadedId === p.id) return;
    const { id: _id, updated_at: _u, product_variants, product_images: _i, ...rest } = p;
    setForm({ ...rest, stock: stockOf({ product_variants }) });
    setHighlights(p.highlights.join("\n"));
    setLoadedId(p.id);
  }, [product.data, loadedId]);

  const set = <K extends keyof ProductInput>(key: K, value: ProductInput[K]) => setForm((f) => ({ ...f, [key]: value }));
  const refresh = () => qc.invalidateQueries({ queryKey: ["admin"] });

  const save = useMutation({
    mutationFn: async () => {
      if (!form.name.trim()) throw new Error("Add a product name.");
      if (!form.sku?.trim()) throw new Error("Add a SKU.");
      if (!(form.price >= 0)) throw new Error("Price must be zero or more.");
      if (!Number.isInteger(form.stock) || form.stock < 0) throw new Error("Stock must be a whole number, zero or more.");
      const input: ProductInput = {
        ...form,
        name: form.name.trim(), sku: form.sku.trim().toUpperCase(), slug: slugify(form.slug || `${form.name}-${form.sku}`),
        highlights: highlights.split("\n").map((h) => h.trim()).filter(Boolean),
        description: form.description || null, tagline: form.tagline || null, material: form.material || null, purity: form.purity || null,
        meta_title: form.meta_title || null, meta_description: form.meta_description || null,
      };
      return saveProduct(isNew ? null : productId, input, product.data?.product_variants[0]?.id);
    },
    onSuccess: (id) => {
      toast.success(isNew ? "Product created (inactive)" : "Product saved");
      void refresh();
      if (isNew) void navigate({ to: "/admin/products/$productId", params: { productId: id } });
    },
    onError: (e) => toast.error(errorMessage(e).includes("duplicate") ? "That SKU or URL name is already used by another product." : errorMessage(e)),
  });

  const upload = useMutation({
    mutationFn: (files: File[]) => uploadProductImages({ id: productId, sku: product.data?.sku ?? null, name: form.name }, files, images.length),
    onSuccess: () => { toast.success("Photos uploaded"); void refresh(); },
    onError: (e) => toast.error(errorMessage(e)),
  });
  const reorder = useMutation({
    mutationFn: (next: AdminImage[]) => reorderImages(next),
    onMutate: (next) => setImages(next),
    onSuccess: () => { toast.success("Photo order saved"); void refresh(); },
    onError: (e) => { toast.error(errorMessage(e)); void refresh(); },
  });
  const remove = useMutation({
    mutationFn: (image: AdminImage) => deleteImage(image, images.filter((i) => i.id !== image.id)),
    onSuccess: () => { toast.success("Photo deleted"); void refresh(); },
    onError: (e) => toast.error(errorMessage(e)),
  });

  const move = (from: number, to: number) => {
    const next = [...images];
    const [item] = next.splice(from, 1);
    next.splice(to, 0, item!);
    reorder.mutate(next);
  };

  if (!isNew && product.isLoading) return <p role="status">Loading product…</p>;
  if (!isNew && !product.data) return <p role="alert">Product not found. <Link to="/admin/products" className="link-lux">Back to products</Link></p>;

  const onSubmit = (e: FormEvent) => { e.preventDefault(); save.mutate(); };
  const skuChanged = !isNew && product.data?.sku !== form.sku;

  return (
    <>
      <AdminHeader eyebrow={isNew ? "New product" : (product.data?.sku ?? "Product")} title={isNew ? "Add product" : form.name || "Product"}>
        <Button asChild variant="luxOutline"><Link to="/admin/products">All products</Link></Button>
      </AdminHeader>
      <form onSubmit={onSubmit} className="grid gap-10 xl:grid-cols-[minmax(0,1fr)_340px]">
        <div className="flex flex-col gap-8">
          <section className="grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2"><Field label="Product name"><input className={inputClass} value={form.name} onChange={(e) => set("name", e.target.value)} required /></Field></div>
            <Field label="SKU" hint={skuChanged ? "Photos are filed under the old SKU; changing it may hide them once live." : undefined}><input className={inputClass} value={form.sku ?? ""} onChange={(e) => set("sku", e.target.value)} required /></Field>
            <Field label="URL name" hint="Letters, numbers and dashes. Left blank, it is made from the name."><input className={inputClass} value={form.slug} onChange={(e) => set("slug", e.target.value)} /></Field>
            <Field label="Price (₹)"><input type="number" min={0} step="1" className={inputClass} value={form.price} onChange={(e) => set("price", Number(e.target.value))} required /></Field>
            <Field label="Compare-at price (₹)" hint="Optional original price."><input type="number" min={0} className={inputClass} value={form.compare_at_price ?? ""} onChange={(e) => set("compare_at_price", num(e.target.value))} /></Field>
            <Field label="Stock"><input type="number" min={0} step="1" className={inputClass} value={form.stock} onChange={(e) => set("stock", Number(e.target.value))} required /></Field>
            <Field label="Category">
              <select className={inputClass} value={form.category} onChange={(e) => set("category", e.target.value)}>
                {CATEGORIES.map((c) => <option key={c} value={c}>{c[0]!.toUpperCase() + c.slice(1)}</option>)}
              </select>
            </Field>
            <Field label="Collection">
              <select className={inputClass} value={form.collection_id ?? ""} onChange={(e) => set("collection_id", e.target.value || null)}>
                <option value="">No collection</option>
                {(collections.data ?? []).map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </Field>
            <Field label="Material" hint="Only if confirmed."><input className={inputClass} value={form.material ?? ""} onChange={(e) => set("material", e.target.value)} /></Field>
            <Field label="Purity" hint="Only if confirmed."><input className={inputClass} value={form.purity ?? ""} onChange={(e) => set("purity", e.target.value)} /></Field>
            <Field label="Length (cm)"><input type="number" min={0} step="0.1" className={inputClass} value={form.length_cm ?? ""} onChange={(e) => set("length_cm", num(e.target.value))} /></Field>
            <Field label="Width (cm)"><input type="number" min={0} step="0.1" className={inputClass} value={form.width_cm ?? ""} onChange={(e) => set("width_cm", num(e.target.value))} /></Field>
          </section>
          <section className="flex flex-col gap-4">
            <Field label="Tagline"><input className={inputClass} value={form.tagline ?? ""} onChange={(e) => set("tagline", e.target.value)} /></Field>
            <Field label="Description"><textarea className={`${areaClass} min-h-40`} value={form.description ?? ""} onChange={(e) => set("description", e.target.value)} /></Field>
            <Field label="Highlights" hint="One per line."><textarea className={areaClass} value={highlights} onChange={(e) => setHighlights(e.target.value)} /></Field>
          </section>
          <section className="flex flex-col gap-4 border-t border-border pt-6">
            <h2 className="text-2xl">Search listing</h2>
            <Field label="SEO title" hint={`${(form.meta_title ?? "").length}/60 characters`}><input className={inputClass} value={form.meta_title ?? ""} onChange={(e) => set("meta_title", e.target.value)} /></Field>
            <Field label="Meta description" hint={`${(form.meta_description ?? "").length}/160 characters`}><textarea className={areaClass} value={form.meta_description ?? ""} onChange={(e) => set("meta_description", e.target.value)} /></Field>
          </section>
        </div>

        <aside className="flex flex-col gap-6">
          <div className="flex flex-col gap-4 border border-border bg-card p-5">
            <div className="flex items-center justify-between"><span className="text-sm font-medium">Visibility</span><StatusPill active={form.is_active} /></div>
            <label className="flex items-center justify-between gap-3 text-sm">
              Show in shop
              <Switch checked={form.is_active} onCheckedChange={(v) => set("is_active", v)} aria-label="Show in shop" />
            </label>
            {form.is_active && !product.data?.is_active && <p className="text-xs text-destructive">Saving will make this product and its photos visible to every visitor.</p>}
            <Button type="submit" variant="lux" disabled={save.isPending}>{save.isPending ? "Saving…" : isNew ? "Create product" : "Save changes"}</Button>
          </div>

          <div className="flex flex-col gap-4 border border-border p-5">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Photos</span>
              <span className="text-xs text-muted-foreground">{images.length}</span>
            </div>
            {isNew ? <p className="text-xs text-muted-foreground">Create the product first, then add photos.</p> : (
              <>
                <ol className="flex flex-col gap-2">
                  {images.map((img, i) => (
                    <li key={img.id} className="flex items-center gap-3 border border-border p-2">
                      {img.thumb ? <img src={img.thumb} alt={img.alt_text} loading="lazy" className="h-16 w-14 shrink-0 object-cover" /> : <span className="h-16 w-14 shrink-0 bg-muted" />}
                      <div className="min-w-0 flex-1 text-xs">
                        {i === 0 ? <span className="eyebrow text-[0.55rem] text-champagne">Main image</span> : <span className="text-muted-foreground">Photo {i + 1}</span>}
                      </div>
                      <div className="flex gap-0.5">
                        {i > 0 && <Button type="button" size="icon" variant="ghost" aria-label="Set as main image" onClick={() => move(i, 0)}><Star className="h-4 w-4" /></Button>}
                        <Button type="button" size="icon" variant="ghost" aria-label="Move up" disabled={i === 0} onClick={() => move(i, i - 1)}><ArrowUp className="h-4 w-4" /></Button>
                        <Button type="button" size="icon" variant="ghost" aria-label="Move down" disabled={i === images.length - 1} onClick={() => move(i, i + 1)}><ArrowDown className="h-4 w-4" /></Button>
                        <Confirm
                          trigger={<Button type="button" size="icon" variant="ghost" aria-label="Delete photo"><Trash2 className="h-4 w-4" /></Button>}
                          title="Delete this photo?" description="The photo is removed from this product and from storage. This can't be undone."
                          action="Delete photo" onConfirm={() => remove.mutate(img)}
                        />
                      </div>
                    </li>
                  ))}
                </ol>
                <label className="flex cursor-pointer items-center justify-center gap-2 border border-dashed border-input p-4 text-sm hover:bg-muted">
                  <Upload className="h-4 w-4" />{upload.isPending ? "Uploading…" : "Upload photos"}
                  <input type="file" accept="image/*" multiple className="sr-only" disabled={upload.isPending}
                    onChange={(e) => { const files = [...(e.target.files ?? [])]; e.target.value = ""; if (files.length) upload.mutate(files); }} />
                </label>
              </>
            )}
          </div>
        </aside>
      </form>
    </>
  );
}
