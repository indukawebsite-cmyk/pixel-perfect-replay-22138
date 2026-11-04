import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Gift, Instagram, ShieldCheck, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/brand/Logo";
import { Reveal, SectionHeading, Sparkle } from "@/components/brand/primitives";
import { ProductCard } from "@/components/shop/ProductCard";
import { CollectionCard } from "@/components/shop/CollectionCard";
import { Newsletter } from "@/components/brand/Newsletter";
import { collections, type Product } from "@/lib/catalog";
import { useLiveCatalog } from "@/lib/live-catalog";
// Temporary sample photography until the client supplies final homepage images.
import hero from "@/assets/sample/hero-crescent-velvet.jpg";
import editorial from "@/assets/sample/editorial-layering.jpg";
import gifting from "@/assets/sample/gifting-blush.jpg";
import sampleEarrings from "@/assets/sample/cat-earrings.jpg";
import sampleRings from "@/assets/sample/cat-rings.jpg";
import sampleNecklaces from "@/assets/sample/cat-necklaces.jpg";
import sampleBracelets from "@/assets/sample/cat-bracelets.jpg";

const sampleTiles = [
  { slug: "earrings", name: "Earrings", image: sampleEarrings },
  { slug: "rings", name: "Rings", image: sampleRings },
  { slug: "necklaces", name: "Necklaces", image: sampleNecklaces },
  { slug: "bracelets", name: "Bracelets", image: sampleBracelets },
];

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "INDUKA — Wear the moon. 925 Sterling Silver Jewellery" },
      { name: "description", content: "Moon-inspired 925 sterling silver jewellery from House of Induka — gift-ready, meaningful and made to be kept." },
      { property: "og:title", content: "INDUKA — Wear the moon." },
      { property: "og:description", content: "Moon-inspired 925 sterling silver jewellery from House of Induka." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Home,
});

