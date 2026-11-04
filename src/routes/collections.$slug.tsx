import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { getCollection } from "@/lib/catalog";
import { useLiveCatalog } from "@/lib/live-catalog";
import { ProductExplorer } from "@/components/shop/ProductExplorer";
import { ShoppingError } from "@/components/shop/RouteFeedback";
import { validateExplorerSearch } from "@/lib/product-explorer";

export const Route = createFileRoute("/collections/$slug")({
  validateSearch: validateExplorerSearch,
  errorComponent: ShoppingError,
  loader: ({ params }) => {
    const collection = getCollection(params.slug);
    if (!collection) throw notFound();
    return { collection };
  },
  head: ({ loaderData }) => {
    const c = loaderData?.collection;
    const title = c ? `${c.name} Collection — INDUKA` : "Collection not found — INDUKA";
    const desc = c ? `${c.name} — ${c.meaning}. ${c.focus}` : "This collection could not be found.";
    return {
      meta: [
        { title },
        { name: "description", content: desc },
        { property: "og:title", content: title },
        { property: "og:description", content: desc },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
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
  const search = Route.useSearch();
  const navigate = Route.useNavigate();
  const { status, products } = useLiveCatalog();
  return <>
    <nav aria-label="Breadcrumb" className="container-lux py-6 text-xs text-muted-foreground"><Link to="/">Home</Link><span aria-hidden="true" className="mx-3">/</span><Link to="/collections">Collections</Link><span aria-hidden="true" className="mx-3">/</span><span aria-current="page">{c.name}</span></nav>
    <section className="relative overflow-hidden bg-midnight text-ivory">
      <img src={c.image} alt={`${c.name} collection — INDUKA sterling silver`} decoding="async" className="absolute inset-0 h-full w-full object-cover object-center" />
      <div className="absolute inset-0 bg-gradient-to-r from-midnight/90 via-midnight/65 to-midnight/20" />
      <div className="container-lux relative flex min-h-80 flex-col justify-center gap-5 py-16 md:min-h-96">
        <span className="eyebrow text-soft-gold">{c.meaning}</span>
        <h1 className="max-w-full text-4xl leading-tight uppercase sm:text-6xl md:text-7xl">{c.name}</h1>
        <p className="editorial max-w-lg text-lg leading-relaxed text-ivory md:text-xl">{c.focus}</p>
      </div>
    </section>
    <ProductExplorer status={status} products={products.filter((product) => product.collection === c.slug)} search={search} onChange={(next) => { void navigate({ search: next, resetScroll: false }); }} />
  </>;
}
