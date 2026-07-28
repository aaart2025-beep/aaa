"use client";

import Image from "next/image";
import { TransitionLink } from "@/components/transition/page-transition";
import { Tape } from "@/components/paper/annotations";
import { cn } from "@/lib/utils";
import { priceInfo, type Product } from "@/lib/products";
import { PaintPrice } from "@/components/paper/paint-price";
import { useT } from "@/lib/i18n/context";

/* A square photo-note taped to the page: the whole note carries one gentle
 * paper tone — and that tone washes over the photo too (via multiply), so the
 * piece reads as part of the coloured note, not a neutral cut-out. Realistic
 * lifted-paper shadow, a small tilt, tape corners. Name + green price beneath. */

export function SpecCard({
  product,
  tone,
  priority = false,
  className,
}: {
  product: Product;
  /** paper colour for this note (hex); also tints the photo. */
  tone?: string;
  /** eager-load the photo (first row of the grid) */
  priority?: boolean;
  className?: string;
}) {
  const t = useT();
  const paper = tone ?? "#f4efe2";
  const { price, original, percent } = priceInfo(product);
  return (
    <TransitionLink
      href={`/shop/${product.slug}`}
      aria-label={t("shop.openAria", { name: product.name })}
      className={cn(
        "note-card group relative block p-1 outline-none hover:-translate-y-1 focus-visible:-translate-y-1 sm:p-2",
        className,
      )}
      style={{ backgroundColor: paper }}
    >
      {/* tape corners — patched to the page */}
      <Tape className="-left-1.5 -top-1 z-10 h-2.5 w-6 -rotate-[42deg] sm:-left-2 sm:-top-1.5 sm:h-4 sm:w-9" />
      <Tape className="-right-1.5 -top-1 z-10 h-2.5 w-6 rotate-[42deg] sm:-right-2 sm:-top-1.5 sm:h-4 sm:w-9" />

      {/* markdown tag — a stamped sale sticker slapped on the corner */}
      {percent ? (
        <span className="pointer-events-none absolute left-1 top-1 z-20 -rotate-[7deg] bg-ink px-1.5 py-0.5 font-archivo text-[8px] font-bold uppercase leading-none tracking-[0.06em] text-lime shadow-[2px_2px_0_rgba(40,34,24,0.28)] sm:left-1.5 sm:top-1.5 sm:px-2 sm:py-1 sm:text-[10px]">
          −{percent}%
        </span>
      ) : null}

      {/* square photo — a transparent cutout floating on the note paper.
          The inner wrapper breathes very slowly (alive, per-card staggered via
          --breathe-* vars); the photo itself still scales on hover. */}
      <div className="relative aspect-square overflow-hidden">
        <div className="img-breathe relative h-full w-full">
          <Image
            src={product.images[0]}
            alt={product.name}
            fill
            sizes="(max-width: 640px) 48vw, (max-width: 1024px) 24vw, 220px"
            priority={priority}
            className="object-contain p-0.5 drop-shadow-[0_6px_11px_rgba(40,34,24,0.20)] transition-transform duration-500 ease-out group-hover:rotate-[0.6deg] group-hover:scale-[1.06] sm:p-1.5"
          />
        </div>
      </div>

      {/* caption — name + green paintbrush price */}
      <div className="mt-1 flex items-center justify-between gap-1 px-0.5 sm:mt-2 sm:gap-1.5">
        <h3 className="font-typewriter min-w-0 flex-1 truncate text-[9.5px] uppercase tracking-[0.07em] text-ink sm:text-[11px] sm:tracking-[0.1em]">
          {product.name}
        </h3>
        <PaintPrice
          price={price}
          original={original}
          textClassName="text-[10px] sm:text-[11px]"
          strikeClassName="text-[8px] sm:text-[9px]"
          className="shrink-0 px-1.5 py-0.5 sm:px-2 sm:py-1"
        />
      </div>
    </TransitionLink>
  );
}

/** Dashed "coming soon" square that fills out the last row. */
export function ComingSoonCard({ tone, className }: { tone?: string; className?: string }) {
  const t = useT();
  return (
    <div
      aria-hidden
      className={cn("note-card relative block p-1 sm:p-2", className)}
      style={{ backgroundColor: tone ?? "#efe8da" }}
    >
      <Tape className="-left-1.5 -top-1 z-10 h-2.5 w-6 -rotate-[42deg] sm:-left-2 sm:-top-1.5 sm:h-4 sm:w-9" />
      <Tape className="-right-1.5 -top-1 z-10 h-2.5 w-6 rotate-[42deg] sm:-right-2 sm:-top-1.5 sm:h-4 sm:w-9" />
      <div className="dashed-slot flex aspect-square flex-col items-center justify-center gap-1 p-1.5 text-center sm:gap-1.5 sm:p-3">
        <span className="font-typewriter text-[6.5px] uppercase tracking-[0.14em] text-ink/70 sm:text-[8px] sm:tracking-[0.18em]">{t("shop.comingSoon")}</span>
        <span className="font-script text-[11px] text-ink/70 sm:text-[15px]">{t("shop.inStudio")}</span>
      </div>
      <div className="mt-1 h-[13px] sm:mt-2 sm:h-[18px]" />
    </div>
  );
}
