import { Heart, Plus } from "lucide-react";
import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { useWishlist } from "@/components/shop/WishlistProvider";
import { availabilityLabel, formatPrice, isOnSale, productPriceLabel, salePercent, type Product } from "@/lib/catalog";
import { useCart } from "@/components/shop/CartProvider";
import { SafeImage } from "@/components/shop/SafeImage";

export function ProductCard({ product, shopping = false }: { product: Product; shopping?: boolean }) {
  const { ids, toggle } = useWishlist();
  const { add } = useCart();
  const [added, setAdded] = useState(false);
  const saved = ids.includes(product.id);
  const available = product.price !== null && (product.stock ?? 0) > 0;
  const onSale = isOnSale(product);
  const second = product.gallery?.[1]?.thumb || product.gallery?.[1]?.src;
  return (
    <article className="group flex flex-col">
      <div className="relative aspect-[4/5] overflow-hidden bg-muted">
        <Link to="/products/$productId" params={{ productId: product.id }} aria-label={`View ${product.name}`} className="block h-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring">
          <SafeImage
            src={product.thumbnail || product.image}
            alt={product.gallery?.[0]?.alt ?? product.name}
            loading="lazy"
            decoding="async"
            sizes="(min-width: 768px) 25vw, 50vw"
            width={800}
            height={1000}
            className="h-full w-full object-cover object-center transition duration-1000 ease-[var(--ease-lux)] group-hover:scale-[1.025] group-hover:brightness-105 motion-reduce:transform-none motion-reduce:transition-none"
          />
          {second && <img src={second} alt="" aria-hidden="true" loading="lazy" decoding="async" onError={(e) => { e.currentTarget.style.display = "none"; }} className="absolute inset-0 h-full w-full object-cover opacity-0 transition-opacity duration-700 group-hover:opacity-100 motion-reduce:transition-none" />}
        </Link>
        {onSale && (
          <span className="absolute left-2 top-2 bg-midnight px-2.5 py-1 text-[0.6rem] font-medium uppercase tracking-[0.18em] text-champagne">
            {salePercent(product)}% off
          </span>
        )}
        <Button variant="ghost" size="icon"
          type="button"
          onClick={() => toggle(product.id)}
          aria-label={saved ? "Remove from wishlist" : "Add to wishlist"}
          aria-pressed={saved}
          title={saved ? "Remove from wishlist" : "Add to wishlist"}
          className="absolute right-2 top-2 h-11 w-11 rounded-full bg-ivory/95 text-midnight backdrop-blur transition hover:bg-ivory"
        >
          <Heart className={`h-4 w-4 ${saved ? "fill-dusty-rose text-dusty-rose" : ""}`} strokeWidth={1.25} />
        </Button>
      </div>
      <div className="flex min-w-0 flex-col gap-2 pt-5">
        <h3 className="font-sans text-sm font-medium leading-relaxed text-foreground"><Link to="/products/$productId" params={{ productId: product.id }} className="hover:underline underline-offset-4">{product.name}</Link></h3>
        {onSale && <p className="text-[0.65rem] font-medium uppercase tracking-[0.22em] text-champagne">Diwali Special Sale</p>}
        <p className="text-sm font-normal leading-relaxed text-foreground">
          {onSale && <span className="mr-2 text-muted-foreground line-through">{formatPrice(product.compareAtPrice!)}</span>}
          {productPriceLabel(product)}
        </p>
        <p className="text-xs leading-relaxed text-muted-foreground">{availabilityLabel(product)}</p>
        {shopping && available && <><Button variant="luxOutline" className="mt-2 h-11 w-full px-2 text-[0.6rem] tracking-normal" onClick={() => { add(product.id); setAdded(true); }} aria-label={`Add ${product.name} to bag`}><Plus />{added ? "Add another" : "Add to bag"}</Button><span role="status" className="sr-only">{added ? `${product.name} added to bag.` : ""}</span></>}
      </div>
    </article>
  );
}
