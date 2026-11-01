import { Minus, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { validQuantity } from "@/lib/product-detail";
export function QuantitySelector({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) {
  const quantity = Number(value);
  const valid = validQuantity(quantity);
  return (
    <div>
      <label htmlFor="product-quantity" className="mb-2 block text-xs font-medium">
        Quantity
      </label>
      <div className="inline-flex h-12 items-center border border-border">
        <Button
          variant="ghost"
          size="icon"
          className="h-11 w-11"
          aria-label="Decrease quantity"
          disabled={!valid || quantity <= 1}
          onClick={() => onChange(String(quantity - 1))}
        >
          <Minus />
        </Button>
        <input
          id="product-quantity"
          type="number"
          min="1"
          step="1"
          value={value}
          aria-invalid={!valid}
          aria-describedby={!valid ? "quantity-error" : undefined}
          onChange={(e) => onChange(e.target.value)}
          className="h-11 w-16 bg-transparent text-center text-sm outline-none focus-visible:ring-1 focus-visible:ring-ring"
        />
        <Button
          variant="ghost"
          size="icon"
          className="h-11 w-11"
          aria-label="Increase quantity"
          disabled={!valid || !validQuantity(quantity + 1)}
          onClick={() => onChange(String(quantity + 1))}
        >
          <Plus />
        </Button>
      </div>
      {!valid && (
        <p id="quantity-error" className="mt-2 text-xs text-destructive">
          Enter a whole quantity of at least 1.
        </p>
      )}
    </div>
  );
}
