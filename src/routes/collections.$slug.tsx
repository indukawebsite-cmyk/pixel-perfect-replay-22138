import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { getCollection } from "@/lib/catalog";

export const Route = createFileRoute("/collections/$slug")({
  loader: ({ params }) => {
    const collection = getCollection(params.slug);
    if (!collection) throw notFound();
    return { collection };
  },
  head: ({ loaderData }) => {
    const c = loaderData?.collection;
    const title = c ? `${c.name} Collection — INDUKA` : "Collection not found — INDUKA";
    const desc = c ? `${c.name} (${c.meaning}): ${c.focus}` : "This collection could not be found.";
    return {
      meta: [
        { title },
        { name: "description", content: desc },
        { property: "og:title", content: title },
        { property: "og:description", content: desc },
        ...(c ? [] : [{ name: "robots", content: "noindex" }]),
      ],
    };
  },
  notFoundComponent: () => (
    <div className="container-lux py-32 text-center">
      <h1 className="text-5xl">Collection not found</h1>
      <Link to="/collections" className="eyebrow link-lux mt-6 inline-block text-[0.65rem]">All collections</Link>
    </div>
  ),
  component: CollectionPage,
});

function CollectionPage() {
  const { collection: c } = Route.useLoaderData();
  return (
    <section className="relative overflow-hidden bg-midnight text-ivory">
      <img src={c.image} alt={`${c.name} mood image (sample)`} className="absolute inset-0 h-full w-full object-cover opacity-40" />
      <div className="absolute inset-0 bg-gradient-to-t from-midnight via-midnight/60 to-midnight/20" />
      <div className="container-lux relative flex min-h-[70vh] flex-col items-center justify-center gap-6 py-24 text-center">
        <span className="eyebrow text-soft-gold">{c.meaning}</span>
        <h1 className="max-w-full text-4xl leading-tight uppercase sm:text-6xl md:text-7xl">{c.name}</h1>
        <p className="editorial text-xl text-soft-gold">{c.focus}</p>
        <p className="max-w-md text-sm text-ivory/85">This collection is in the making. Its first pieces will appear here at launch.</p>
        <Button asChild variant="luxLight" size="xl"><Link to="/collections">All collections</Link></Button>
      </div>
    </section>
  );
}
