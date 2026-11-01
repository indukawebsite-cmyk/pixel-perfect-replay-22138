import { useState } from "react";
import { Heart, ShoppingBag, MapPin } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { getCollection, productPriceLabel, type Product } from "@/lib/catalog";
import { validPin, validQuantity } from "@/lib/product-detail";
import { Button } from "@/components/ui/button";
import { useCart } from "@/components/shop/CartProvider";
import { useWishlist } from "@/components/shop/WishlistProvider";
import { QuantitySelector } from "@/components/shop/QuantitySelector";
import { VariantSelector } from "@/components/shop/VariantSelector";
import { ProductAccordion } from "@/components/shop/ProductAccordion";
export function ProductInformation({ product }: { product: Product }) {
  const collection = getCollection(product.collection);
  const { add } = useCart();
  const { ids, toggle } = useWishlist();
  const [quantity, setQuantity] = useState("1");
  const [variant, setVariant] = useState(product.variants?.[0]?.id);
  const [feedback, setFeedback] = useState("");
  const [pin, setPin] = useState("");
  const [pinFeedback, setPinFeedback] = useState("");
  const saved = ids.includes(product.id);
  const canAdd =
    product.demoPrice !== undefined &&
    validQuantity(Number(quantity)) &&
    (!product.variants?.length || product.variants.some((option) => option.id === variant));
  return (
    <div className="min-w-0 space-y-6 lg:py-3">
      {collection && (
        <Link
          to="/collections/$slug"
          params={{ slug: collection.slug }}
          className="eyebrow text-cocoa"
        >
          {collection.name}
        </Link>
      )}
      <div>
        <h1 className="text-4xl leading-tight md:text-5xl">{product.name}</h1>
        <p className="mt-4 text-xl">{productPriceLabel(product)}</p>
        <p className="mt-2 text-xs text-muted-foreground">Demo piece · Not for sale</p>
      </div>
      <p className="text-sm leading-loose text-muted-foreground">
        {product.description ??
          "Sample preview only. Official photography, description, materials and pricing are awaiting confirmation. This is not a purchasable product."}
      </p>
      <VariantSelector
        variants={product.variants}
        selected={variant}
        onSelect={(id) => {
          setVariant(id);
          setFeedback("");
        }}
      />
      <QuantitySelector
        value={quantity}
        onChange={(value) => {
          setQuantity(value);
          setFeedback("");
        }}
      />
      <div className="space-y-3">
        <div className="grid grid-cols-[minmax(0,1fr)_3.25rem] gap-3">
          <Button
            variant="lux"
            className="h-13 w-full tracking-normal"
            disabled={!canAdd}
            onClick={() => {
              add(product.id, Number(quantity), variant);
              setFeedback(
                `${quantity} added to your demo bag${variant ? ` · ${product.variants?.find((option) => option.id === variant)?.label}` : ""}. No order placed.`,
              );
            }}
          >
            <ShoppingBag />
            Add to demo bag
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="h-13 w-13"
            aria-label={saved ? "Remove from wishlist" : "Save to wishlist"}
            aria-pressed={saved}
            title={saved ? "Remove from wishlist" : "Save to wishlist"}
            onClick={() => toggle(product.id)}
          >
            <Heart className={saved ? "fill-dusty-rose text-dusty-rose" : ""} />
          </Button>
        </div>
        <Button
          variant="luxOutline"
          className="h-13 w-full tracking-normal"
          disabled={!canAdd}
          onClick={() =>
            setFeedback(
              "Demo only: checkout and payments are not connected. No order has been placed.",
            )
          }
        >
          Buy now · Demo only
        </Button>
        <p role="status" className="min-h-5 text-xs leading-relaxed text-muted-foreground">
          {feedback ||
            (saved
              ? "Saved to your wishlist for this visit."
              : "Visit-only demo bag. No checkout or payment.")}
        </p>
      </div>
      <form
        className="border-y border-border py-5"
        onSubmit={(e) => {
          e.preventDefault();
          setPinFeedback(
            validPin(pin)
              ? "Valid format. Delivery availability cannot be checked yet; shipping is not connected."
              : "Enter a valid 6-digit Indian PIN code.",
          );
        }}
      >
        <label htmlFor="delivery-pin" className="flex items-center gap-2 text-xs font-medium">
          <MapPin className="h-4 w-4" />
          Delivery PIN code · Non-live
        </label>
        <div className="mt-3 flex gap-2">
          <input
            id="delivery-pin"
            inputMode="numeric"
            autoComplete="postal-code"
            maxLength={6}
            value={pin}
            onChange={(e) => {
              setPin(e.target.value);
              setPinFeedback("");
            }}
            placeholder="Enter PIN code"
            className="h-11 min-w-0 flex-1 border border-input bg-transparent px-3 text-sm outline-none focus:ring-1 focus:ring-ring"
          />
          <Button variant="outline" type="submit" className="h-11">
            Check
          </Button>
        </div>
        <p role="status" className="mt-2 text-xs leading-relaxed text-muted-foreground">
          {pinFeedback || "Demo format check only. No delivery promise."}
        </p>
      </form>
      <ProductAccordion product={product} />
    </div>
  );
}
