import { createFileRoute } from "@tanstack/react-router";
import { InformationPage, informationHead } from "@/components/layout/InformationPage";

export const Route = createFileRoute("/returns")({
  head: () => informationHead("Returns & Exchanges", "Returns, cancellations and refunds at House of Induka."),
  component: () => <InformationPage title="Returns, Cancellations & Refunds">
    <h2 className="mt-2 text-xl">Cancellations</h2>
    <p className="mt-2">
      You can cancel an order within 24 hours of placing it, provided it has not shipped — directly from
      your account page. Requests made after 24 hours are reviewed by our team before approval.
    </p>
    <p className="mt-4">
      Once an order has shipped it can no longer be cancelled outright; please contact us and we will
      review the options with you. Delivered orders can be returned instead (see below).
    </p>
    <h2 className="mt-8 text-xl">Returns</h2>
    <p className="mt-2">
      You can request a return within 7 calendar days of delivery from your account page. Every return
      is reviewed and approved by our team, and return shipping is arranged and paid for by House of Induka.
    </p>
    <p className="mt-4">
      Returned pieces are physically inspected on arrival. Your refund is initiated only after the piece
      passes inspection; pieces that fail inspection are sent back to you and are not refunded.
    </p>
    <h2 className="mt-8 text-xl">Refunds</h2>
    <p className="mt-2">
      We offer full refunds only — partial refunds are not available. The refunded amount is the product
      price after any discount; shipping charges are not refunded on cancellations.
    </p>
    <p className="mt-4">
      Prepaid orders are refunded to your original payment method. Cash-on-delivery refunds are made by
      bank transfer or UPI, confirmed with you directly. Refunds are estimated to reach you within
      5–7 business days of initiation; this timeline is an estimate and is not guaranteed.
    </p>
  </InformationPage>,
});
