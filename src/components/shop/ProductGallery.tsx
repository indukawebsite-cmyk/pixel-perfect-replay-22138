import { useState } from "react";
import { ChevronLeft, ChevronRight, Expand, RotateCcw, ZoomIn, ZoomOut } from "lucide-react";
import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { productGallery } from "@/lib/product-detail";
import type { Product } from "@/lib/catalog";
export function ProductGallery({ product }: { product: Product }) {
  const images = productGallery(product);
  const [active, setActive] = useState(0);
  const [open, setOpen] = useState(false);
  const image = images[active] ?? images[0];
  if (!image) return null;
  const step = (delta: number) =>
    setActive((current) => (current + delta + images.length) % images.length);
  return (
    <div className="min-w-0">
      <div className="relative aspect-[4/5] overflow-hidden bg-muted">
        <Button
          variant="ghost"
          aria-label={`Open full-screen gallery for ${product.name}`}
          onClick={() => setOpen(true)}
          className="block h-full w-full rounded-none p-0"
        >
          <img
            src={image.src}
            alt={`${product.name} — ${image.label}`}
            className={
              image.detailCrop
                ? "h-full w-full scale-150 object-cover"
                : "h-full w-full object-cover"
            }
          />
        </Button>
        <span className="pointer-events-none absolute left-4 top-4 bg-background/95 px-3 py-2 text-[0.6rem] uppercase">
          Sample image
        </span>
        <Button
          variant="outline"
          size="icon"
          aria-label="Zoom image"
          title="Zoom image"
          className="absolute bottom-4 right-4 h-11 w-11 bg-background"
          onClick={() => setOpen(true)}
        >
          <Expand />
        </Button>
      </div>
      <div className="mt-4 flex gap-3">
        {images.map((item, index) => (
          <Button
            key={`${item.label}-${index}`}
            variant="ghost"
            onClick={() => setActive(index)}
            aria-label={`View ${item.label}`}
            aria-pressed={active === index}
            className={`h-20 w-16 shrink-0 overflow-hidden rounded-none border p-0 ${active === index ? "border-primary ring-1 ring-primary" : "border-border"}`}
          >
            <img
              src={item.src}
              alt=""
              className={
                item.detailCrop
                  ? "h-full w-full scale-150 object-cover"
                  : "h-full w-full object-cover"
              }
            />
          </Button>
        ))}
      </div>
      <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
        {image.label}. Official product photography is pending.
      </p>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="flex h-dvh max-h-dvh w-screen max-w-none flex-col rounded-none border-0 p-4 sm:rounded-none md:p-8">
          <DialogTitle className="pr-10 font-sans text-sm leading-relaxed">
            {product.name}
          </DialogTitle>
          <DialogDescription className="text-xs">{image.label} · Sample image</DialogDescription>
          <TransformWrapper
            key={active}
            minScale={1}
            maxScale={4}
            centerOnInit
            wheel={{ step: 0.08 }}
          >
            {({ zoomIn, zoomOut, resetTransform }) => (
              <>
                <div className="gallery-zoom flex min-h-0 flex-1 items-center justify-center overflow-hidden bg-muted">
                  <TransformComponent wrapperClass="!h-full !w-full" contentClass="!h-full !w-full">
                    <div className="flex h-full w-full items-center justify-center overflow-hidden">
                      <img
                        src={image.src}
                        alt={`${product.name} — enlarged ${image.label}`}
                        className={
                          image.detailCrop
                            ? "h-full w-full scale-150 object-contain"
                            : "h-full w-full object-contain"
                        }
                      />
                    </div>
                  </TransformComponent>
                </div>
                <div className="flex flex-wrap items-center justify-center gap-2">
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-11 w-11"
                    aria-label="Previous image"
                    title="Previous image"
                    onClick={() => step(-1)}
                  >
                    <ChevronLeft />
                  </Button>
                  <output className="w-14 text-center text-xs">
                    {active + 1} / {images.length}
                  </output>
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-11 w-11"
                    aria-label="Next image"
                    title="Next image"
                    onClick={() => step(1)}
                  >
                    <ChevronRight />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-11 w-11"
                    aria-label="Zoom in"
                    title="Zoom in"
                    onClick={() => zoomIn()}
                  >
                    <ZoomIn />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-11 w-11"
                    aria-label="Zoom out"
                    title="Zoom out"
                    onClick={() => zoomOut()}
                  >
                    <ZoomOut />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-11 w-11"
                    aria-label="Reset zoom"
                    title="Reset zoom"
                    onClick={() => resetTransform()}
                  >
                    <RotateCcw />
                  </Button>
                </div>
              </>
            )}
          </TransformWrapper>
        </DialogContent>
      </Dialog>
    </div>
  );
}
