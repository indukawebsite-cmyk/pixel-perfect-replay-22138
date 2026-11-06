import { createFileRoute } from "@tanstack/react-router";
import { InformationPage, informationHead } from "@/components/layout/InformationPage";

export const Route = createFileRoute("/authenticity")({
  head: () =>
    informationHead(
      "Hallmarking & Certificate of Authenticity",
      "Every INDUKA piece carries an embedded 925 sterling silver marking and an INDUKA Certificate of Authenticity.",
    ),
  component: () => <InformationPage title="Hallmarking & Authenticity">
    <p>
      At INDUKA, authenticity is an essential part of everything we create.
    </p>
    <p className="mt-4">
      Every INDUKA jewellery piece features an embedded 925 sterling silver purity marking, representing
      92.5% pure silver.
    </p>
    <p className="mt-4">
      To further assure you of the quality and authenticity of your purchase, every order is accompanied
      by an exclusive INDUKA Certificate of Authenticity, issued by the company.
    </p>

    <h2 className="mt-10 text-xl text-foreground">Our assurance of authenticity</h2>
    <p className="mt-4">
      <strong className="text-foreground">Embedded 925 marking:</strong> every jewellery piece carries an
      embedded 925 marking to indicate sterling silver purity.
    </p>
    <p className="mt-4">
      <strong className="text-foreground">Certificate of Authenticity:</strong> each purchase comes with
      an INDUKA-issued certificate confirming the product's stated material and purity.
    </p>

    <h2 className="mt-10 text-xl text-foreground">Understanding 925 sterling silver</h2>
    <p className="mt-2">
      925 sterling silver consists of 92.5% pure silver and 7.5% other metals, added to enhance strength
      and durability.
    </p>
    <p className="mt-4">
      At INDUKA, we believe that true luxury lies not only in how jewellery looks, but also in the
      confidence and trust behind every piece.
    </p>

    <p className="editorial mt-10 text-lg text-champagne">INDUKA — Authenticity in Every Detail.</p>
  </InformationPage>,
});
