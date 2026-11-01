import { Heart } from "lucide-react";
import { useState } from "react";
import { formatPrice, getCollection, type Product } from "@/lib/catalog";
import { SampleBadge } from "@/components/brand/primitives";

export function ProductCard({ product }: { product: Product }) {
  const [saved, setSaved] = useState(false);
  const col = getCollection(product.collection);
  return (
    <article className="group flex flex-col">
      <div className="relative aspect-[4/5] overflow-hidden bg-muted">
        <img
          src={product.image}
          alt={`${product.name} — placeholder image`}
          loading="lazy"
          width={800}
          height={1000}
          className="h-full w-full object-cover transition-transform duration-[1400ms] ease-[var(--ease-lux)] group-hover:scale-[1.04]"
        />
        <div className="absolute left-3 top-3 flex gap-2">
          {product.tag && (
            <span className="eyebrow bg-midnight px-2 py-1 text-[0.55rem] tracking-[0.2em] text-ivory">{product.tag}</span>
          )}
          <SampleBadge />
        </div>
        <button
          type="button"
          onClick={() => setSaved((s) => !s)}
          aria-label={saved ? "Remove from wishlist" : "Add to wishlist"}
          aria-pressed={saved}
          className="absolute right-3 top-3 grid h-9 w-9 place-items-center rounded-full bg-ivory/80 text-midnight backdrop-blur transition hover:bg-ivory"
        >
          <Heart className={`h-4 w-4 ${saved ? "fill-dusty-rose text-dusty-rose" : ""}`} strokeWidth={1.25} />
        </button>
      </div>
      <div className="flex flex-col gap-1 pt-4">
        {col && <span className="eyebrow text-[0.6rem] text-champagne">{col.name}</span>}
        <h3 className="font-sans text-sm font-normal tracking-wide text-foreground">{product.name}</h3>
        <p className="text-xs text-muted-foreground">925 Sterling Silver · {formatPrice(product.price)}</p>
      </div>
    </article>
  );
}
