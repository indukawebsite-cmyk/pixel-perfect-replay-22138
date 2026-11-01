import { Link } from "@tanstack/react-router";
import type { Collection } from "@/lib/catalog";

export function CollectionCard({ collection, index }: { collection: Collection; index: number }) {
  return (
    <Link
      to="/collections/$slug"
      params={{ slug: collection.slug }}
       className="group relative block aspect-[3/4] overflow-hidden bg-midnight focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      <img
        src={collection.image}
        alt={`${collection.name} collection mood image (sample)`}
        loading="lazy"
        width={800}
        height={1000}
        className="h-full w-full object-cover object-center transition duration-1000 ease-[var(--ease-lux)] group-hover:scale-[1.025] motion-reduce:transform-none motion-reduce:transition-none"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-midnight via-midnight/35 to-transparent" />
      <div className="absolute inset-x-0 bottom-0 flex min-h-48 flex-col justify-end gap-3 bg-gradient-to-t from-midnight via-midnight/85 to-transparent p-6 text-ivory">
        <span className="eyebrow text-[0.6rem] text-soft-gold">
          {String(index + 1).padStart(2, "0")} · {collection.meaning}
        </span>
        <h3 className="text-3xl leading-tight uppercase">{collection.name}</h3>
        <p className="max-w-xs text-sm leading-relaxed text-ivory/90">{collection.focus}</p>
        <span className="eyebrow mt-1 text-[0.6rem] text-soft-gold">Explore collection →</span>
      </div>
    </Link>
  );
}
