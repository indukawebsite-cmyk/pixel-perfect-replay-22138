import { createFileRoute } from "@tanstack/react-router";
import { PageIntro } from "@/components/layout/PageIntro";
import { Logo } from "@/components/brand/Logo";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "Our Story — House of Induka" },
      { name: "description", content: "Induka takes its name from Indu, the Sanskrit word for moon — celestial, quiet-luxury 925 silver jewellery." },
      { property: "og:title", content: "Our Story — House of Induka" },
      { property: "og:description", content: "The moonlit house of 925 sterling silver." },
    ],
  }),
  component: About,
});

function About() {
  return (
    <>
      <PageIntro eyebrow="Our story" title="Inspired by" accent="Indu." />
      <section className="container-lux flex max-w-2xl flex-col items-center gap-8 py-20 text-center">
        <Logo variant="emblem" className="w-16" />
        <p className="font-display text-3xl leading-snug">For women who want jewellery with meaning — moon-inspired pieces that arrive gift-ready and are made to be kept.</p>
        <p className="text-muted-foreground">
          Real 925 silver. Meaningful design. An unboxing worth keeping. Every order includes a signed certificate of authenticity, a care guide and a gift-ready box.
        </p>
      </section>
    </>
  );
}
