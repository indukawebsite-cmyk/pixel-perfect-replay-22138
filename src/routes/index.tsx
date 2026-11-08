import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Gift, RefreshCcw, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Reveal, SectionHeading } from "@/components/brand/primitives";
import { ProductCard } from "@/components/shop/ProductCard";
import { Newsletter } from "@/components/brand/Newsletter";
import { categoryGroups, categoryMatches, type Product } from "@/lib/catalog";
import { giftingImage } from "@/lib/campaign";
import heroCampaign from "@/assets/campaign/hero-campaign.jpg";
import { GenderCampaign } from "@/components/brand/GenderCampaign";
import { useLiveCatalog } from "@/lib/live-catalog";

export const Route = createFileRoute("/")({
  staticData: { sitemap: true },
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
  const gifts = products.filter((p) => (p.stock ?? 0) > 0).slice(0, 4);
  return (
    <>
      {/* 1 · HERO — one full-width campaign image, text over gradient */}
      <section className="relative bg-midnight text-ivory">
        <div className="relative h-[calc(100svh-160px)] overflow-hidden sm:h-[min(80svh,750px)] sm:min-h-[480px]">
          <img
            src={heroCampaign}
            alt="House of Induka campaign — a male and a female model wearing refined sterling silver jewellery"
            width={1920}
            height={1152}
            fetchPriority="high"
            className="absolute inset-x-0 top-0 h-[min(60vw,calc(100svh-440px))] w-full object-contain object-top sm:inset-0 sm:h-full sm:object-cover sm:object-[16%_center] md:object-[center_18%]"
          />
          <div className="absolute inset-0 hidden bg-gradient-to-r from-midnight/85 via-midnight/30 to-transparent sm:block" />
          <div className="absolute inset-0 hidden bg-gradient-to-t from-midnight/70 via-transparent to-midnight/20 sm:block" />
          <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1] }} className="relative flex h-full min-w-0 flex-col justify-end gap-4 p-6 pt-[calc(min(60vw,100svh-440px)+16px)] sm:gap-6 sm:p-8 sm:pb-12 md:p-14 md:pb-16">
            <span className="eyebrow text-[0.625rem] leading-snug text-soft-gold sm:text-[0.6875rem] sm:leading-normal">House of Induka · 925 Sterling Silver</span>
            <h1 className="max-w-2xl text-[2.375rem] uppercase leading-none sm:text-6xl sm:leading-[1.05] md:text-7xl">Pure silver. <span className="editorial normal-case text-champagne">Distinctive style.</span></h1>
            <div className="grid shrink-0 gap-2.5 sm:flex sm:gap-4 sm:pt-2">
              <Button asChild variant="luxLight" size="xl" className="h-12 w-full sm:h-13 sm:w-auto"><Link to="/men">Shop Men</Link></Button>
              <Button asChild variant="luxOutline" size="xl" className="h-12 w-full text-ivory sm:h-13 sm:w-auto"><Link to="/women">Shop Women</Link></Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* 2 · MEN / WOMEN CAMPAIGN — 60:40 editorial split, swipeable on mobile */}
      <GenderCampaign />

      {/* 3 · SHOP BY CATEGORY */}
      <section className="container-lux py-24 md:py-28">
        <SectionHeading eyebrow="Shop by category" title="Find your" accent="piece." />
        <div className="mt-14 grid grid-cols-2 gap-4 md:grid-cols-4 md:gap-6">
          {categoryGroups.map((c, i) => {
            const count = products.filter((p) => categoryMatches(c.slug, p.category)).length;
            const tile = <>
              <div className="relative aspect-[4/5] overflow-hidden bg-muted">
                <img src={c.image} alt={c.name} loading="lazy" decoding="async" className={`h-full w-full object-cover transition-transform duration-[1400ms] ease-[var(--ease-lux)] ${count ? "group-hover:scale-105" : "opacity-50 grayscale"}`} />
              </div>
              <div className="mt-4 flex flex-col gap-1.5">
                <span className="font-display text-xl leading-tight sm:text-2xl">{c.name}</span>
                <span className={`eyebrow text-[0.6rem] ${count ? "text-champagne" : "text-muted-foreground"}`}>{count ? "Shop →" : "Coming soon"}</span>
              </div>
            </>;
            return <Reveal key={c.slug} delay={i * 0.06}>{count ? <Link to="/shop" search={{ category: c.slug }} className="group block">{tile}</Link> : <div aria-disabled="true">{tile}</div>}</Reveal>;
          })}
        </div>
      </section>

      {/* 4 · GIFTS WORTH KEEPING */}
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
