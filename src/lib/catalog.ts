// Static brand structure (categories, collection names, campaign images). Product records are
// loaded from the database — see live-catalog.ts and catalog-source.ts.
import { getCatalog } from "@/lib/live-catalog";
// Campaign imagery is cut from real INDUKA product photography (see src/assets/real).
import earrings from "@/assets/real/cat-earrings.jpg";
import pendants from "@/assets/real/cat-pendants.jpg";
import chandni from "@/assets/real/col-chandni.jpg";
import ardhChand from "@/assets/real/col-ardh-chand.jpg";
import purnima from "@/assets/real/col-purnima.jpg";
import tara from "@/assets/real/col-tara.jpg";
import nakshatra from "@/assets/real/col-nakshatra.jpg";
import chandrika from "@/assets/real/col-chandrika.jpg";

export type Category = { slug: string; name: string; image: string };
export type Collection = {
  slug: string;
  name: string;
  meaning: string;
  focus: string;
  image: string;
};
export type ProductVariant = { id: string; label: string; isDemo: boolean };
export type ProductImage = { src: string; thumb?: string; label: string; alt?: string; detailCrop?: boolean };
export type VerifiedSpecifications = {
  verified: true;
  material?: string;
  purity?: string;
  stone?: string;
  finish?: string;
  weight?: string;
  dimensions?: string;
};
export type Product = {
  id: string;
  name: string;
  category: string;
  collection: string;
  image: string;
  /** Lighter grid-sized copy of the primary photo; falls back to `image`. */
  thumbnail?: string;
  price: number | null;
  sku?: string | undefined;
  stock?: number;
  tagline?: string | undefined;
  highlights?: string[];
  size?: string | undefined;
  tag?: "New" | "Bestseller";
  isSample: boolean;
  secondaryImage?: string; // Only supplied when a genuine second image is available.
  edit?: string; // Demo merchandising label, not a product specification.
  addedOn?: string;
  featuredOrder?: number;
  description?: string | undefined;
  gallery?: ProductImage[];
  variants?: ProductVariant[] | undefined;
  specifications?: VerifiedSpecifications;
};

/** Homepage tiles: only categories that have real INDUKA pieces and photography. */
export const categories: Category[] = [
  { slug: "pendants", name: "Pendants", image: pendants },
  { slug: "earrings", name: "Earrings", image: earrings },
];
/** Categories offered in shop filters, including those without homepage tiles yet. */
export const shopCategories: Category[] = [
  ...categories,
  { slug: "rings", name: "Rings", image: "" },
  { slug: "necklaces", name: "Necklaces", image: "" },
  { slug: "bracelets", name: "Bracelets", image: "" },
];

export const collections: Collection[] = [
  {
    slug: "chandni",
    name: "Chandni",
    meaning: "The Moonlight Collection",
    focus: "Everyday studs, chains and minimal rings.",
    image: chandni,
  },
  {
    slug: "ardh-chand",
    name: "Ardh Chand",
    meaning: "The Crescent Collection",
    focus: "Crescent signature pieces.",
    image: ardhChand,
  },
  {
    slug: "purnima",
    name: "Purnima",
    meaning: "The Full Moon Collection",
    focus: "Statement and festive pieces.",
    image: purnima,
  },
  {
    slug: "tara",
    name: "Tara",
    meaning: "The Starlight Collection",
    focus: "Sparkle CZ studs and star motifs.",
    image: tara,
  },
  {
    slug: "nakshatra",
    name: "Nakshatra",
    meaning: "The Constellation Collection",
    focus: "Layering sets, charms and zodiac.",
    image: nakshatra,
  },
  {
    slug: "chandrika",
    name: "Chandrika",
    meaning: "The Lunar Radiance Collection",
    focus: "Bridal and gifting edit.",
    image: chandrika,
  },
];

export const getCollection = (slug: string) => collections.find((c) => c.slug === slug);

// Live catalogue: products come from Lovable Cloud via the CatalogProvider store.
export const allProducts = () => getCatalog().products;
export const getProduct = (id: string) => allProducts().find((product) => product.id === id);
export const productPriceLabel = (product: Product) => formatPrice(product.price);
export const availabilityLabel = (product: Product) =>
  product.stock === undefined ? "" : product.stock > 0 ? "In stock" : "Currently unavailable";
export const formatPrice = (p: number | null) =>
  p === null ? "Price to be announced" : `₹${p.toLocaleString("en-IN")}`;
