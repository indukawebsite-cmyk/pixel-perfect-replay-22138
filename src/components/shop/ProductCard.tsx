import { Heart, Plus } from "lucide-react";
import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { useWishlist } from "@/components/shop/WishlistProvider";
import { formatPrice, productPriceLabel, getCollection, type Product } from "@/lib/catalog";
import { useCart } from "@/components/shop/CartProvider";
import { SampleBadge } from "@/components/brand/primitives";

export function ProductCard({ product, shopping = false }: { product: Product; shopping?: boolean }) {
  const { ids, toggle } = useWishlist();
  const { add } = useCart();
  const [added, setAdded] = useState(false);
  const saved = ids.includes(product.id);
  const col = getCollection(product.collection);
  return (
    <article className="group flex flex-col">
      <div className="relative aspect-[4/5] overflow-hidden bg-muted">
        <Link to="/products/$productId" params={{ productId: product.id }} aria-label={`View ${product.name}`} className="block h-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring">
        <img
          src={product.image}
          alt={`${product.name} — placeholder image`}
          loading="lazy"
          width={800}
          height={1000}
          className="h-full w-full object-cover object-center transition duration-1000 ease-[var(--ease-lux)] group-hover:scale-[1.025] group-hover:brightness-105 motion-reduce:transform-none motion-reduce:transition-none"
        />
        {product.secondaryImage && <img src={product.secondaryImage} alt={`${product.name} — second demo view`} loading="lazy" className="absolute inset-0 h-full w-full object-cover opacity-0 transition-opacity duration-700 group-hover:opacity-100 group-focus-within:opacity-100 motion-reduce:transition-none" />}
        </Link>
        <div className="absolute left-3 top-3 flex gap-2">
          <SampleBadge />
        </div>
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
        {col && <span className="eyebrow text-[0.6rem] text-cocoa">{col.name}</span>}
        <h3 className="font-sans text-sm font-medium leading-relaxed text-foreground"><Link to="/products/$productId" params={{ productId: product.id }} className="hover:underline underline-offset-4">{product.name}</Link></h3>
        <p className="text-sm font-normal leading-relaxed text-foreground">{shopping || product.demoPrice !== undefined ? productPriceLabel(product) : formatPrice(product.price)}</p>
        <p className="text-xs leading-relaxed text-muted-foreground">{shopping || product.demoPrice !== undefined ? "Demo piece · Not for sale" : "925 Sterling Silver"}</p>
        {shopping && product.demoPrice !== undefined && <><Button variant="luxOutline" className="mt-2 h-11 w-full px-2 text-[0.6rem] tracking-normal" onClick={() => { add(product.id); setAdded(true); }} aria-label={`Add ${product.name} to demo bag`}><Plus />{added ? "Add another" : "Add to demo bag"}</Button><span role="status" className="sr-only">{added ? `${product.name} added to demo bag.` : ""}</span></>}
      </div>
    </article>
  );
}
