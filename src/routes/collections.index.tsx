import { createFileRoute } from "@tanstack/react-router";
import { PageIntro } from "@/components/layout/PageIntro";
import { CollectionCard } from "@/components/shop/CollectionCard";
import { collections } from "@/lib/catalog";

export const Route = createFileRoute("/collections/")({
  head: () => ({
    meta: [
      { title: "The Collections — INDUKA" },
      { name: "description", content: "Chandni, Ardh Chandra, Purnima, Tara, Nakshatra and Chandrika — six moon-inspired silver collections." },
      { property: "og:title", content: "The Collections — INDUKA" },
      { property: "og:description", content: "Six moon-inspired 925 sterling silver collections." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Collections,
});

function Collections() {
  return (
    <>
      <PageIntro eyebrow="The collections" title="Six phases of" accent="moonlight." />
      <section className="container-lux grid gap-4 py-16 sm:grid-cols-2 lg:grid-cols-3">
        {collections.map((c, i) => <CollectionCard key={c.slug} collection={c} index={i} />)}
      </section>
    </>
  );
}
