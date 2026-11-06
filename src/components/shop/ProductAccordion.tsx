import { Link } from "@tanstack/react-router";
import type { Product } from "@/lib/catalog";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
export function ProductAccordion({ product }: { product: Product }) {
  const specs: [string, string][] = [
    ...(product.sku ? [["SKU", product.sku] as [string, string]] : []),
    ...(product.material ? [["Material", product.material] as [string, string]] : []),
    ...(product.purity ? [["Purity", product.purity] as [string, string]] : []),
    ...(product.size ? [["Size", product.size] as [string, string]] : []),
    ...(product.stock !== undefined
      ? [["Availability", product.stock > 0 ? "In stock" : "Currently unavailable"] as [string, string]]
      : []),
  ];
  return (
    <Accordion type="multiple" className="border-t border-border">
      <AccordionItem value="details">
        <AccordionTrigger>Product details</AccordionTrigger>
        <AccordionContent className="leading-loose text-muted-foreground">
          {specs.length ? (
            <dl className="space-y-2">
              {specs.map(([key, value]) => (
                <div key={key} className="flex flex-wrap justify-between gap-4">
                  <dt>{key}</dt>
                  <dd>{String(value)}</dd>
                </div>
              ))}
            </dl>
          ) : (
            <p>
              Product details will be added soon.
            </p>
          )}
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="care">
        <AccordionTrigger>Jewellery care</AccordionTrigger>
        <AccordionContent className="leading-loose text-muted-foreground">
          <p>
            General care: store pieces separately in a dry place, avoid contact with perfume and
            household chemicals, and wipe gently with a soft cloth. Material-specific care will
            accompany each piece.
          </p>
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="shipping">
        <AccordionTrigger>Shipping &amp; returns</AccordionTrigger>
        <AccordionContent className="leading-loose text-muted-foreground">
          <p>
            Delivery times, charges and return terms are awaiting approval and will be shown here
            before checkout opens.
          </p>
          <div className="mt-3 flex flex-wrap gap-5">
            <Link to="/shipping" className="underline underline-offset-4">
              Shipping information
            </Link>
            <Link to="/returns" className="underline underline-offset-4">
              Return information
            </Link>
          </div>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}
