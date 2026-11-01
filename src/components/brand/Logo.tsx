import dark from "@/assets/induka-logo-dark.png.asset.json";
import gold from "@/assets/induka-logo-gold.png.asset.json";
import word from "@/assets/induka-logo-word.png.asset.json";
import emblem from "@/assets/induka-logo-emblem.png.asset.json";

const variants = {
  /** Full lockup, black — for ivory/blush backgrounds */
  dark: { src: dark.url, w: 1640, h: 1013 },
  /** Full lockup, champagne gold — for midnight backgrounds */
  gold: { src: gold.url, w: 1640, h: 1013 },
  /** Wordmark only, black */
  wordmark: { src: word.url, w: 1986, h: 330 },
  /** Emblem only, champagne gold */
  emblem: { src: emblem.url, w: 558, h: 600 },
} as const;

// Official INDUKA logo assets, extracted unaltered from the Brand Book. Never recreate in text.
export function Logo({
  variant = "wordmark",
  className,
}: {
  variant?: keyof typeof variants;
  className?: string;
}) {
  const v = variants[variant];
  return (
    <img
      src={v.src}
      alt="INDUKA — House of Induka"
      width={v.w}
      height={v.h}
      className={`h-auto object-contain ${className ?? ""}`}
    />
  );
}
