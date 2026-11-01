import { createFileRoute } from "@tanstack/react-router";
import { InformationPage, informationHead } from "@/components/layout/InformationPage";
export const Route = createFileRoute("/shipping")({ head: () => informationHead("Shipping", "Shipping information for House of Induka."), component: () => <InformationPage title="Shipping"><p>Shipping destinations, delivery times and charges are awaiting confirmation. The shop is not accepting orders yet. Confirmed shipping information will be published before checkout opens.</p></InformationPage> });
