import { createFileRoute } from "@tanstack/react-router";
import { GenderShop } from "@/components/shop/GenderShop";
import { menImagery } from "@/lib/campaign";
import { validateExplorerSearch } from "@/lib/product-explorer";

export const Route = createFileRoute("/men")({
  staticData: { sitemap: true },
  validateSearch: validateExplorerSearch,
  head: () => ({
    meta: [
      { title: "Men's Silver Jewellery — Pendants & Chains | INDUKA" },
      { name: "description", content: "Pure 925 sterling silver pendants and chains for men from House of Induka. Designed with character, made to last." },
      { property: "og:title", content: "Men's Silver Jewellery — Pendants & Chains | INDUKA" },
      { property: "og:description", content: "Pure 925 sterling silver pendants and chains for men from House of Induka. Designed with character, made to last." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Men,
});

function Men() {
  const search = Route.useSearch();
  const navigate = Route.useNavigate();
  return <GenderShop gender="men" eyebrow="Shop Men · 925 Sterling Silver" title="Designed with" accent="character." lines={["Made to last. Pendants and chains in pure 925 sterling silver, with weight, detail and presence."]} imagery={menImagery} search={search} onChange={(next) => { void navigate({ search: next, resetScroll: false }); }} />;
}
