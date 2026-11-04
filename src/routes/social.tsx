import { createFileRoute } from "@tanstack/react-router";
import { InformationPage, informationHead } from "@/components/layout/InformationPage";
export const Route = createFileRoute("/social")({ head: () => informationHead("On Instagram", "Official social links for House of Induka."), component: () => <InformationPage title="On Instagram"><p>The official Instagram account and post links are awaiting confirmation. The homepage gallery currently shows INDUKA product photography, not published Instagram posts.</p></InformationPage> });
