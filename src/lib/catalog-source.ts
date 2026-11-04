import { supabase } from "@/integrations/supabase/client";
import type { Product } from "@/lib/catalog";

export const PRODUCT_IMAGE_BUCKET = "product-images";
const SIGNED_URL_SECONDS = 60 * 60 * 6;

type Row = {
  slug: string;
  sku: string | null;
  name: string;
  category: string;
  price: number;
  description: string | null;
  tagline: string | null;
  highlights: string[];
  length_cm: number | null;
  width_cm: number | null;
  created_at: string;
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
    gallery,
    price: Number(row.price),
    stock: row.product_variants.reduce((sum, variant) => sum + variant.stock_quantity, 0),
    description: row.description ?? undefined,
    tagline: row.tagline ?? undefined,
    highlights: row.highlights,
    size: sizeLabel(row.length_cm, row.width_cm),
    addedOn: row.created_at,
    featuredOrder: skuOrder(row.sku),
    isSample: false,
  };
}

export async function fetchCatalog(): Promise<Product[]> {
  const { data, error } = await supabase
    .from("products")
    .select(
      "slug, sku, name, category, price, description, tagline, highlights, length_cm, width_cm, created_at, collections(slug), product_variants(stock_quantity), product_images(image_url, alt_text, display_order)",
    );
  if (error) throw error;
  const rows = (data ?? []) as unknown as Row[];
  const paths = rows.flatMap((row) => row.product_images.map((image) => image.image_url));
  const urls = new Map<string, string>();
  if (paths.length) {
    const { data: signed, error: signError } = await supabase.storage
      .from(PRODUCT_IMAGE_BUCKET)
      .createSignedUrls(paths, SIGNED_URL_SECONDS);
    if (signError) throw signError;
    signed?.forEach((item) => {
      if (item.path && item.signedUrl) urls.set(item.path, item.signedUrl);
    });
  }
  return rows.map((row) => toProduct(row, urls)).sort((a, b) => (a.featuredOrder ?? 0) - (b.featuredOrder ?? 0));
}
