import { createFileRoute } from "@tanstack/react-router";
import { InformationPage, informationHead } from "@/components/layout/InformationPage";

export const Route = createFileRoute("/returns")({
  head: () => informationHead("Returns & Exchanges", "Returns and exchanges at House of Induka."),
  component: () => <InformationPage title="Returns & Exchanges">
    <p>We offer easy returns and exchanges.</p>
    <p className="mt-4">The full policy — how many days you have, which pieces qualify, the condition items must be in, and how refunds are made — is awaiting confirmation and will be published here before purchases open.</p>
  </InformationPage>,
});
