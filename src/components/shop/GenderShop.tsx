import { Link } from "@tanstack/react-router";
import { ProductExplorer } from "@/components/shop/ProductExplorer";
import { forGender } from "@/lib/catalog";
import type { CampaignImage } from "@/lib/campaign";
import { useLiveCatalog } from "@/lib/live-catalog";
import type { ExplorerSearch } from "@/lib/product-explorer";

type Props = {
  gender: "men" | "women";
  eyebrow: string;
  title: string;
  accent: string;
  lines: string[];
  imagery: CampaignImage[];
  search: ExplorerSearch;
  onChange: (next: ExplorerSearch) => void;
};

/** Shared layout for the Men's and Women's shops; only confirmed gender assignments are listed. */
export function GenderShop({ gender, eyebrow, title, accent, lines, imagery, search, onChange }: Props) {
  const { status, products } = useLiveCatalog();
  const listed = forGender(products, gender);
  const dark = gender === "men";
  return <>
    <nav aria-label="Breadcrumb" className="container-lux py-6 text-xs text-muted-foreground"><Link to="/">Home</Link><span aria-hidden="true" className="mx-3">/</span><span aria-current="page">{gender === "men" ? "Shop Men" : "Shop Women"}</span></nav>
    <section className={dark ? "bg-midnight text-ivory" : "bg-card text-foreground"}>
      <div className="container-lux grid gap-10 py-16 md:grid-cols-[1fr_1.3fr] md:items-center md:py-24">
        <div className="flex flex-col gap-6">
          <span className={`eyebrow ${dark ? "text-soft-gold" : "text-cocoa"}`}>{eyebrow}</span>
          <h1 className="text-5xl uppercase leading-[1.05] md:text-7xl">{title} <span className="editorial normal-case text-champagne">{accent}</span></h1>
          {lines.map((l) => <p key={l} className={`max-w-md text-sm leading-loose ${dark ? "text-ivory/80" : "text-muted-foreground"}`}>{l}</p>)}
        </div>
        <div className="grid grid-cols-2 gap-3">
          {imagery.map((img, i) => (
            <div key={img.src} className={`overflow-hidden bg-muted ${i === 0 ? "row-span-2 aspect-[3/5]" : "aspect-square"} ${i > 2 ? "hidden" : ""}`}>
              <img src={img.src} alt={img.alt} decoding="async" loading={i ? "lazy" : "eager"} className="h-full w-full object-cover" />
            </div>
          ))}
        </div>
      </div>
    </section>
    {status === "ready" && products.length > 0 && listed.length === 0
      ? <section className="container-lux flex flex-col items-center gap-4 py-24 text-center"><h2 className="text-3xl">Pieces are being assigned</h2><p className="max-w-md text-sm leading-relaxed text-muted-foreground">This shop will list pieces once each one is confirmed for it. Browse every piece in the meantime.</p><Link to="/shop" className="eyebrow link-lux text-[0.65rem]">All jewellery</Link></section>
      : <ProductExplorer status={status} products={listed} search={search} onChange={onChange} />}
  </>;
}
