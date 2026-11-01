import { createFileRoute } from "@tanstack/react-router";
import { PageIntro } from "@/components/layout/PageIntro";
import { ProductCard } from "@/components/shop/ProductCard";
import { sampleProducts } from "@/lib/catalog";

export const Route = createFileRoute("/shop")({
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
  return (
    <>
      <PageIntro eyebrow="The shop" title="All" accent="jewellery">
        Filters, sorting and search arrive with the full catalogue. Pieces shown are samples only.
      </PageIntro>
      <section className="container-lux grid grid-cols-2 gap-x-4 gap-y-10 py-16 md:grid-cols-4 md:gap-x-6">
        {sampleProducts.map((p) => <ProductCard key={p.id} product={p} />)}
      </section>
    </>
  );
}
