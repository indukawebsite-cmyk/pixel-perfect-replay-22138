import { useState } from "react";
import { Heart, ShoppingBag, MapPin } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { availabilityLabel, getCollection, productPriceLabel, type Product } from "@/lib/catalog";
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
  const stock = product.stock ?? 0;
  const canAdd =
    product.price !== null &&
    validQuantity(Number(quantity)) &&
    Number(quantity) <= stock &&
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
        {product.tagline && <p className="editorial mt-3 text-lg text-cocoa">{product.tagline}</p>}
        <p className="mt-4 text-xl">{productPriceLabel(product)}</p>
        <p className="mt-2 text-xs text-muted-foreground">
          {availabilityLabel(product)}
          {product.sku ? ` · SKU ${product.sku}` : ""}
        </p>
      </div>
      {product.description && (
        <p className="text-sm leading-loose text-muted-foreground">{product.description}</p>
      )}
      {product.highlights?.length ? (
        <ul className="space-y-2 border-y border-border py-5 text-sm leading-relaxed">
          {product.highlights.map((item) => (
            <li key={item} className="flex gap-3">
              <span aria-hidden="true" className="text-champagne">✦</span>
              {item}
            </li>
          ))}
        </ul>
      ) : null}
      {product.size && (
        <p className="text-sm">
          <span className="text-muted-foreground">Size · </span>
          {product.size}
        </p>
      )}
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
                `${quantity} added to your bag${variant ? ` · ${product.variants?.find((option) => option.id === variant)?.label}` : ""}. Checkout is not live yet.`,
              );
            }}
          >
            <ShoppingBag />
            {stock > 0 ? "Add to bag" : "Currently unavailable"}
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
              "Checkout and payments are not live yet. No order has been placed.",
            )
          }
        >
          Buy now
        </Button>
        <p role="status" className="min-h-5 text-xs leading-relaxed text-muted-foreground">
          {feedback ||
            (saved
              ? "Saved to your wishlist for this visit."
              : Number(quantity) > stock && stock > 0
                ? `Only ${stock} available.`
                : "Checkout is not live yet. No order or payment is taken.")}
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
