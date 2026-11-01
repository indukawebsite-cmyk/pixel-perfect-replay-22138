import type { Product } from "@/lib/catalog";
import { ProductCard } from "@/components/shop/ProductCard";
export function RelatedProducts({ title, products, note }: { title: string; products: Product[]; note?: string }) {
  if (!products.length) return null;
  return <section className="border-t border-border py-12 md:py-16"><div className="container-lux"><h2 className="text-3xl md:text-4xl">{title}</h2>{note && <p className="mt-3 text-xs text-muted-foreground">{note}</p>}<div className="mt-8 grid grid-cols-2 gap-x-4 gap-y-8 md:grid-cols-4 md:gap-x-6">{products.map((product) => <ProductCard key={product.id} product={product} />)}</div></div></section>;
}