import { supabase } from "@/integrations/supabase/client";
import { signCatalogImages } from "@/lib/catalog-images.functions";
import type { Product } from "@/lib/catalog";

export const PRODUCT_IMAGE_BUCKET = "product-images";
const SIGNED_URL_SECONDS = 60 * 60 * 6;
const URL_CACHE_KEY = "induka-image-urls-v1";
const MIN_REMAINING_MS = 60 * 60 * 1000;

/** Grid-sized copy stored beside each original (SKU/thumbs/NN.jpg); originals stay untouched. */
export const thumbPath = (path: string) => path.replace(/^([^/]+)\/([^/]+)$/, "$1/thumbs/$2");

type UrlCache = { owner: string; urls: Record<string, { url: string; expires: number }> };

// Re-using the same signed URL across page loads lets the browser serve photos from its cache.
function readUrlCache(owner: string): UrlCache["urls"] {
  try {
    const parsed = JSON.parse(sessionStorage.getItem(URL_CACHE_KEY) ?? "null") as UrlCache | null;
    if (!parsed || parsed.owner !== owner) return {};
    const now = Date.now() + MIN_REMAINING_MS;
    return Object.fromEntries(Object.entries(parsed.urls).filter(([, v]) => v.expires > now));
  } catch {
    return {};
  }
}
function writeUrlCache(owner: string, urls: UrlCache["urls"]) {
  try {
    sessionStorage.setItem(URL_CACHE_KEY, JSON.stringify({ owner, urls }));
  } catch {
    /* storage full or unavailable: photos still load, just without reuse */
  }
}

type Row = {
  slug: string;
  sku: string | null;
  name: string;
  category: string;
  price: number;
  compare_at_price: number | null;
  description: string | null;
  tagline: string | null;
  material: string | null;
  purity: string | null;
  highlights: string[];
  length_cm: number | null;
  width_cm: number | null;
  created_at: string;
  gender?: string | null;
  collections: { slug: string } | null;
  product_variants: { stock_quantity: number }[];
  product_images: { image_url: string; alt_text: string; display_order: number }[];
};

export const skuOrder = (sku: string | null) => Number((sku ?? "").replace(/\D/g, "")) || 0;
export const sizeLabel = (length: number | null, width: number | null) =>
  length && width ? `${length} × ${width} cm (L × W)` : undefined;

export function toProduct(row: Row, urls: Map<string, string>): Product {
  const images = [...row.product_images].sort((a, b) => a.display_order - b.display_order);
  const gallery = images.map((image, index) => ({
    src: urls.get(image.image_url) ?? "",
    thumb: urls.get(thumbPath(image.image_url)) ?? urls.get(image.image_url) ?? "",
    label: index === 0 ? "Main view" : `View ${index + 1}`,
    alt: image.alt_text || row.name,
  }));
  return {
    id: row.slug,
    sku: row.sku ?? undefined,
    name: row.name,
    category: row.category,
    collection: row.collections?.slug ?? "",
    image: gallery[0]?.src ?? "",
    thumbnail: gallery[0]?.thumb ?? gallery[0]?.src ?? "",
    gallery,
    price: Number(row.price),
    ...(row.compare_at_price !== null ? { compareAtPrice: Number(row.compare_at_price) } : {}),
    stock: row.product_variants.reduce((sum, variant) => sum + variant.stock_quantity, 0),
    description: row.description ?? undefined,
    tagline: row.tagline ?? undefined,
    // Owner-confirmed specifications render behind the verified marker.
    ...(row.material || row.purity
      ? {
          specifications: {
            verified: true as const,
            ...(row.material ? { material: row.material } : {}),
            ...(row.purity ? { purity: row.purity } : {}),
          },
        }
      : {}),
    highlights: row.highlights,
    size: sizeLabel(row.length_cm, row.width_cm),
    addedOn: row.created_at,
    featuredOrder: skuOrder(row.sku),
    gender: row.gender === "men" || row.gender === "women" || row.gender === "unisex" ? row.gender : undefined,
    isSample: false,
  };
}

export async function fetchCatalog(): Promise<Product[]> {
  const { data, error } = await supabase
    .from("products")
    .select(
      "slug, sku, name, category, price, compare_at_price, description, tagline, material, purity, highlights, length_cm, width_cm, created_at, gender, collections(slug), product_variants(stock_quantity), product_images(image_url, alt_text, display_order)",
    );
  if (error) throw error;
  const rows = (data ?? []) as unknown as Row[];
  const paths = rows.flatMap((row) => row.product_images.flatMap((image) => [image.image_url, thumbPath(image.image_url)]));
  const { data: auth } = await supabase.auth.getSession();
  const owner = auth.session?.user.id ?? "visitor";
  const cached = readUrlCache(owner);
  const missing = paths.filter((path) => !cached[path]);
  if (missing.length) {
    // Signing happens server-side: the bucket has no public read policy, and the
    // server only signs paths that belong to active products or collections.
    const { urls: signed } = await signCatalogImages({ data: { paths: missing } });
    const expires = Date.now() + SIGNED_URL_SECONDS * 1000;
    for (const [path, url] of Object.entries(signed)) {
      cached[path] = { url, expires };
    }
    writeUrlCache(owner, cached);
  }
  const urls = new Map(Object.entries(cached).map(([path, v]) => [path, v.url]));
  return rows.map((row) => toProduct(row, urls)).sort((a, b) => (a.featuredOrder ?? 0) - (b.featuredOrder ?? 0));
}
