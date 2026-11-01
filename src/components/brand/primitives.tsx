import { motion, useReducedMotion } from "framer-motion";
import type { ReactNode } from "react";

export function Reveal({ children, delay = 0, className }: { children: ReactNode; delay?: number; className?: string }) {
  const reduceMotion = useReducedMotion();
  return (
    <motion.div
      className={className}
      initial={reduceMotion ? false : { opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: reduceMotion ? 0 : 0.9, delay: reduceMotion ? 0 : delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}

export function SectionHeading({
  eyebrow,
  title,
  accent,
  align = "center",
  tone = "dark",
}: {
  eyebrow: string;
  title: string;
  accent?: string;
  align?: "center" | "left";
  tone?: "dark" | "light";
}) {
  const a = align === "center" ? "text-center mx-auto items-center" : "text-left items-start";
  return (
    <Reveal className={`flex max-w-2xl flex-col gap-4 ${a}`}>
      <span className={`eyebrow ${tone === "light" ? "text-soft-gold" : "text-champagne"}`}>{eyebrow}</span>
      <h2 className={`text-4xl leading-[1.1] md:text-5xl ${tone === "light" ? "text-ivory" : "text-foreground"}`}>
        {title} {accent && <span className="editorial text-champagne">{accent}</span>}
      </h2>
    </Reveal>
  );
}

/** Visible marker on any sample/placeholder content so it is never mistaken for real product data. */
export function SampleBadge({ className }: { className?: string }) {
  return (
    <span className={`eyebrow bg-ivory/90 px-2 py-1 text-[0.55rem] tracking-[0.2em] text-cocoa ${className ?? ""}`}>
      Sample image
    </span>
  );
}

export function Sparkle({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden className={className} fill="currentColor">
      <path d="M12 0c.6 6.6 5.4 11.4 12 12-6.6.6-11.4 5.4-12 12-.6-6.6-5.4-11.4-12-12C6.6 11.4 11.4 6.6 12 0Z" />
    </svg>
  );
}
