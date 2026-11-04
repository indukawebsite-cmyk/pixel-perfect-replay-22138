// Admin data access. Runs in the browser as the signed-in admin; every read and write is
// enforced by database and storage access rules (has_role admin), not by this code.
import { supabase } from "@/integrations/supabase/client";
import { PRODUCT_IMAGE_BUCKET, thumbPath } from "@/lib/catalog-source";

export const LOW_STOCK = 1;
export const CATEGORIES = ["pendants", "earrings", "rings", "necklaces", "bracelets"] as const;

export type AdminImage = { id: string; image_url: string; alt_text: string; display_order: number; url?: string | undefined; thumb?: string | undefined };
export type AdminProduct = {
  id: string; name: string; slug: string; sku: string | null; price: number; compare_at_price: number | null;
  category: string; collection_id: string | null; is_active: boolean; description: string | null; tagline: string | null;
  highlights: string[]; material: string | null; purity: string | null; length_cm: number | null; width_cm: number | null;
  meta_title: string | null; meta_description: string | null; updated_at: string;
  product_variants: { id: string; stock_quantity: number }[];
  product_images: AdminImage[];
};
export type AdminCollection = {
  id: string; name: string; slug: string; subtitle: string | null; description: string | null; image_url: string | null;
  is_active: boolean; products: { id: string }[];
};

export const slugify = (value: string) =>
  value.toLowerCase().normalize("NFKD").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
export const stockOf = (p: { product_variants: { stock_quantity: number }[] }) =>
  p.product_variants.reduce((sum, v) => sum + v.stock_quantity, 0);

async function sign(paths: string[]) {
  const map = new Map<string, string>();
  if (!paths.length) return map;
  const { data } = await supabase.storage.from(PRODUCT_IMAGE_BUCKET).createSignedUrls(paths, 60 * 60);
  data?.forEach((d) => { if (d.path && d.signedUrl) map.set(d.path, d.signedUrl); });
  return map;
}

const PRODUCT_SELECT =
  "id, name, slug, sku, price, compare_at_price, category, collection_id, is_active, description, tagline, highlights, material, purity, length_cm, width_cm, meta_title, meta_description, updated_at, product_variants(id, stock_quantity), product_images(id, image_url, alt_text, display_order)";

export async function listProducts(): Promise<AdminProduct[]> {
  const { data, error } = await supabase.from("products").select(PRODUCT_SELECT).order("sku");
  if (error) throw error;
  const rows = (data ?? []) as unknown as AdminProduct[];
  const primaries = rows.map((r) => [...r.product_images].sort((a, b) => a.display_order - b.display_order)[0]).filter(Boolean) as AdminImage[];
  const urls = await sign(primaries.map((i) => thumbPath(i.image_url)));
  rows.forEach((r) => {
    r.product_images.sort((a, b) => a.display_order - b.display_order);
    const first = r.product_images[0];
    if (first) first.thumb = urls.get(thumbPath(first.image_url));
  });
  return rows;
}

export async function getProduct(id: string): Promise<AdminProduct | null> {
  const { data, error } = await supabase.from("products").select(PRODUCT_SELECT).eq("id", id).maybeSingle();
  if (error) throw error;
  if (!data) return null;
  const row = data as unknown as AdminProduct;
  row.product_images.sort((a, b) => a.display_order - b.display_order);
  const urls = await sign(row.product_images.flatMap((i) => [i.image_url, thumbPath(i.image_url)]));
  row.product_images.forEach((i) => { i.url = urls.get(i.image_url); i.thumb = urls.get(thumbPath(i.image_url)) ?? i.url; });
  return row;
}

export type ProductInput = Omit<AdminProduct, "id" | "updated_at" | "product_variants" | "product_images"> & { stock: number };

export async function saveProduct(id: string | null, input: ProductInput, variantId?: string) {
  const { stock, ...fields } = input;
  let productId = id;
  if (productId) {
    const { error } = await supabase.from("products").update(fields).eq("id", productId);
    if (error) throw error;
  } else {
    const { data, error } = await supabase.from("products").insert(fields).select("id").single();
    if (error) throw error;
    productId = data.id;
  }
  if (variantId) {
    const { error } = await supabase.from("product_variants").update({ stock_quantity: stock }).eq("id", variantId);
    if (error) throw error;
  } else {
    const { error } = await supabase.from("product_variants").insert({ product_id: productId, stock_quantity: stock, sku: fields.sku });
    if (error) throw error;
  }
  return productId;
}

export async function setProductActive(id: string, isActive: boolean) {
  const { error } = await supabase.from("products").update({ is_active: isActive }).eq("id", id);
  if (error) throw error;
}

/** Shrinks a photo in the browser; used for the grid-sized copy stored beside each original. */
async function resize(file: File, max: number, quality: number): Promise<Blob> {
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, max / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  canvas.getContext("2d")!.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  return new Promise((resolve, reject) => canvas.toBlob((b) => (b ? resolve(b) : reject(new Error("Could not read image"))), "image/jpeg", quality));
}

