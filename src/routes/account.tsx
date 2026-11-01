import { createFileRoute } from "@tanstack/react-router";
import { PageIntro } from "@/components/layout/PageIntro";

export const Route = createFileRoute("/account")({
  head: () => ({
    meta: [
      { title: "Your Account — INDUKA" },
      { name: "description", content: "Sign in to your INDUKA account." },
      { property: "og:title", content: "Your Account — INDUKA" },
      { property: "og:description", content: "Sign in to your INDUKA account." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: () => (
    <PageIntro eyebrow="Account" title="Your" accent="house.">
      Sign-in, orders and wishlist open in a later phase.
    </PageIntro>
  ),
});
