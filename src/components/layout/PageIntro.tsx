import type { ReactNode } from "react";

export function PageIntro({ eyebrow, title, accent, children }: { eyebrow: string; title: string; accent?: string; children?: ReactNode }) {
  return (
    <section className="border-b border-border">
      <div className="container-lux flex flex-col items-center gap-5 py-20 text-center md:py-28">
        <span className="eyebrow text-champagne">{eyebrow}</span>
        <h1 className="text-5xl md:text-7xl">
          {title} {accent && <span className="editorial text-champagne">{accent}</span>}
        </h1>
        {children && <div className="max-w-xl text-muted-foreground">{children}</div>}
      </div>
    </section>
  );
}
