import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Gift, RefreshCcw, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Reveal, SectionHeading } from "@/components/brand/primitives";
import { ProductCard } from "@/components/shop/ProductCard";
import { Newsletter } from "@/components/brand/Newsletter";
import { categoryGroups, categoryMatches, forGender, type Product } from "@/lib/catalog";
import { giftingImage, menImagery, womenImagery } from "@/lib/campaign";
import { useLiveCatalog } from "@/lib/live-catalog";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "INDUKA — Pure 925 Sterling Silver Jewellery for Men & Women" },
      { name: "description", content: "House of Induka: pure 925 sterling silver pendants, chains and earrings for men and women. Easy returns and gift-worthy packaging." },
      { property: "og:title", content: "INDUKA — Pure silver. Distinctive style." },
      { property: "og:description", content: "Pure 925 sterling silver jewellery for men and women from House of Induka." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Home,
});

function Home() {
  const { products } = useLiveCatalog();
  const men = forGender(products, "men");
  const women = forGender(products, "women");
  const gifts = products.filter((p) => (p.stock ?? 0) > 0).slice(0, 4);
  const [m1, m2, m3, m4] = menImagery;
  const [w1, w2] = womenImagery;
  return (
    <>
      {/* 1 · HERO */}
      <section className="bg-midnight text-ivory">
        <div className="grid md:grid-cols-[3fr_2fr]">
          <div className="relative min-h-[min(72svh,760px)] overflow-hidden">
            <img src={m1!.src} alt={m1!.alt} width={1400} height={1750} className="absolute inset-0 h-full w-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-midnight via-midnight/45 to-transparent" />
            <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1] }} className="relative flex h-full min-h-[inherit] flex-col justify-end gap-6 p-8 md:p-14">
              <span className="eyebrow text-soft-gold">House of Induka · 925 Sterling Silver</span>
              <h1 className="max-w-2xl text-5xl uppercase leading-[1.05] sm:text-6xl md:text-7xl">Pure silver. <span className="editorial normal-case text-champagne">Distinctive style.</span></h1>
              <div className="grid gap-3 pt-2 sm:flex sm:gap-4">
                <Button asChild variant="luxLight" size="xl"><Link to="/men">Shop Men</Link></Button>
                <Button asChild variant="luxOutline" size="xl" className="text-ivory"><Link to="/women">Shop Women</Link></Button>
              </div>
            </motion.div>
          </div>
          <div className="hidden overflow-hidden md:block"><img src={w1!.src} alt={w1!.alt} width={1400} height={1750} className="h-full w-full object-cover" /></div>
        </div>
      </section>

      {/* 2 · SHOP MEN — the larger share of the page */}
      <section className="bg-cocoa text-ivory">
        <div className="container-lux py-24 md:py-32">
          <div className="grid gap-12 lg:grid-cols-[1fr_1.6fr] lg:items-center">
            <Reveal className="flex flex-col gap-6">
              <span className="eyebrow text-soft-gold">Shop Men</span>
              <h2 className="text-5xl uppercase leading-[1.05] md:text-7xl">Designed with character.</h2>
              <p className="editorial text-2xl text-champagne">Made to last.</p>
              <p className="max-w-md text-sm leading-loose text-ivory/80">Pendants and chains in pure 925 sterling silver — engraved, oxidised and built with presence.</p>
              <div className="flex flex-wrap gap-3">
                <Button asChild variant="luxLight" size="xl"><Link to="/men">Explore Men</Link></Button>
                <Button asChild variant="luxOutline" size="xl" className="text-ivory"><Link to="/men" search={{ category: "necklaces" }}>Pendants &amp; Chains</Link></Button>
              </div>
            </Reveal>
            <div className="grid grid-cols-2 grid-rows-2 gap-3 md:gap-4">
              {[m2, m3, m4].map((img, i) => (
                <Reveal key={img!.src} delay={i * 0.06} className={i === 0 ? "row-span-2" : ""}>
                  <Link to="/men" className="group block h-full overflow-hidden bg-midnight">
                    <img src={img!.src} alt={img!.alt} loading="lazy" decoding="async" className={`w-full object-cover transition-transform duration-[1400ms] ease-[var(--ease-lux)] group-hover:scale-105 h-full ${i === 0 ? "min-h-[22rem] md:min-h-[36rem]" : ""}`} />
                  </Link>
                </Reveal>
              ))}
            </div>
          </div>
          {men.length > 0 && <ProductGrid products={men.slice(0, 4)} tone="dark" />}
        </div>
      </section>

      {/* 3 · SHOP WOMEN */}
      <section className="bg-card">
        <div className="container-lux grid gap-10 py-20 md:grid-cols-[1.2fr_1fr] md:items-center md:py-24">
          <div className="grid grid-cols-2 gap-3">
            {[w1, w2].map((img) => <Reveal key={img!.src}><Link to="/women" className="group block overflow-hidden bg-muted"><img src={img!.src} alt={img!.alt} loading="lazy" decoding="async" className="aspect-[4/5] w-full object-cover transition-transform duration-[1400ms] group-hover:scale-105" /></Link></Reveal>)}
          </div>
          <Reveal className="flex flex-col gap-5">
            <span className="eyebrow text-cocoa">Shop Women</span>
            <h2 className="text-4xl uppercase leading-[1.1] md:text-5xl">Quiet light. Pure silver.</h2>
            <p className="editorial text-xl text-champagne">Effortless elegance.</p>
            <p className="max-w-md text-sm leading-loose text-muted-foreground">Earrings and fine silver pieces with colour, sparkle and detail — made to be cherished.</p>
            <div><Button asChild variant="lux" size="xl"><Link to="/women">Explore Women</Link></Button></div>
          </Reveal>
        </div>
        {women.length > 0 && <div className="container-lux pb-20"><ProductGrid products={women.slice(0, 4)} tone="light" /></div>}
      </section>

      {/* 4 · SHOP BY CATEGORY */}
      <section className="container-lux py-24 md:py-28">
        <SectionHeading eyebrow="Shop by category" title="Find your" accent="piece." />
        <div className="mt-14 grid grid-cols-2 gap-4 md:grid-cols-4 md:gap-6">
          {categoryGroups.map((c, i) => {
            const count = products.filter((p) => categoryMatches(c.slug, p.category)).length;
            const tile = <>
              <div className="relative aspect-[4/5] overflow-hidden bg-muted">
                <img src={c.image} alt={c.name} loading="lazy" decoding="async" className={`h-full w-full object-cover transition-transform duration-[1400ms] ease-[var(--ease-lux)] ${count ? "group-hover:scale-105" : "opacity-50 grayscale"}`} />
              </div>
              <div className="mt-4 grid grid-cols-[minmax(0,1fr)_auto] items-center gap-2">
                <span className="min-w-0 font-display text-xl sm:text-2xl">{c.name}</span>
                <span className={`eyebrow text-[0.6rem] ${count ? "text-champagne" : "text-muted-foreground"}`}>{count ? "Shop →" : "Coming soon"}</span>
              </div>
            </>;
            return <Reveal key={c.slug} delay={i * 0.06}>{count ? <Link to="/shop" search={{ category: c.slug }} className="group block">{tile}</Link> : <div aria-disabled="true">{tile}</div>}</Reveal>;
          })}
        </div>
      </section>

      {/* 5 · GIFTS WORTH KEEPING */}
      <section className="bg-midnight text-ivory">
        <div className="container-lux grid items-center gap-12 py-20 md:grid-cols-2 md:py-28">
          <Reveal><img src={giftingImage.src} alt={giftingImage.alt} loading="lazy" decoding="async" width={1200} height={1200} className="aspect-square w-full object-cover" /></Reveal>
          <Reveal delay={0.1} className="flex flex-col gap-6">
            <span className="eyebrow text-soft-gold">Bestsellers for gifting</span>
            <h2 className="text-4xl uppercase leading-[1.1] md:text-6xl">Gifts worth keeping.</h2>
            <p className="max-w-md text-ivory/80">Gift-worthy packaging with every order — ready to give, with nothing more to wrap.</p>
            <div><Button asChild variant="luxLight" size="xl"><Link to="/bestsellers">Shop gifts</Link></Button></div>
          </Reveal>
        </div>
        {gifts.length > 0 && <div className="container-lux pb-24"><ProductGrid products={gifts} tone="dark" /></div>}
      </section>

      <section className="container-lux grid gap-10 py-20 md:grid-cols-3">
        {[
          { icon: ShieldCheck, t: "Only pure 925 sterling silver" },
          { icon: RefreshCcw, t: "Easy returns & exchanges" },
          { icon: Gift, t: "Gift-worthy packaging with every order" },
        ].map(({ icon: Icon, t }) => (
          <div key={t} className="flex flex-col items-center gap-4 text-center"><Icon className="h-6 w-6 text-champagne" strokeWidth={1} /><h3 className="text-xl">{t}</h3></div>
        ))}
      </section>

      <Newsletter />
    </>
  );
}

function ProductGrid({ products, tone }: { products: Product[]; tone: "dark" | "light" }) {
  return (
    <div className={`mt-16 grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-4 md:gap-x-6 ${tone === "dark" ? "[&_a]:text-ivory [&_p]:text-ivory/80" : ""}`}>
      {products.map((p, i) => <Reveal key={p.id} delay={i * 0.06}><ProductCard product={p} /></Reveal>)}
    </div>
  );
}
