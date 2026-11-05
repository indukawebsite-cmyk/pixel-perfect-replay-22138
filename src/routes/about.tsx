import { createFileRoute } from "@tanstack/react-router";
import { PageIntro } from "@/components/layout/PageIntro";
import { Logo } from "@/components/brand/Logo";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About Us — House of Induka" },
      { name: "description", content: "House of Induka is a premium 925 sterling silver jewellery label for men and women." },
      { property: "og:title", content: "About Us — House of Induka" },
      { property: "og:description", content: "House of Induka is a premium 925 sterling silver jewellery label for men and women." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: About,
});

function About() {
  return (
    <>
      <PageIntro eyebrow="About us" title="Who we" accent="are." />
      <section className="container-lux flex max-w-2xl flex-col items-center gap-8 py-20 text-center">
        <Logo variant="emblem" className="w-16" />
        <p className="font-display text-3xl leading-snug">House of Induka is a premium silver jewellery label for men and women.</p>
        <p className="text-base leading-loose text-muted-foreground">We sell only pure 925 sterling silver — pieces with character and detail, made to be worn every day and kept for years. Every order arrives in gift-worthy packaging, with easy returns and exchanges.</p>
      </section>
    </>
  );
}
