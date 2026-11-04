import { useState, type ImgHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

/** Product photo that falls back to a quiet branded panel when a signed URL fails or expires. */
export function SafeImage({ src, alt, className, ...rest }: ImgHTMLAttributes<HTMLImageElement>) {
  const [failedSrc, setFailedSrc] = useState<string | undefined>();
  if (!src || failedSrc === src)
    return (
      <div
        role="img"
        aria-label={`${alt ?? "Product image"} — image unavailable`}
        className={cn("flex items-center justify-center bg-muted text-center", className)}
      >
        <span className="eyebrow px-2 text-[0.55rem] text-muted-foreground">Image unavailable</span>
      </div>
    );
  return <img src={src} alt={alt} className={className} onError={() => setFailedSrc(src)} {...rest} />;
}
