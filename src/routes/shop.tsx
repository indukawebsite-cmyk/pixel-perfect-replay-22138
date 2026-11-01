import { createFileRoute, Link } from "@tanstack/react-router";
import { PageIntro } from "@/components/layout/PageIntro";
import { ProductCard } from "@/components/shop/ProductCard";
import { categories } from "@/lib/catalog";
import { searchProducts } from "@/lib/catalog-search";

export const Route = createFileRoute("/shop")({
  validateSearch: (search: Record<string, unknown>): { category: string } => ({ category: typeof search.category === "string" && categories.some((c) => c.slug === search.category) ? search.category : "all" }),
  head: () => ({
    meta: [
      { title: "Shop 925 Sterling Silver Jewellery — INDUKA" },
      { name: "description", content: "Browse INDUKA's moon-inspired sterling silver earrings, rings, necklaces and bracelets." },
      { property: "og:title", content: "Shop — INDUKA" },
      { property: "og:description", content: "Moon-inspired 925 sterling silver jewellery." },
    ],
  }),
  component: Shop,
});

function Shop() {
  const { category } = Route.useSearch();
  const products = searchProducts("", category);
  return (
    <>
      <PageIntro eyebrow="The shop" title="All" accent="jewellery">
        Pieces shown are samples only. Official photography, pricing and availability are coming soon.
      </PageIntro>
      <nav aria-label="Jewellery categories" className="container-lux flex flex-wrap gap-x-6 gap-y-4 pt-10 text-sm">{[{ slug: "all", name: "All jewellery" }, ...categories].map((c) => <Link key={c.slug} to="/shop" search={{ category: c.slug }} className={`py-2 ${category === c.slug ? "border-b border-foreground font-medium" : "text-muted-foreground"}`}>{c.name}</Link>)}</nav>
      <section className="container-lux grid grid-cols-2 gap-x-4 gap-y-10 py-16 md:grid-cols-4 md:gap-x-6">
        {products.map((p) => <ProductCard key={p.id} product={p} />)}
      </section>
    </>
  );
}
