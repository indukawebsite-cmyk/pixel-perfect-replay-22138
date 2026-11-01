import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Gift, Instagram, ShieldCheck, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/brand/Logo";
import { Reveal, SampleBadge, SectionHeading, Sparkle } from "@/components/brand/primitives";
import { ProductCard } from "@/components/shop/ProductCard";
import { CollectionCard } from "@/components/shop/CollectionCard";
import { categories, collections, sampleProducts } from "@/lib/catalog";
import hero from "@/assets/hero-crescent-velvet.jpg";
import editorial from "@/assets/editorial-layering.jpg";
import gifting from "@/assets/gifting-blush.jpg";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "INDUKA — Wear the moon. 925 Sterling Silver Jewellery" },
      { name: "description", content: "Moon-inspired 925 sterling silver jewellery from House of Induka — gift-ready, meaningful and made to be kept." },
      { property: "og:title", content: "INDUKA — Wear the moon." },
      { property: "og:description", content: "Moon-inspired 925 sterling silver jewellery from House of Induka." },
    ],
  }),
  component: Home,
});

function Home() {
  const best = sampleProducts.filter((p) => p.tag === "Bestseller");
  const fresh = sampleProducts.filter((p) => p.tag === "New");
  return (
    <>
      {/* HERO */}
      <section className="relative overflow-hidden bg-midnight text-ivory">
        <img src={hero} alt="Sterling silver crescent pendant on black velvet (sample image)" width={1920} height={1088} className="absolute inset-0 h-full w-full object-cover object-right" />
        <div className="absolute inset-0 bg-gradient-to-r from-midnight via-midnight/70 to-transparent" />
        <div className="container-lux relative flex min-h-[78vh] flex-col justify-center py-24">
          <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }} className="flex max-w-xl flex-col gap-7">
            <span className="eyebrow text-soft-gold">House of Induka · 925 Sterling Silver</span>
            <h1 className="text-6xl leading-[1] md:text-8xl">
              Wear the <span className="editorial text-champagne">moon.</span>
            </h1>
            <p className="max-w-md text-base text-ivory/70">
              Jewellery inspired by Indu — luminous, meaningful pieces in pure silver, arriving gift-ready and made to be kept.
            </p>
            <div className="flex flex-wrap gap-4 pt-2">
              <Button asChild variant="luxLight" size="xl"><Link to="/shop">Explore the shop</Link></Button>
              <Button asChild variant="luxOutline" size="xl" className="text-ivory"><Link to="/collections">The collections</Link></Button>
            </div>
          </motion.div>
        </div>
        <SampleBadge className="absolute bottom-4 right-4" />
      </section>

      {/* CATEGORIES */}
      <section className="container-lux py-24 md:py-32">
        <SectionHeading eyebrow="Shop by category" title="Quiet light," accent="pure silver." />
        <div className="mt-14 grid grid-cols-2 gap-4 md:grid-cols-4 md:gap-6">
          {categories.map((c, i) => (
            <Reveal key={c.slug} delay={i * 0.08}>
              <Link to="/shop" className="group block">
                <div className="relative aspect-[4/5] overflow-hidden bg-muted">
                  <img src={c.image} alt={`${c.name} (sample image)`} loading="lazy" width={800} height={1000} className="h-full w-full object-cover transition-transform duration-[1400ms] ease-[var(--ease-lux)] group-hover:scale-105" />
                  <SampleBadge className="absolute left-3 top-3" />
                </div>
                <div className="mt-4 flex items-center justify-between">
                  <span className="font-display text-2xl">{c.name}</span>
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
          <img src={editorial} alt="Layered silver moon and star chains worn on skin (sample image)" loading="lazy" width={1600} height={1008} className="h-full min-h-[420px] w-full object-cover" />
          <div className="flex flex-col justify-center gap-6 p-10 md:p-20">
            <span className="eyebrow text-soft-gold">Nakshatra · The layering edit</span>
            <h2 className="text-5xl leading-[1.05] md:text-6xl">Your own <span className="editorial text-champagne">constellation.</span></h2>
            <p className="max-w-md text-ivory/70">Fine chains and celestial charms, made to be stacked, swapped and worn close — every day.</p>
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
          { icon: Gift, t: "Made to be kept", d: "Each order includes a certificate of authenticity, a care guide and a gift-ready box." },
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
            <img src={gifting} alt="Ivory and midnight INDUKA-style gift box on blush satin (sample image)" loading="lazy" width={1200} height={1200} className="aspect-square w-full object-cover" />
            <SampleBadge className="absolute left-3 top-3" />
          </Reveal>
          <Reveal delay={0.1} className="flex flex-col gap-6">
            <span className="eyebrow text-cocoa">The unboxing</span>
            <h2 className="text-5xl leading-[1.05]">An unboxing <span className="editorial text-cocoa">worth keeping.</span></h2>
            <p className="max-w-md text-cocoa">Every order arrives gift-ready — wrapped, signed and sealed. Add a handwritten note at checkout for someone you love.</p>
            <div><Button asChild variant="lux" size="xl"><Link to="/collections/$slug" params={{ slug: "chandrika" }}>The gifting edit</Link></Button></div>
          </Reveal>
        </div>
      </section>

      {/* INSTAGRAM */}
      <section className="container-lux py-24">
        <div className="flex flex-col items-center gap-3 text-center">
          <Sparkle className="h-4 w-4 text-champagne" />
          <span className="eyebrow text-champagne">On Instagram</span>
          <h2 className="text-4xl">@houseofinduka</h2>
          <p className="text-xs text-muted-foreground">Feed placeholder — connect the official account to display real posts.</p>
        </div>
        <div className="mt-10 grid grid-cols-3 gap-2 md:grid-cols-6">
          {[...categories.map((c) => c.image), editorial, gifting].map((src, i) => (
            <div key={i} className="group relative aspect-square overflow-hidden bg-muted">
              <img src={src} alt="Instagram placeholder" loading="lazy" className="h-full w-full object-cover transition duration-700 group-hover:scale-105" />
              <Instagram className="absolute inset-0 m-auto h-5 w-5 text-ivory opacity-0 transition group-hover:opacity-100" strokeWidth={1.25} />
            </div>
          ))}
        </div>
      </section>

      <Newsletter />
    </>
  );
}

function ProductRow({ eyebrow, title, accent, products }: { eyebrow: string; title: string; accent: string; products: typeof sampleProducts }) {
  return (
    <section className="container-lux py-24 md:py-32">
      <div className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-end">
        <SectionHeading eyebrow={eyebrow} title={title} accent={accent} align="left" />
        <Link to="/shop" className="eyebrow link-lux text-[0.65rem]">View all</Link>
      </div>
      <div className="mt-12 grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-4 md:gap-x-6">
        {products.map((p, i) => (
          <Reveal key={p.id} delay={i * 0.06}><ProductCard product={p} /></Reveal>
        ))}
      </div>
    </section>
  );
}

function Newsletter() {
  return (
    <section className="bg-midnight py-24 text-ivory">
      <div className="container-lux flex max-w-2xl flex-col items-center gap-6 text-center">
        <span className="eyebrow text-soft-gold">The moonlit letter</span>
        <h2 className="text-4xl md:text-5xl">First light, <span className="editorial text-champagne">first look.</span></h2>
        <p className="text-sm text-ivory/60">Be first to know when our debut collections launch.</p>
        <form
          className="mt-2 flex w-full max-w-md border-b border-ivory/40"
          onSubmit={(e) => {
            e.preventDefault();
            (e.currentTarget.querySelector("p") as HTMLElement).hidden = false;
          }}
        >
          <label htmlFor="nl" className="sr-only">Email address</label>
          <input id="nl" type="email" required placeholder="Your email address" className="w-full bg-transparent py-3 text-sm outline-none placeholder:text-ivory/40" />
          <button className="eyebrow text-[0.65rem] text-soft-gold">Subscribe</button>
          <p hidden className="sr-only" role="status">Subscriptions open at launch.</p>
        </form>
        <p className="text-[0.7rem] text-ivory/40">Sign-up is not yet connected — this will be wired up in a later phase.</p>
      </div>
    </section>
  );
}