function Home() {
  const { products } = useLiveCatalog();
  const best = products.slice(0, 4);
  const fresh = products.slice(4, 8);
  return (
    <>
      {/* HERO */}
      <section className="relative overflow-hidden bg-midnight text-ivory">
        <img src={hero} alt="Sterling silver crescent pendant on black velvet (sample image)" width={1920} height={1088} className="absolute inset-0 h-full w-full object-cover object-right" />
        <div className="absolute inset-0 bg-gradient-to-r from-midnight via-midnight/40 to-transparent" />
        <div className="container-lux relative flex min-h-[min(70svh,720px)] flex-col justify-center py-16 md:py-20">
          <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }} className="flex max-w-xl flex-col gap-7">
            <span className="eyebrow text-soft-gold">House of Induka · 925 Sterling Silver</span>
            <h1 className="text-5xl leading-[1.1] sm:text-6xl md:text-8xl">
              Wear the <span className="editorial text-champagne">moon.</span>
            </h1>
            <p className="max-w-md text-sm leading-loose text-ivory/85 md:text-base">
              Jewellery inspired by Indu — luminous, meaningful pieces in sterling silver, arriving gift-ready and made to be kept.
            </p>
            <div className="grid gap-3 pt-2 sm:flex sm:flex-wrap sm:gap-4">
              <Button asChild variant="luxLight" size="xl"><Link to="/shop">Explore the shop</Link></Button>
              <Button asChild variant="luxOutline" size="xl" className="text-ivory"><Link to="/collections">The collections</Link></Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* CATEGORIES */}
      <section className="container-lux py-24 md:py-32">
        <SectionHeading eyebrow="Shop by category" title="Quiet light," accent="pure silver." />
        <div className="mt-14 grid grid-cols-2 gap-4 md:grid-cols-4 md:gap-6">
          {sampleTiles.map((c, i) => (
            <Reveal key={c.slug} delay={i * 0.08}>
              <Link to="/shop" search={{ category: c.slug }} className="group block">
                <div className="relative aspect-[4/5] overflow-hidden bg-muted">
                  <img src={c.image} alt={`${c.name} (sample image)`} decoding="async" loading="lazy" width={800} height={1000} className="h-full w-full object-cover transition-transform duration-[1400ms] ease-[var(--ease-lux)] group-hover:scale-105" />
                </div>
                <div className="mt-4 grid grid-cols-[minmax(0,1fr)_auto] items-center gap-2">
                  <span className="min-w-0 font-display text-xl sm:text-2xl">{c.name}</span>
                  <span className="eyebrow text-[0.6rem] text-champagne transition-transform group-hover:translate-x-1">Shop →</span>
                </div>
              </Link>
            </Reveal>
          ))}
        </div>
      </section>

      {/* COLLECTIONS */}
      <section className="bg-midnight py-24 md:py-32">
        <div className="container-lux">
          <SectionHeading eyebrow="The collections" title="Six phases of" accent="moonlight." tone="light" />
          <div className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {collections.map((c, i) => (
              <Reveal key={c.slug} delay={(i % 3) * 0.08}><CollectionCard collection={c} index={i} /></Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* BESTSELLERS */}
      <ProductRow eyebrow="Bestsellers" title="Most" accent="adored" products={best} />

      {/* EDITORIAL BANNER */}
      <section className="relative overflow-hidden bg-midnight text-ivory">
        <div className="grid md:grid-cols-2">
          <div className="relative"><img src={editorial} alt="Layered silver moon and star chains worn on skin (sample image)" loading="lazy" decoding="async" width={1600} height={1008} className="h-full min-h-[420px] w-full object-cover" /></div>
          <div className="flex flex-col justify-center gap-6 p-10 md:p-20">
            <span className="eyebrow text-soft-gold">Nakshatra · The layering edit</span>
            <h2 className="text-4xl leading-[1.15] md:text-6xl">Your own <span className="editorial text-champagne">constellation.</span></h2>
            <p className="max-w-md text-ivory/85">Fine chains and celestial charms, made to be stacked, swapped and worn close — every day.</p>
            <div><Button asChild variant="luxLight" size="xl"><Link to="/collections/$slug" params={{ slug: "nakshatra" }}>Discover Nakshatra</Link></Button></div>
          </div>
        </div>
      </section>

      {/* NEW ARRIVALS */}
      <ProductRow eyebrow="New arrivals" title="Freshly" accent="risen" products={fresh} />

      {/* STORY */}
      <section className="border-y border-border bg-card py-24 md:py-32">
        <Reveal className="container-lux flex max-w-3xl flex-col items-center gap-8 text-center">
          <Logo variant="emblem" className="w-16" />
          <span className="eyebrow text-champagne">Our story</span>
          <p className="font-display text-3xl leading-snug md:text-4xl">
            Induka comes from <span className="editorial text-champagne">Indu</span> — the Sanskrit word for moon. We make silver jewellery that feels luminous, meaningful and timeless.
          </p>
          <Link to="/about" className="eyebrow link-lux text-[0.65rem]">Read our story</Link>
        </Reveal>
      </section>

      {/* CARE & AUTHENTICITY */}
      <section className="container-lux grid gap-12 py-24 md:grid-cols-3 md:py-28">
        {[
          { icon: ShieldCheck, t: "Real 925 silver", d: "Every piece is crafted in 925 sterling silver. Purity details are shared with each product." },
          { icon: Sparkles, t: "Care, simply", d: "Store in the pouch provided, keep away from perfume and water, and polish gently with a soft cloth." },
          { icon: Gift, t: "Made to be kept", d: "Packaging and product documentation will be confirmed with the official catalogue." },
        ].map(({ icon: Icon, t, d }, i) => (
          <Reveal key={t} delay={i * 0.1} className="flex flex-col items-center gap-4 text-center">
            <Icon className="h-6 w-6 text-champagne" strokeWidth={1} />
            <h3 className="text-2xl">{t}</h3>
            <p className="max-w-xs text-sm text-muted-foreground">{d}</p>
          </Reveal>
        ))}
      </section>

      {/* GIFTING */}
      <section className="bg-blush">
        <div className="container-lux grid items-center gap-12 py-20 md:grid-cols-2 md:py-28">
          <Reveal className="relative">
            <img src={gifting} alt="Ivory and midnight INDUKA-style gift box on blush satin (sample image)" loading="lazy" decoding="async" width={1200} height={1200} className="aspect-square w-full object-cover" />
          </Reveal>
          <Reveal delay={0.1} className="flex flex-col gap-6">
            <span className="eyebrow text-cocoa">The unboxing</span>
            <h2 className="text-4xl leading-[1.15] md:text-5xl">An unboxing <span className="editorial text-cocoa">worth keeping.</span></h2>
            <p className="max-w-md text-cocoa">A thoughtful finishing touch for someone you love. Official packaging and gifting options will be shared at launch.</p>
            <div><Button asChild variant="lux" size="xl"><Link to="/collections/$slug" params={{ slug: "chandrika" }}>The gifting edit</Link></Button></div>
          </Reveal>
        </div>
      </section>

      {/* INSTAGRAM */}
      <section className="container-lux py-24">
        <div className="flex flex-col items-center gap-3 text-center">
          <Sparkle className="h-4 w-4 text-champagne" />
          <span className="eyebrow text-champagne">On Instagram</span>
          <h2 className="text-3xl sm:text-4xl">House of Induka</h2>
          <p className="text-xs text-muted-foreground">Sample gallery · Official Instagram account and posts awaiting confirmation.</p>
        </div>
        <div className="mt-10 grid grid-cols-3 gap-2 md:grid-cols-6">
          {[...sampleTiles.map((c) => c.image), editorial, gifting].map((src, i) => (
            <Button asChild key={i} variant="ghost" className="group relative block h-auto aspect-square overflow-hidden rounded-none bg-muted p-0"><Link to="/social" aria-label={`Instagram sample ${i + 1}`}>
              <img src={src} alt="Instagram placeholder (sample image)" loading="lazy" decoding="async" className="h-full w-full object-cover transition duration-700 group-hover:scale-105" />
              <Instagram className="absolute inset-0 m-auto h-5 w-5 text-ivory opacity-0 transition group-hover:opacity-100" strokeWidth={1.25} />
            </Link></Button>
          ))}
        </div>
      </section>

      <Newsletter />
    </>
  );
}

function ProductRow({ eyebrow, title, accent, products }: { eyebrow: string; title: string; accent: string; products: Product[] }) {
  return (
    <section className="container-lux py-24 md:py-32">
      <div className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-end">
        <SectionHeading eyebrow={eyebrow} title={title} accent={accent} align="left" />
        <Link to="/shop" className="eyebrow link-lux text-[0.65rem]">View all</Link>
      </div>
      {!products.length && <p className="mt-6 text-sm leading-relaxed text-muted-foreground">New pieces are being prepared for launch.</p>}
      <div className="mt-10 grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-4 md:gap-x-6">
        {products.map((p, i) => (
          <Reveal key={p.id} delay={i * 0.06}><ProductCard product={p} /></Reveal>
        ))}
      </div>
    </section>
  );
}

