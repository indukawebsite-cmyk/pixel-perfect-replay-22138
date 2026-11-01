import { createFileRoute } from "@tanstack/react-router";
import { InformationPage, informationHead } from "@/components/layout/InformationPage";
export const Route = createFileRoute("/privacy")({ head: () => informationHead("Privacy", "Privacy information for House of Induka."), component: () => <InformationPage title="Privacy"><p>The official privacy policy is awaiting approval. Newsletter registration and account sign-in are not active. No email is saved by the newsletter form. A complete policy will be published before these services open.</p></InformationPage> });
