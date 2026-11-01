import { Heart } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { useWishlist } from "@/components/shop/WishlistProvider";
import { formatPrice, getCollection, type Product } from "@/lib/catalog";
import { SampleBadge } from "@/components/brand/primitives";

export function ProductCard({ product }: { product: Product }) {
  const { ids, toggle } = useWishlist();
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
        <p className="text-sm font-normal leading-relaxed text-foreground">{formatPrice(product.price)}</p>
        <p className="text-xs leading-relaxed text-muted-foreground">925 Sterling Silver</p>
      </div>
    </article>
  );
}
