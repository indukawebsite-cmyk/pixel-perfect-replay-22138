import { createFileRoute } from "@tanstack/react-router";
import { InformationPage, informationHead } from "@/components/layout/InformationPage";

export const Route = createFileRoute("/silver-care")({
  head: () => informationHead("Silver Policy & Care", "The 925 sterling silver standard at House of Induka, and how to care for your silver jewellery."),
  component: SilverCare,
});

function SilverCare() {
  return <InformationPage title="Silver Policy & Care">
    <h2 className="font-display text-3xl text-foreground">Our silver</h2>
    <p className="mt-4">We sell only pure 925 sterling silver. 925 sterling silver is an alloy of 92.5% silver with a small amount of other metal added for strength, so the piece keeps its shape when worn.</p>
    <p className="mt-4 text-sm">Hallmarking and certificate details will be added here once confirmed.</p>
    <h2 className="mt-12 font-display text-3xl text-foreground">Caring for your silver</h2>
    <ul className="mt-4 list-disc space-y-2 pl-5">
      <li>Put jewellery on last — after perfume, lotion and hair spray.</li>
      <li>Remove before swimming, bathing, exercise and cleaning.</li>
      <li>Wipe gently with a soft, dry cloth after wearing.</li>
      <li>Store each piece separately in a dry pouch or box, away from air and moisture, to slow tarnishing.</li>
      <li>Silver naturally darkens over time; a silver polishing cloth restores its shine. Avoid polishing enamel, stones or intentionally oxidised areas.</li>
      <li>Avoid harsh chemicals and abrasive cleaners.</li>
    </ul>
  </InformationPage>;
}
