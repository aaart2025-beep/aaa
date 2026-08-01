import type { Review } from "@/lib/reviews/types";

/* Grid of approved customer reviews (with photos). Pure markup — safe in a
 * server component. */

function Stars({ n }: { n: number }) {
  const r = Math.max(0, Math.min(5, Math.round(n)));
  return (
    <span aria-label={`${r} / 5`} className="text-[13px] leading-none tracking-[0.1em]">
      <span className="text-amber-500">{"★".repeat(r)}</span>
      <span className="text-ink/25">{"★".repeat(5 - r)}</span>
    </span>
  );
}

export function ReviewWall({ reviews }: { reviews: Review[] }) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      {reviews.map((r) => (
        <figure key={r.id} className="flex flex-col overflow-hidden border border-ink/15 bg-paper shadow-paper">
          {r.photo && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={r.photo} alt={`${r.name}`} loading="lazy" className="max-h-72 w-full object-cover" />
          )}
          <figcaption className="flex flex-1 flex-col gap-2 p-4">
            <Stars n={r.rating} />
            {r.title && <p className="font-archivo text-[13px] font-bold uppercase tracking-tight text-ink">{r.title}</p>}
            <p className="font-typewriter text-[12.5px] leading-[1.7] text-ink/85">{r.body}</p>
            <p className="font-typewriter mt-auto pt-1 text-[10px] uppercase tracking-[0.16em] text-ink/55">— {r.name}</p>
          </figcaption>
        </figure>
      ))}
    </div>
  );
}
