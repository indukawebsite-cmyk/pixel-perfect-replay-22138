import { Link } from "@tanstack/react-router";
import { PageIntro } from "@/components/layout/PageIntro";

export function informationHead(title: string, description: string) {
  return { meta: [{ title: `${title} — House of Induka` }, { name: "description", content: description }, { property: "og:title", content: `${title} — House of Induka` }, { property: "og:description", content: description }, { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary_large_image" }] };
}

export function InformationPage({ title, children }: { title: string; children: React.ReactNode }) {
  return <><PageIntro eyebrow="House of Induka" title={title} /><section className="container-lux max-w-3xl py-16 text-base leading-loose text-muted-foreground">{children}<div className="mt-10 flex flex-wrap gap-6 text-sm"><Link to="/contact" className="underline underline-offset-4">Contact</Link><Link to="/shop" className="underline underline-offset-4">Browse jewellery</Link></div></section></>;
}