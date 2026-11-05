import type { ReactNode } from "react";
import { formatPrice } from "@/lib/catalog";
import { cartTotal, type CartItem } from "@/lib/demo-cart";
import { shippingCharge, SHIPPING_POLICY } from "@/lib/shipping-policy";
export function OrderSummary({ items, children }: { items: CartItem[]; children?: ReactNode }) {
  const subtotal = cartTotal(items);
  const shipping = shippingCharge(subtotal);
  return (
    <aside className="min-w-0 border-t border-border pt-6 lg:border-l lg:border-t-0 lg:pl-8 lg:pt-0">
      <h2 className="text-3xl">Order summary</h2>
      <dl className="mt-6 space-y-4 text-sm">
        <div className="flex justify-between gap-4">
          <dt>Subtotal</dt>
          <dd>{formatPrice(subtotal)}</dd>
        </div>
        <div className="flex justify-between gap-4">
          <dt>
            Shipping{" "}
            <span className="block text-xs text-muted-foreground">
              {shipping === 0 ? "Free" : `Free above ${formatPrice(SHIPPING_POLICY.freeAboveInr)}`}
            </span>
          </dt>
          <dd>{shipping === 0 ? "Free" : formatPrice(shipping)}</dd>
        </div>
        <div className="flex justify-between gap-4 border-t border-border pt-5 text-lg font-medium">
          <dt>Total</dt>
          <dd>{formatPrice(subtotal + shipping)}</dd>
        </div>
      </dl>
      <p className="mt-4 text-xs leading-loose text-muted-foreground">
        The final amount is confirmed securely before any payment is taken.
      </p>
      <div className="mt-6 space-y-4">{children}</div>
    </aside>
  );
}
