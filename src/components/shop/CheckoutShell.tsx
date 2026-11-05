import { Link } from "@tanstack/react-router";
import { ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
export function EmptyCart({ title = "Your bag is empty" }: { title?: string }) {
  return (
    <div className="flex flex-col items-center gap-5 py-16 text-center">
      <ShoppingBag className="h-10 w-10 text-cocoa" strokeWidth={1} />
      <h2 className="text-3xl">{title}</h2>
      <p className="max-w-sm text-sm leading-loose text-muted-foreground">
        Browse the collection to find your next piece.
      </p>
      <Button asChild variant="lux" size="xl">
        <Link to="/shop">Continue shopping</Link>
      </Button>
    </div>
  );
}
export function CheckoutSteps({ active }: { active: "cart" | "checkout" | "confirmation" }) {
  return (
    <nav aria-label="Checkout steps" className="mb-8 flex flex-wrap gap-5 text-xs">
      <Link
        to="/cart"
        aria-current={active === "cart" ? "step" : undefined}
        className={active === "cart" ? "font-medium text-foreground" : "text-muted-foreground"}
      >
        01 Bag
      </Link>
      <Link
        to="/checkout"
        aria-current={active === "checkout" ? "step" : undefined}
        className={active === "checkout" ? "font-medium text-foreground" : "text-muted-foreground"}
      >
        02 Checkout
      </Link>
      <span
        aria-current={active === "confirmation" ? "step" : undefined}
        className={
          active === "confirmation" ? "font-medium text-foreground" : "text-muted-foreground"
        }
      >
        03 Confirmation
      </span>
    </nav>
  );
}
