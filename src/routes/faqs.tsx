import { createFileRoute } from "@tanstack/react-router";
import { InformationPage, informationHead } from "@/components/layout/InformationPage";
export const Route = createFileRoute("/faqs")({ head: () => informationHead("Frequently Asked Questions", "Answers about the INDUKA catalogue, wishlist and launch."), component: FAQs });
function FAQs() { return <InformationPage title="FAQs">{[
["Can I purchase the pieces shown?", "Not yet. All pieces are clearly marked samples. Official products, prices and availability will be confirmed at launch."],
["Where are my saved pieces?", "Your wishlist keeps sample pieces during this visit. It resets when the page is reloaded and is not linked to an account."],
["What are the shipping and returns policies?", "Both policies are awaiting approval and will be published before the shop accepts orders."],
["How can I contact House of Induka?", "Official contact details are awaiting confirmation and will appear on our Contact page."]
].map(([question,answer]) => <details key={question} className="border-b border-border py-5"><summary className="cursor-pointer text-base font-medium text-foreground">{question}</summary><p className="mt-4 text-sm leading-loose">{answer}</p></details>)}</InformationPage>; }
