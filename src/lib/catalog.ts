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
export type Product = {
  id: string;
  name: string;
  category: string;
  collection: string;
  image: string;
  price: number | null; // null until real pricing is supplied
  tag?: "New" | "Bestseller";
  isSample: true;
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

const img: Record<string, string> = { earrings, rings, necklaces, bracelets };

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
export const formatPrice = (p: number | null) =>
  p === null ? "Price to be announced" : `₹${p.toLocaleString("en-IN")}`;
