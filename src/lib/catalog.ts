// Static brand structure (categories, collection names, campaign images). Product records are
// loaded from the database — see live-catalog.ts and catalog-source.ts.
import { getCatalog } from "@/lib/live-catalog";
import earrings from "@/assets/cat-earrings.jpg";
import rings from "@/assets/cat-rings.jpg";
import necklaces from "@/assets/cat-necklaces.jpg";
import bracelets from "@/assets/cat-bracelets.jpg";
import editorial from "@/assets/editorial-layering.jpg";
import gifting from "@/assets/gifting-blush.jpg";
import hero from "@/assets/hero-crescent-velvet.jpg";

export type Category = { slug: string; name: string; image: string };
export type Collection = {
  slug: string;
  name: string;
  meaning: string;
  focus: string;
  image: string;
};
export type ProductVariant = { id: string; label: string; isDemo: boolean };
export type ProductImage = { src: string; label: string; alt?: string; detailCrop?: boolean };
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

export const categories: Category[] = [
  { slug: "earrings", name: "Earrings", image: earrings },
  { slug: "rings", name: "Rings", image: rings },
  { slug: "necklaces", name: "Necklaces", image: necklaces },
  { slug: "bracelets", name: "Bracelets", image: bracelets },
];
/** Categories offered in shop filters, including those without homepage tiles. */
export const shopCategories: Category[] = [
  { slug: "pendants", name: "Pendants", image: necklaces },
  ...categories,
];

export const collections: Collection[] = [
  {
    slug: "chandni",
    name: "Chandni",
    meaning: "Moonlight",
    focus: "Everyday studs, chains and minimal rings.",
    image: necklaces,
  },
  {
    slug: "ardh-chand",
    name: "Ardh Chand",
    meaning: "Half moon",
    focus: "Crescent signature pieces.",
    image: hero,
  },
  {
    slug: "purnima",
    name: "Purnima",
    meaning: "Full moon",
    focus: "Statement and festive pieces.",
    image: editorial,
  },
  {
    slug: "tara",
    name: "Tara",
    meaning: "Star",
    focus: "Sparkle CZ studs and star motifs.",
    image: earrings,
  },
  {
    slug: "nakshatra",
    name: "Nakshatra",
    meaning: "Constellation",
    focus: "Layering sets, charms and zodiac.",
    image: bracelets,
  },
  {
    slug: "chandrika",
    name: "Chandrika",
    meaning: "Moonbeam",
    focus: "Bridal and gifting edit.",
    image: gifting,
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
