import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
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
    <>
    <PageIntro eyebrow="Account" title="Your" accent="house.">
      Sign-in and order history open at launch. Your wishlist is available during this visit.
    </PageIntro>
    <section className="container-lux flex justify-center py-16"><Button asChild variant="lux" size="xl"><Link to="/wishlist">View your wishlist</Link></Button></section>
    </>
  ),
});
