import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ChevronRight } from "lucide-react";
import { getProduct, getCollection } from "@/lib/catalog";
import { ProductGallery } from "@/components/shop/ProductGallery";
import { ProductInformation } from "@/components/shop/ProductInformation";
import { RelatedProducts } from "@/components/shop/RelatedProducts";
import { useRecentlyViewed } from "@/components/shop/RecentlyViewedProvider";
import { relatedProducts } from "@/lib/product-detail";
import { ShoppingError, ProductNotFound } from "@/components/shop/RouteFeedback";
import { useEffect } from "react";

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
  const { ids, record } = useRecentlyViewed();
  useEffect(() => { record(product.id); }, [product.id, record]);
  const recent = ids.filter((id) => id !== product.id).map(getProduct).filter((item) => item !== undefined).slice(0, 4);
  return <><section className="container-lux pb-12 pt-6 md:pb-16 md:pt-8"><nav aria-label="Breadcrumb" className="mb-8 flex flex-wrap items-center gap-2 text-xs leading-relaxed text-muted-foreground"><Link to="/">Home</Link><ChevronRight className="h-3 w-3" /><Link to="/shop">All jewellery</Link>{collection && <><ChevronRight className="h-3 w-3" /><Link to="/collections/$slug" params={{ slug: collection.slug }}>{collection.name}</Link></>}<ChevronRight className="h-3 w-3" /><span aria-current="page" className="text-foreground">{product.name}</span></nav><div className="grid items-start gap-8 md:grid-cols-2 md:gap-10 lg:gap-16"><ProductGallery key={`gallery-${product.id}`} product={product} /><ProductInformation key={product.id} product={product} /></div></section><RelatedProducts title="From the same moon" note="Related demo pieces · Not for sale" products={relatedProducts(product)} /><RelatedProducts title="Recently viewed" note="For this visit only" products={recent} /></>;
}
