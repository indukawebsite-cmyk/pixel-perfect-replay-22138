import { createFileRoute } from "@tanstack/react-router";
import { InformationPage, informationHead } from "@/components/layout/InformationPage";
export const Route = createFileRoute("/returns")({ head: () => informationHead("Returns", "Returns and exchanges information for House of Induka."), component: () => <InformationPage title="Returns"><p>The returns and exchanges policy is awaiting approval. Eligibility, time limits and the returns process will be published before purchases become available.</p></InformationPage> });
