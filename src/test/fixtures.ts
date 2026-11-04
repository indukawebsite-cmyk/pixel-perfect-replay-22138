// TEST FIXTURES ONLY — never rendered by the app. Shaped like database rows so the
// same mapping the storefront uses (toProduct) is exercised.
import { toProduct } from "@/lib/catalog-source";
import { setCatalog } from "@/lib/live-catalog";

const row = (slug: string, sku: string, category: string, collection: string, price: number, stock: number, images: number) => ({
  slug, sku, name: `Fixture ${sku}`, category, price, description: `Fixture description ${sku}`, tagline: null,
  highlights: ["Fixture highlight"], length_cm: 2, width_cm: 1, created_at: `2026-11-0${images}T00:00:00Z`,
  collections: { slug: collection }, product_variants: [{ stock_quantity: stock }],
  product_images: Array.from({ length: images }, (_, i) => ({ image_url: `${sku}/${String(i + 1).padStart(2, "0")}.jpg`, alt_text: "", display_order: images - 1 - i })),
});
export const fixtureRows = [
  row("fx-pendant-a", "BR001", "pendants", "nakshatra", 5899, 2, 3),
  row("fx-pendant-b", "BR004", "pendants", "chandni", 10999, 1, 1),
  row("fx-earring-a", "BR0015", "earrings", "chandni", 2099, 1, 2),
  row("fx-earring-b", "BR0013", "earrings", "chandrika", 1899, 0, 4),
];
const urls = new Map(fixtureRows.flatMap((r) => r.product_images.map((i) => [i.image_url, `https://signed.test/${i.image_url}`] as [string, string])));
export const fixtureProducts = fixtureRows.map((r) => toProduct(r, urls)).sort((a, b) => (a.featuredOrder ?? 0) - (b.featuredOrder ?? 0));
export function loadFixtures() { setCatalog({ status: "ready", products: fixtureProducts }); }
