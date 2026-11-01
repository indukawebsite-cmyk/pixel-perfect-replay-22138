import { createFileRoute } from "@tanstack/react-router";
import { PageIntro } from "@/components/layout/PageIntro";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact — House of Induka" },
      { name: "description", content: "Get in touch with House of Induka." },
      { property: "og:title", content: "Contact — House of Induka" },
      { property: "og:description", content: "Get in touch with House of Induka." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: () => (
    <PageIntro eyebrow="Contact" title="Write to" accent="us.">
      Official email, WhatsApp and studio details will be added here once supplied.
    </PageIntro>
  ),
});
