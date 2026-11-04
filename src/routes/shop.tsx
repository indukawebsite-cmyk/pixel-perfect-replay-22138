import { createFileRoute, Link } from "@tanstack/react-router";
import { PageIntro } from "@/components/layout/PageIntro";
import { ProductExplorer } from "@/components/shop/ProductExplorer";
import { useLiveCatalog } from "@/lib/live-catalog";
import { validateExplorerSearch } from "@/lib/product-explorer";

export const Route = createFileRoute("/shop")({
  validateSearch: validateExplorerSearch,
  head: () => ({
    meta: [
      { title: "Shop 925 Sterling Silver Jewellery — INDUKA" },
      { name: "description", content: "Browse INDUKA's moon-inspired sterling silver pendants and earrings." },
      { property: "og:title", content: "Shop — INDUKA" },
      { property: "og:description", content: "Moon-inspired 925 sterling silver jewellery." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Shop,
});

function Shop() {
  const search = Route.useSearch();
  const navigate = Route.useNavigate();
  const { status, products } = useLiveCatalog();
  return <>
    <nav aria-label="Breadcrumb" className="container-lux pt-8 text-xs text-muted-foreground"><Link to="/">Home</Link><span aria-hidden="true" className="mx-3">/</span><span aria-current="page">Shop all</span></nav>
    <PageIntro eyebrow="The shop" title="All" accent="jewellery" />
    <ProductExplorer status={status} products={products} search={search} onChange={(next) => { void navigate({ search: next, resetScroll: false }); }} />
  </>;
}