export async function uploadProductImages(product: { id: string; sku: string | null; name: string }, files: File[], startOrder: number) {
  if (!product.sku) throw new Error("Add a SKU before uploading photos — photos are filed by SKU.");
  const bucket = supabase.storage.from(PRODUCT_IMAGE_BUCKET);
  for (const [index, file] of files.entries()) {
    if (!file.type.startsWith("image/")) throw new Error(`${file.name} is not an image.`);
    const path = `${product.sku}/${Date.now()}-${index}.jpg`;
    const full = await resize(file, 2000, 0.88);
    const thumb = await resize(file, 800, 0.8);
    const up = await bucket.upload(path, full, { contentType: "image/jpeg", cacheControl: "31536000" });
    if (up.error) throw up.error;
    const upThumb = await bucket.upload(thumbPath(path), thumb, { contentType: "image/jpeg", cacheControl: "31536000" });
    if (upThumb.error) throw upThumb.error;
    const { error } = await supabase.from("product_images").insert({
      product_id: product.id, image_url: path, alt_text: product.name, display_order: startOrder + index,
    });
    if (error) throw error;
  }
}

/** Saves a new photo order; position 0 is the main image. */
export async function reorderImages(images: AdminImage[]) {
  for (const [index, image] of images.entries()) {
    const { error } = await supabase.from("product_images").update({ display_order: index }).eq("id", image.id);
    if (error) throw error;
  }
}

export async function deleteImage(image: AdminImage, remaining: AdminImage[]) {
  const { error } = await supabase.from("product_images").delete().eq("id", image.id);
  if (error) throw error;
  await supabase.storage.from(PRODUCT_IMAGE_BUCKET).remove([image.image_url, thumbPath(image.image_url)]);
  await reorderImages(remaining);
}

export async function listCollections(): Promise<AdminCollection[]> {
  const { data, error } = await supabase
    .from("collections")
    .select("id, name, slug, subtitle, description, image_url, is_active, products(id)")
    .order("created_at");
  if (error) throw error;
  return (data ?? []) as unknown as AdminCollection[];
}

export async function signedUrl(path: string | null) {
  if (!path) return undefined;
  return (await sign([path])).get(path);
}

export type CollectionInput = Pick<AdminCollection, "name" | "slug" | "subtitle" | "description" | "is_active">;

export async function saveCollection(id: string | null, input: CollectionInput) {
  if (id) {
    const { error } = await supabase.from("collections").update(input).eq("id", id);
    if (error) throw error;
    return id;
  }
  const { data, error } = await supabase.from("collections").insert(input).select("id").single();
  if (error) throw error;
  return data.id;
}

export async function uploadCollectionBanner(collection: { id: string; slug: string }, file: File) {
  const path = `collections/${collection.slug}/${Date.now()}.jpg`;
  const blob = await resize(file, 2000, 0.85);
  const up = await supabase.storage.from(PRODUCT_IMAGE_BUCKET).upload(path, blob, { contentType: "image/jpeg", cacheControl: "31536000" });
  if (up.error) throw up.error;
  const { error } = await supabase.from("collections").update({ image_url: path }).eq("id", collection.id);
  if (error) throw error;
}

/** Moves products into or out of a collection (out = no collection). */
export async function setCollectionProducts(collectionId: string, add: string[], remove: string[]) {
  if (add.length) {
    const { error } = await supabase.from("products").update({ collection_id: collectionId }).in("id", add);
    if (error) throw error;
  }
  if (remove.length) {
    const { error } = await supabase.from("products").update({ collection_id: null }).in("id", remove).eq("collection_id", collectionId);
    if (error) throw error;
  }
}

/** Products stay in the catalogue; they are only unassigned before the collection is removed. */
export async function deleteCollection(id: string) {
  const { error: unassign } = await supabase.from("products").update({ collection_id: null }).eq("collection_id", id);
  if (unassign) throw unassign;
  const { error } = await supabase.from("collections").delete().eq("id", id);
  if (error) throw error;
}

export async function listOrders() {
  const { data, error } = await supabase
    .from("orders")
    .select("id, order_number, status, total, created_at, shipping_name, customers(email, full_name), payments(status), shipments(status)")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function getOrder(id: string) {
  const { data, error } = await supabase
    .from("orders")
    .select("*, customers(email, full_name, phone), order_items(*), payments(*), shipments(*)")
    .eq("id", id)
    .maybeSingle();
  if (error) throw error;
  return data;
}

export async function overview() {
  const [products, collections, orders] = await Promise.all([
    supabase.from("products").select("id, name, sku, is_active, product_variants(stock_quantity)"),
    supabase.from("collections").select("id", { count: "exact", head: true }),
    supabase.from("orders").select("status, total"),
  ]);
  if (products.error) throw products.error;
  if (orders.error) throw orders.error;
  const list = (products.data ?? []) as unknown as { id: string; name: string; sku: string | null; is_active: boolean; product_variants: { stock_quantity: number }[] }[];
  const paid = (orders.data ?? []).filter((o) => !["pending", "cancelled", "refunded"].includes(o.status));
  return {
    products: list.length,
    active: list.filter((p) => p.is_active).length,
    collections: collections.count ?? 0,
    orders: orders.data?.length ?? 0,
    pending: (orders.data ?? []).filter((o) => o.status === "pending").length,
    revenue: paid.reduce((sum, o) => sum + Number(o.total), 0),
    lowStock: list.filter((p) => stockOf(p) <= LOW_STOCK).map((p) => ({ id: p.id, name: p.name, sku: p.sku, stock: stockOf(p) })),
  };
}
