import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { Heart, ArrowLeft } from "lucide-react";
import { getProduct, getCollection, productPriceLabel } from "@/lib/catalog";
import { SampleBadge } from "@/components/brand/primitives";
import { Button } from "@/components/ui/button";
import { ShoppingError, ProductNotFound } from "@/components/shop/RouteFeedback";
import { useCart } from "@/components/shop/CartProvider";
import { useState } from "react";
import { useWishlist } from "@/components/shop/WishlistProvider";

export const Route = createFileRoute("/products/$productId")({
  loader: ({ params }) => { const product = getProduct(params.productId); if (!product) throw notFound(); return { product }; },
  head: ({ loaderData }) => { const title = `${loaderData?.product.name ?? "Piece not found"} — INDUKA`; const description = "Sample jewellery preview from House of Induka. Actual specifications and pricing will be confirmed at launch."; return { meta: [{ title }, { name: "description", content: description }, { property: "og:title", content: title }, { property: "og:description", content: description }, { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary_large_image" }, { name: "robots", content: "noindex" }] }; },
  errorComponent: ShoppingError,
  notFoundComponent: ProductNotFound,
  component: ProductPage,
});
function ProductPage() {
  const { product } = Route.useLoaderData();
  const collection = getCollection(product.collection);
  const { ids, toggle } = useWishlist();
  const saved = ids.includes(product.id);
  const { add } = useCart();
  const [added, setAdded] = useState(false);
  return <section className="container-lux py-10 md:py-16"><Link to="/shop" className="mb-8 inline-flex items-center gap-2 text-sm"><ArrowLeft className="h-4 w-4" />All jewellery</Link><div className="grid gap-10 md:grid-cols-2 md:gap-16"><div className="relative"><img src={product.image} alt={`${product.name} — sample image`} className="aspect-[4/5] w-full object-cover" /><SampleBadge className="absolute left-4 top-4" /></div><div className="flex min-w-0 flex-col justify-center gap-6">{collection && <Link to="/collections/$slug" params={{ slug: collection.slug }} className="eyebrow text-cocoa">{collection.name}</Link>}<h1 className="text-4xl leading-tight md:text-5xl">{product.name}</h1><p className="text-lg">{productPriceLabel(product)}</p><p className="text-sm leading-loose text-muted-foreground">Sample preview only. This is not a purchasable product. Official photography, dimensions, materials and pricing are awaiting confirmation.</p>{product.demoPrice !== undefined && <Button variant="lux" className="h-13 w-full" onClick={() => { add(product.id); setAdded(true); }}>Add to demo bag</Button>}<p role="status" className="text-sm text-muted-foreground">{added ? "Added to your demo bag for this visit. No order has been placed." : ""}</p><Button variant="luxOutline" className="h-13 w-full" onClick={() => toggle(product.id)} aria-pressed={saved}><Heart className={saved ? "fill-dusty-rose text-dusty-rose" : ""} />{saved ? "Remove from wishlist" : "Save to wishlist"}</Button><p role="status" className="text-sm text-muted-foreground">{saved ? "Saved to your wishlist for this visit." : "Purchasing opens with the real catalogue."}</p><Link to="/wishlist" className="text-sm underline underline-offset-4">View wishlist</Link></div></div></section>;
}
