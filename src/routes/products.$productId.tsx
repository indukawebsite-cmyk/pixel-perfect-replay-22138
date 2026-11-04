import { createFileRoute, Link } from "@tanstack/react-router";
import { ChevronRight } from "lucide-react";
import { getProduct, getCollection, type Product } from "@/lib/catalog";
import { useLiveCatalog } from "@/lib/live-catalog";
import { ProductGallery } from "@/components/shop/ProductGallery";
import { ProductInformation } from "@/components/shop/ProductInformation";
import { RelatedProducts } from "@/components/shop/RelatedProducts";
import { useRecentlyViewed } from "@/components/shop/RecentlyViewedProvider";
import { relatedProducts } from "@/lib/product-detail";
import { ShoppingError, ProductNotFound } from "@/components/shop/RouteFeedback";
import { useEffect } from "react";

export const Route = createFileRoute("/products/$productId")({
  head: () => {
    const title = "Jewellery — House of Induka";
    const description = "925 sterling silver jewellery from House of Induka, inspired by the moon.";
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        { property: "og:type", content: "website" },
        { name: "twitter:card", content: "summary_large_image" },
        { name: "robots", content: "noindex" },
      ],
    };
  },
  errorComponent: ShoppingError,
  notFoundComponent: ProductNotFound,
  component: ProductPage,
});
function ProductPage() {
  const { productId } = Route.useParams();
  const { status } = useLiveCatalog();
  const product = getProduct(productId);
  if (!product && (status === "idle" || status === "loading"))
    return (
      <section role="status" aria-label="Loading piece" className="container-lux grid gap-8 py-12 md:grid-cols-2">
        <div className="aspect-[4/5] animate-pulse bg-muted motion-reduce:animate-none" />
        <div className="space-y-4"><div className="h-10 w-2/3 bg-muted" /><div className="h-6 w-1/3 bg-muted" /></div>
      </section>
    );
  if (!product) return <ProductNotFound />;
  return <ProductView product={product} />;
}
function ProductView({ product }: { product: Product }) {
  const collection = getCollection(product.collection);
  const { ids, record } = useRecentlyViewed();
  useEffect(() => {
    document.title = `${product.name} — House of Induka`;
    record(product.id);
  }, [product.id, record]);
  const recent = ids
    .filter((id) => id !== product.id)
    .map(getProduct)
    .filter((item) => item !== undefined)
    .slice(0, 4);
  return (
    <>
      <section className="container-lux pb-12 pt-6 md:pb-16 md:pt-8">
        <nav
          aria-label="Breadcrumb"
          className="mb-8 flex flex-wrap items-center gap-2 text-xs leading-relaxed text-muted-foreground"
        >
          <Link to="/">Home</Link>
          <ChevronRight className="h-3 w-3" />
          <Link to="/shop">All jewellery</Link>
          {collection && (
            <>
              <ChevronRight className="h-3 w-3" />
              <Link to="/collections/$slug" params={{ slug: collection.slug }}>
                {collection.name}
              </Link>
            </>
          )}
          <ChevronRight className="h-3 w-3" />
          <span aria-current="page" className="text-foreground">
            {product.name}
          </span>
        </nav>
        <div className="grid items-start gap-8 md:grid-cols-2 md:gap-10 lg:gap-16">
          <ProductGallery key={`gallery-${product.id}`} product={product} />
          <ProductInformation key={product.id} product={product} />
        </div>
      </section>
      <RelatedProducts
        title="From the same moon"
        note="More from House of Induka"
        products={relatedProducts(product)}
      />
      <RelatedProducts title="Recently viewed" note="For this visit only" products={recent} />
    </>
  );
}
