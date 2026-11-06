import { createFileRoute } from "@tanstack/react-router";
import { InformationPage, informationHead } from "@/components/layout/InformationPage";

export const Route = createFileRoute("/returns")({
  head: () => informationHead("Customer Care & Returns", "Customer care, returns, cancellations and refunds at House of Induka."),
  component: () => <InformationPage title="Customer Care & Returns">
    <p>
      At INDUKA, every piece is thoughtfully selected and crafted to celebrate elegance, individuality
      and timeless beauty. We want every purchase to be a delightful experience, from the moment you
      place your order to the moment you unbox it.
    </p>

    <h2 className="mt-10 text-xl text-foreground">Cancellations</h2>
    <p className="mt-2">
      You can cancel an order within 24 hours of placing it, provided it has not shipped — directly from
      your account page. Requests made after 24 hours are reviewed by our team before approval.
    </p>
    <p className="mt-4">
      Once an order has shipped it can no longer be cancelled outright; please contact us and we will
      review the options with you. Delivered orders can be returned instead (see below).
    </p>

    <h2 className="mt-10 text-xl text-foreground">Return Policy</h2>
    <p className="mt-2">We want you to be completely satisfied with your INDUKA purchase.</p>
    <ul className="mt-4 list-disc space-y-2 pl-6">
      <li><strong className="text-foreground">Return window:</strong> 7 days from the date of delivery.</li>
      <li>Products must be unused, unworn and returned in their original packaging.</li>
      <li>Original tags, authenticity cards and invoices must accompany the product.</li>
      <li>Products showing signs of wear, damage or alteration may not qualify for a return.</li>
      <li>
        For damaged, defective or incorrect products, please contact our customer care team with
        photographs or an unboxing video.
      </li>
    </ul>
    <p className="mt-4">
      Every return request is reviewed and approved by our team, and return shipping is arranged and
      paid for by House of Induka. Returned pieces are physically inspected on arrival; your refund is
      initiated only after the piece passes inspection. Final eligibility and conditions are governed
      by INDUKA's approved return policy.
    </p>

    <h2 className="mt-10 text-xl text-foreground">Refunds</h2>
    <p className="mt-2">
      We offer full refunds only — partial refunds are not available. The refunded amount is the product
      price after any discount; shipping charges are not refunded on cancellations.
    </p>
    <p className="mt-4">
      Prepaid orders are refunded to your original payment method. Cash-on-delivery refunds are made by
      bank transfer or UPI, confirmed with you directly. Refunds are estimated to reach you within
      5–7 business days of initiation; this timeline is an estimate and is not guaranteed.
    </p>

    <h2 className="mt-10 text-xl text-foreground">Contact our customer care team</h2>
    <div className="mt-4 flex flex-col gap-3">
      <a
        href="mailto:houseofinduka@gmail.com"
        className="inline-flex items-center gap-3 text-foreground underline decoration-champagne/60 underline-offset-4 transition-colors hover:text-champagne"
      >
        <span aria-hidden="true">✉</span> houseofinduka@gmail.com
      </a>
      <a
        href="tel:+917303186547"
        className="inline-flex items-center gap-3 text-foreground underline decoration-champagne/60 underline-offset-4 transition-colors hover:text-champagne"
      >
        <span aria-hidden="true">☎</span> +91 73031 86547
      </a>
      <a
        href="https://wa.me/917303186547"
        target="_blank"
        rel="noreferrer"
        className="inline-flex items-center gap-3 text-foreground underline decoration-champagne/60 underline-offset-4 transition-colors hover:text-champagne"
      >
        <span aria-hidden="true">✆</span> Chat with us on WhatsApp
      </a>
    </div>
  </InformationPage>,
});
