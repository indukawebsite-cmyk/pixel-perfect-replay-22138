import { useRef, useState } from "react";
import { Link } from "@tanstack/react-router";
import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { MoveRight } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { menCampaignImage, womenCampaignImage, type CampaignImage } from "@/lib/campaign";

type Slide = {
  key: "men" | "women";
  to: "/men" | "/women";
  index: string;
  eyebrow: string;
  title: string;
  line: string;
  cta: string;
  image: CampaignImage;
  /** dark artwork → ivory text; light artwork → midnight text */
  tone: "dark" | "light";
};

const slides: Slide[] = [
  {
    key: "men",
    to: "/men",
    index: "01",
    eyebrow: "Shop Men · 925 Sterling Silver",
    title: "Made to stand apart.",
    line: "Confidence in every detail.",
    cta: "Explore Men",
    image: menCampaignImage,
    tone: "dark",
  },
  {
    key: "women",
    to: "/women",
    index: "02",
    eyebrow: "Shop Women · 925 Sterling Silver",
    title: "Effortlessly distinct.",
    line: "Elegance in every detail.",
    cta: "Explore Women",
    image: womenCampaignImage,
    tone: "light",
  },
];

const easeLux = [0.22, 1, 0.36, 1] as const;

function SlideContent({ slide, align }: { slide: Slide; align: "left" | "right" }) {
  const dark = slide.tone === "dark";
  return (
    <div
      className={cn(
        "relative flex h-full flex-col justify-end gap-4 p-8 sm:p-12 md:gap-5 md:p-16",
        align === "right" && "items-end text-right",
      )}
    >
      <span className={cn("eyebrow", dark ? "text-soft-gold" : "text-cocoa")}>
        {slide.index} · {slide.eyebrow}
      </span>
      <h2
        className={cn(
          "max-w-3xl text-5xl uppercase leading-[1.04] sm:text-6xl md:text-7xl",
          dark ? "text-ivory" : "text-midnight",
        )}
      >
        {slide.title}
      </h2>
      <p className={cn("editorial text-2xl md:text-3xl", dark ? "text-champagne" : "text-cocoa")}>{slide.line}</p>
      <span
        className={cn(
          buttonVariants({ variant: dark ? "luxLight" : "lux", size: "xl" }),
          "pointer-events-none mt-2 inline-flex items-center gap-3",
        )}
      >
        {slide.cta}
        <MoveRight className="h-4 w-4 transition-transform duration-500 group-hover:translate-x-1.5" strokeWidth={1.5} />
      </span>
    </div>
  );
}

function Overlay({ tone }: { tone: Slide["tone"] }) {
  return (
    <div
      aria-hidden="true"
      className={cn(
        "absolute inset-0 transition-opacity duration-700",
        tone === "dark"
          ? "bg-gradient-to-t from-midnight/95 via-midnight/30 to-midnight/10"
          : "bg-gradient-to-t from-ivory via-ivory/45 to-transparent",
      )}
    />
  );
}

/** Desktop: stacked full-bleed panels with a subtle scroll parallax. Men first and taller (60:40 emphasis). */
function DesktopSlide({ slide, tall, align }: { slide: Slide; tall?: boolean; align: "left" | "right" }) {
  const ref = useRef<HTMLElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], reduce ? ["0%", "0%"] : ["-6%", "6%"]);

  return (
    <section ref={ref} className={cn("relative overflow-hidden", tall ? "min-h-[96svh]" : "min-h-[72svh]")}>
      <Link
        to={slide.to}
        aria-label={`${slide.cta} — ${slide.title}`}
        className="group absolute inset-0 block outline-none focus-visible:ring-2 focus-visible:ring-champagne focus-visible:ring-inset"
      >
        <motion.div style={{ y }} className="absolute -inset-y-[8%] inset-x-0">
          <img
            src={slide.image.src}
            alt={slide.image.alt}
            width={1920}
            height={1152}
            className="h-full w-full object-cover transition-transform duration-[1600ms] ease-[var(--ease-lux)] group-hover:scale-[1.03]"
          />
        </motion.div>
        <Overlay tone={slide.tone} />
        <SlideContent slide={slide} align={align} />
      </Link>
    </section>
  );
}

/** Mobile: horizontal swipe between the two campaign slides, with indicators and a swipe hint. */
function MobileCarousel() {
  const trackRef = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const [active, setActive] = useState(0);

  const onScroll = () => {
    const el = trackRef.current;
    if (!el || el.clientWidth === 0) return;
    setActive(Math.min(slides.length - 1, Math.round(el.scrollLeft / el.clientWidth)));
  };

  const goTo = (i: number) => {
    const el = trackRef.current;
    el?.scrollTo({ left: i * el.clientWidth, behavior: reduce ? "auto" : "smooth" });
  };

  return (
    <div className="relative md:hidden">
      <div
        ref={trackRef}
        onScroll={onScroll}
        className="flex snap-x snap-mandatory overflow-x-auto [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {slides.map((slide) => (
          <Link
            key={slide.key}
            to={slide.to}
            aria-label={`${slide.cta} — ${slide.title}`}
            className="group relative block h-[82svh] w-full shrink-0 snap-center overflow-hidden"
          >
            <img
              src={slide.image.src}
              alt={slide.image.alt}
              width={1920}
              height={1152}
              className="absolute inset-0 h-full w-full object-cover"
            />
            <Overlay tone={slide.tone} />
            <SlideContent slide={slide} align="left" />
          </Link>
        ))}
      </div>

      <div className="pointer-events-none absolute inset-x-0 top-6 flex items-center justify-between px-6">
        <motion.span
          animate={reduce ? { x: 0 } : { x: [0, 8, 0] }}
          transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
          className={cn("eyebrow", slides[active]?.tone === "dark" ? "text-ivory/90" : "text-midnight/80")}
        >
          Swipe to explore
        </motion.span>
        <span className={cn("eyebrow", slides[active]?.tone === "dark" ? "text-ivory/90" : "text-midnight/80")}>
          {slides[active]?.index} / 02
        </span>
      </div>

      <div className="absolute inset-x-0 bottom-5 flex justify-center gap-2.5">
        {slides.map((slide, i) => (
          <button
            key={slide.key}
            type="button"
            onClick={() => goTo(i)}
            aria-label={`Show ${slide.key === "men" ? "Men's" : "Women's"} campaign`}
            className={cn(
              "h-1.5 rounded-full transition-all duration-500",
              i === active
                ? "w-8 " + (slide.tone === "dark" ? "bg-ivory" : "bg-midnight")
                : "w-3 " + (slide.tone === "dark" ? "bg-ivory/40" : "bg-midnight/30"),
            )}
          />
        ))}
      </div>
    </div>
  );
}

export function GenderCampaign() {
  return (
    <section aria-label="Shop Men and Shop Women campaigns">
      <MobileCarousel />
      <div className="hidden md:block">
        <DesktopSlide slide={slides[0]!} tall align="left" />
        <DesktopSlide slide={slides[1]!} align="right" />
      </div>
    </section>
  );
}
