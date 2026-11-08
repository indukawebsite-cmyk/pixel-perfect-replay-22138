import { createFileRoute } from "@tanstack/react-router";
import { InformationPage, informationHead } from "@/components/layout/InformationPage";
export const Route = createFileRoute("/terms")({
  staticData: { sitemap: true }, head: () => informationHead("Terms", "Terms of use and purchase for House of Induka."), component: () => <InformationPage title="Terms"><p>The official terms are awaiting approval. All sample pieces and images are previews, not offers for sale. Purchase terms will be published before orders are accepted.</p></InformationPage> });
