import { createFileRoute } from "@tanstack/react-router";
import { PageIntro } from "@/components/layout/PageIntro";
import { ProductExplorer } from "@/components/shop/ProductExplorer";
import { useLiveCatalog } from "@/lib/live-catalog";
import { validateExplorerSearch } from "@/lib/product-explorer";

export const Route = createFileRoute("/bestsellers")({
  validateSearch: validateExplorerSearch,
  head: () => ({
    meta: [
      { title: "Gifts Worth Keeping — Bestsellers | INDUKA" },
      { name: "description", content: "Gift-worthy 925 sterling silver jewellery from House of Induka, presented in gift-worthy packaging with every order." },
      { property: "og:title", content: "Gifts Worth Keeping — Bestsellers | INDUKA" },
      { property: "og:description", content: "Gift-worthy 925 sterling silver jewellery from House of Induka, presented in gift-worthy packaging with every order." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Bestsellers,
});

function Bestsellers() {
  const search = Route.useSearch();
  const navigate = Route.useNavigate();
  const { status, products } = useLiveCatalog();
  return <>
    <PageIntro eyebrow="Bestsellers" title="Gifts worth" accent="keeping.">Every order arrives in gift-worthy packaging. Bestseller rankings will appear once real sales begin.</PageIntro>
    <ProductExplorer status={status} products={products.filter((p) => (p.stock ?? 0) > 0)} search={search} onChange={(next) => { void navigate({ search: next, resetScroll: false }); }} />
  </>;
}
