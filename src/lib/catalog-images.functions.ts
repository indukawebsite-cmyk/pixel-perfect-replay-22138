// Signs product-image URLs server-side so the storage bucket needs no public
// read policy. Only paths that belong to active products (or active collection
// banners) are ever signed — everything else is refused.
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const BUCKET = "product-images";
const SIGNED_URL_SECONDS = 60 * 60 * 6;

const input = z.object({
  paths: z.array(z.string().min(1).max(300)).max(400),
});

export const signCatalogImages = createServerFn({ method: "POST" })
  .inputValidator((data) => input.parse(data))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    // Exact allow-list: stored image paths of active products, plus their
    // grid-sized thumbnails, plus banner paths of active collections.
    const [{ data: images }, { data: collections }] = await Promise.all([
      supabaseAdmin
        .from("product_images")
        .select("image_url, products!inner(is_active)")
        .eq("products.is_active", true),
      supabaseAdmin.from("collections").select("image_url").eq("is_active", true),
    ]);

    const allowed = new Set<string>();
    for (const row of images ?? []) {
      const path = row.image_url as string;
      allowed.add(path);
      allowed.add(path.replace(/^([^/]+)\/([^/]+)$/, "$1/thumbs/$2"));
    }
    for (const row of collections ?? []) {
      if (row.image_url) allowed.add(row.image_url as string);
    }

    const requested = data.paths.filter((path) => allowed.has(path));
    if (!requested.length) return { urls: {} as Record<string, string> };

    const { data: signed, error } = await supabaseAdmin.storage
      .from(BUCKET)
      .createSignedUrls(requested, SIGNED_URL_SECONDS);
    if (error) throw new Error("Could not prepare product photos right now.");

    const urls: Record<string, string> = {};
    signed?.forEach((item) => {
      if (item.path && item.signedUrl) urls[item.path] = item.signedUrl;
    });
    return { urls };
  });
