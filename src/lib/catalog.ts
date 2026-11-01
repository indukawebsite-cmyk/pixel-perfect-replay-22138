// SAMPLE CONTENT — replace with real catalogue data (Supabase in Phase 3).
// Nothing here represents a real, purchasable product. Prices are intentionally null.
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
export type ProductImage = { src: string; label: string; detailCrop?: boolean };
export type VerifiedSpecifications = { verified: true; material?: string; purity?: string; stone?: string; finish?: string; weight?: string; dimensions?: string };
export type Product = {
  id: string;
  name: string;
  category: string;
  collection: string;
  image: string;
  price: number | null; // null until real pricing is supplied
  tag?: "New" | "Bestseller";
  isSample: true;
  demoPrice?: number; // Illustrative INR value, never a real offer.
  secondaryImage?: string; // Only supplied when a genuine second image is available.
  edit?: string; // Demo merchandising label, not a product specification.
  addedOn?: string;
  featuredOrder?: number;
  description?: string;
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

export const collections: Collection[] = [
  { slug: "chandni", name: "Chandni", meaning: "Moonlight", focus: "Everyday studs, chains and minimal rings.", image: necklaces },
  { slug: "ardh-chandra", name: "Ardh Chandra", meaning: "Half moon", focus: "Crescent signature pieces.", image: hero },
  { slug: "purnima", name: "Purnima", meaning: "Full moon", focus: "Statement and festive pieces.", image: editorial },
  { slug: "tara", name: "Tara", meaning: "Star", focus: "Sparkle CZ studs and star motifs.", image: earrings },
  { slug: "nakshatra", name: "Nakshatra", meaning: "Constellation", focus: "Layering sets, charms and zodiac.", image: bracelets },
  { slug: "chandrika", name: "Chandrika", meaning: "Moonbeam", focus: "Bridal and gifting edit.", image: gifting },
];

const img = { earrings, rings, necklaces, bracelets } as const;

export const sampleProducts: Product[] = ([
  ["Sample Crescent Stud", "earrings", "ardh-chandra", "Bestseller"],
  ["Sample Moon Pendant", "necklaces", "chandni", "Bestseller"],
  ["Sample Stacking Band", "rings", "chandni", "Bestseller"],
  ["Sample Star Charm Bracelet", "bracelets", "nakshatra", "Bestseller"],
  ["Sample Tara Stud", "earrings", "tara", "New"],
  ["Sample Layering Chain", "necklaces", "nakshatra", "New"],
  ["Sample Pavé Band", "rings", "tara", "New"],
  ["Sample Fine Chain Bracelet", "bracelets", "chandni", "New"],
] as const).map(([name, category, collection, tag], i) => ({
  id: `sample-${i + 1}`,
  name,
  category,
  collection,
  image: img[category],
  price: null,
  tag,
  isSample: true as const,
}));

export const getCollection = (slug: string) => collections.find((c) => c.slug === slug);

// SHOPPING DEMO ONLY — fictional names and illustrative prices for interaction testing.
// Existing homepage sample rows above remain unchanged. No stock or purity assertions.
export const demoProducts: Product[] = collections.flatMap((collection, collectionIndex) =>
  categories.map((category, categoryIndex) => ({
    id: `demo-${collection.slug}-${category.slug}`,
    name: `Demo ${collection.name} ${category.name}`,
    category: category.slug,
    collection: collection.slug,
    image: category.image,
    price: null,
    demoPrice: ([1200, 1800, 2400, 3200][categoryIndex] ?? 1200) + collectionIndex * 250,
    edit: ["Minimal", "Celestial", "Statement", "Gifting"][(collectionIndex + categoryIndex) % 4] ?? "Minimal",
    addedOn: `2026-10-${String(collectionIndex * 4 + categoryIndex + 1).padStart(2, "0")}`,
    featuredOrder: collectionIndex * 4 + categoryIndex,
    isSample: true as const,
    description: `An illustrative ${collection.name} ${category.name.toLowerCase()} preview from the INDUKA demo catalogue. This image and price are for browsing only, not a real product offer.`,
    gallery: [{ src: category.image, label: "Sample photograph" }, { src: category.image, label: "Detail crop · same sample photograph", detailCrop: true }],
    variants: category.slug === "rings" ? [{ id: "demo-a", label: "Demo option A", isDemo: true }, { id: "demo-b", label: "Demo option B", isDemo: true }] : undefined,
  })),
);

export const browsingProducts = [...sampleProducts, ...demoProducts];
export const getProduct = (id: string) => browsingProducts.find((product) => product.id === id);
export const productPriceLabel = (product: Product) => product.demoPrice === undefined
  ? formatPrice(product.price)
  : `${formatPrice(product.demoPrice)} · Demo price`;
export const formatPrice = (p: number | null) =>
  p === null ? "Price to be announced" : `₹${p.toLocaleString("en-IN")}`;
