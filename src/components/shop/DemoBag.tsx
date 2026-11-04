import { Link } from "@tanstack/react-router";
import { Minus, Plus, ShoppingBag, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCart } from "@/components/shop/CartProvider";
import { formatPrice, getProduct, productPriceLabel } from "@/lib/catalog";
import { cartTotal } from "@/lib/demo-cart";
import { useLiveCatalog } from "@/lib/live-catalog";
import { SafeImage } from "@/components/shop/SafeImage";
export function DemoBag({ onNavigate }: { onNavigate: () => void }) {
  const { items, setQuantity } = useCart();
  useLiveCatalog();
  return (
    <div className="flex flex-1 flex-col gap-6">
      <p className="border-y border-border py-4 text-sm leading-relaxed text-muted-foreground">
        Checkout is not live yet · No orders or payments are taken. Your bag stays in this tab across refreshes.
      </p>
      {!items.length ? (
        <div className="flex flex-1 flex-col items-center justify-center gap-5 py-12 text-center">
          <ShoppingBag className="h-8 w-8 text-cocoa" strokeWidth={1} />
          <h2 className="text-3xl">Your bag is empty</h2>
          <Button asChild variant="lux" size="xl">
            <Link to="/shop" onClick={onNavigate}>
              Browse jewellery
            </Link>
          </Button>
        </div>
      ) : (
        <>
          {items.map((item) => {
            const product = getProduct(item.productId);
            if (!product) return null;
            return (
              <div
                key={`${item.productId}-${item.variantId ?? "default"}`}
                className="grid grid-cols-[4.5rem_minmax(0,1fr)] gap-4 border-b border-border pb-6"
              >
                <Link
                  to="/products/$productId"
                  params={{ productId: product.id }}
                  onClick={onNavigate}
                >
                  <SafeImage
                    src={product.image}
                    alt={product.name}
                    className="aspect-[4/5] w-full object-cover"
                  />
                </Link>
                <div className="min-w-0">
                  <Link
                    to="/products/$productId"
                    params={{ productId: product.id }}
                    onClick={onNavigate}
                    className="text-sm font-medium leading-relaxed"
                  >
                    {product.name}
                  </Link>
                  <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
                    {productPriceLabel(product)}
                  </p>
                  {item.variantId && (
                    <p className="mt-1 text-xs text-muted-foreground">
                      {product.variants?.find((variant) => variant.id === item.variantId)?.label}
                    </p>
                  )}
                  <div className="mt-3 flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-11 w-10"
                      aria-label={`Decrease quantity of ${product.name}`}
                      onClick={() => setQuantity(product.id, item.quantity - 1, item.variantId)}
                    >
                      <Minus />
                    </Button>
                    <output
                      aria-label={`Quantity of ${product.name}`}
                      className="w-8 text-center text-sm"
                    >
                      {item.quantity}
                    </output>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-11 w-10"
                      aria-label={`Increase quantity of ${product.name}`}
                      onClick={() => setQuantity(product.id, item.quantity + 1, item.variantId)}
                    >
                      <Plus />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="ml-auto h-11 w-10"
                      aria-label={`Remove ${product.name} from bag`}
                      onClick={() => setQuantity(product.id, 0, item.variantId)}
                    >
                      <Trash2 />
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
          <div className="mt-auto flex flex-col gap-4 border-t border-border pt-6">
            <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4">
              <span className="text-sm">Demo subtotal</span>
              <span className="text-lg font-medium">{formatPrice(cartTotal(items))}</span>
            </div>
            <p className="text-xs leading-relaxed text-muted-foreground">
              Illustrative total only. Demo checkout never creates a real order or payment.
            </p>
            <Button asChild variant="lux" size="xl">
              <Link to="/cart" onClick={onNavigate}>
                View demo bag
              </Link>
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
