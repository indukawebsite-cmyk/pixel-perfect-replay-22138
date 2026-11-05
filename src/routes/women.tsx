import { createFileRoute } from "@tanstack/react-router";
import { GenderShop } from "@/components/shop/GenderShop";
import { womenImagery } from "@/lib/campaign";
import { validateExplorerSearch } from "@/lib/product-explorer";

export const Route = createFileRoute("/women")({
  validateSearch: validateExplorerSearch,
  head: () => ({
    meta: [
      { title: "Women's Silver Jewellery — Earrings & More | INDUKA" },
      { name: "description", content: "Pure 925 sterling silver earrings and jewellery for women from House of Induka. Quiet light, effortless elegance." },
      { property: "og:title", content: "Women's Silver Jewellery — Earrings & More | INDUKA" },
      { property: "og:description", content: "Pure 925 sterling silver earrings and jewellery for women from House of Induka. Quiet light, effortless elegance." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Women,
});

function Women() {
  const search = Route.useSearch();
  const navigate = Route.useNavigate();
  return <GenderShop gender="women" eyebrow="Shop Women · 925 Sterling Silver" title="Quiet light." accent="Pure silver." lines={["Elegance in every detail.", "Timeless silver, effortless style — made to be cherished."]} imagery={womenImagery} search={search} onChange={(next) => { void navigate({ search: next, resetScroll: false }); }} />;
}
