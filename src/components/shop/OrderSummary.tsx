import { useState, type ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { formatPrice } from "@/lib/catalog";
import { orderTotals, validateCoupon } from "@/lib/demo-checkout";
import type { CartItem } from "@/lib/demo-cart";
export function OrderSummary({
  items,
  children,
  coupon = true,
}: {
  items: CartItem[];
  children?: ReactNode;
  coupon?: boolean;
}) {
  const totals = orderTotals(items);
  const [code, setCode] = useState("");
  const [message, setMessage] = useState("");
  return (
    <aside className="min-w-0 border-t border-border pt-6 lg:border-l lg:border-t-0 lg:pl-8 lg:pt-0">
      <h2 className="text-3xl">Demo order summary</h2>
      <dl className="mt-6 space-y-4 text-sm">
        <div className="flex justify-between gap-4">
          <dt>Subtotal</dt>
          <dd>{formatPrice(totals.subtotal)}</dd>
        </div>
        <div className="flex justify-between gap-4">
          <dt>
            Discount <span className="text-xs text-muted-foreground">· None</span>
          </dt>
          <dd>{formatPrice(totals.discount)}</dd>
        </div>
        <div className="flex justify-between gap-4">
          <dt>
            Shipping{" "}
            <span className="block text-xs text-muted-foreground">Illustrative estimate only</span>
          </dt>
          <dd>{formatPrice(totals.shipping)}</dd>
        </div>
        <div className="flex justify-between gap-4 border-t border-border pt-5 text-lg font-medium">
          <dt>Demo total</dt>
          <dd>{formatPrice(totals.total)}</dd>
        </div>
      </dl>
      <p className="mt-4 text-xs leading-loose text-muted-foreground">
        All amounts are illustrative. ₹150 is a sample shipping estimate, not an approved charge.
        Taxes and actual delivery charges are not calculated.
      </p>
      {coupon && (
        <form
          className="mt-6"
          onSubmit={(event) => {
            event.preventDefault();
            setMessage(validateCoupon(code).message);
          }}
        >
          <label htmlFor="demo-coupon" className="text-xs font-medium">
            Demo coupon code
          </label>
          <div className="mt-2 flex gap-2">
            <input
              id="demo-coupon"
              value={code}
              maxLength={24}
              onChange={(event) => {
                setCode(event.target.value);
                setMessage("");
              }}
              className="h-11 min-w-0 flex-1 border border-input bg-transparent px-3 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
            />
            <Button variant="outline" type="submit" className="h-11">
              Apply
            </Button>
          </div>
          <p role="status" className="mt-2 text-xs leading-relaxed text-muted-foreground">
            {message || "Test code: DEMO. No promotional discount."}
          </p>
        </form>
      )}
      <div className="mt-6 space-y-4">{children}</div>
    </aside>
  );
}
