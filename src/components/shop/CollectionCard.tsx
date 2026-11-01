import { Link } from "@tanstack/react-router";
import type { Collection } from "@/lib/catalog";

export function CollectionCard({ collection, index }: { collection: Collection; index: number }) {
  return (
    <Link
      to="/collections/$slug"
      params={{ slug: collection.slug }}
      className="group relative block aspect-[3/4] overflow-hidden bg-midnight"
    >
      <img
        src={collection.image}
        alt={`${collection.name} collection mood image (sample)`}
        loading="lazy"
        width={800}
        height={1000}
        className="h-full w-full object-cover opacity-80 transition duration-[1400ms] ease-[var(--ease-lux)] group-hover:scale-105 group-hover:opacity-60"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-midnight/85 via-midnight/10 to-transparent" />
      <div className="absolute inset-x-0 bottom-0 flex flex-col gap-2 p-6 text-ivory">
        <span className="eyebrow text-[0.6rem] text-soft-gold">
          {String(index + 1).padStart(2, "0")} · {collection.meaning}
        </span>
        <h3 className="text-3xl tracking-[0.12em] uppercase">{collection.name}</h3>
        <p className="max-w-xs text-sm text-ivory/75">{collection.focus}</p>
        <span className="eyebrow mt-2 text-[0.6rem] text-ivory/70">Coming soon</span>
      </div>
    </Link>
  );
}
