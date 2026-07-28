import { cn } from "@/lib/utils";
import { formatPrice } from "@/lib/products";

/* The price on a hand-painted lime brushstroke (מכחול), in the same lime as the
 * "Inquire to buy" button (var(--lime)). Built from several semi-transparent
 * passes so the paper/graph lines show through and the overlaps read like real,
 * uneven paint — an asymmetric swipe with a wispy entry tail on the left, a
 * drip and splatter on the right, dry-brush streaks and a casual tilt. */

const LIME = "var(--lime, #a6db1e)";

export function PaintPrice({
  price,
  original,
  prefix = "",
  className,
  textClassName,
  strikeClassName,
}: {
  price: number;
  /** When set, shows this struck-through list price beside the sale price. */
  original?: number;
  prefix?: string;
  className?: string;
  textClassName?: string;
  /** Size/colour of the struck original (defaults to a muted ink). */
  strikeClassName?: string;
}) {
  const brush = (
    <span className={cn("relative inline-flex items-center justify-center px-3.5 py-1.5", className)}>
      <svg
        viewBox="0 0 120 46"
        preserveAspectRatio="none"
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 h-full w-full overflow-visible"
        style={{ transform: "rotate(-2.2deg)" }}
      >
        <g fill={LIME}>
          {/* broad, transparent base swipe — irregular, blunt right end */}
          <path
            d="M5 26 C3 20 7 17 15 16 C30 13 60 13 90 14 C104 14 115 17 115 22 C117 28 110 31 99 32 C74 35 46 36 27 34 C14 33 7 31 5 26 Z"
            fillOpacity="0.4"
          />
          {/* wispy entry tail flicking off to the left */}
          <path
            d="M6 24 C0 23 -7 25 -11 28 C-5 27.5 1 28 7 28.5 Z"
            fillOpacity="0.28"
          />
          {/* loaded core — denser pass, sitting low and right (asymmetric) */}
          <path
            d="M22 24 C46 21 78 21 105 24 C80 29 50 29 24 27 Z"
            fillOpacity="0.42"
          />
          {/* a drip hanging off the right end */}
          <path
            d="M103 31 C102 36 104 41 107 40 C109.5 39 108.5 33 106 31 Z"
            fillOpacity="0.4"
          />
          {/* asymmetric splatter — mostly to the right & below, one stray left */}
          <circle cx="113" cy="13" r="1.6" fillOpacity="0.5" />
          <circle cx="118" cy="30" r="1.1" fillOpacity="0.45" />
          <circle cx="109" cy="39" r="0.9" fillOpacity="0.4" />
          <circle cx="2" cy="31" r="1" fillOpacity="0.32" />
        </g>
        {/* dry-brush streaks (brush hairs), gently sloping like a real swipe */}
        <g fill="none" stroke={LIME} strokeLinecap="round">
          <path d="M16 21 C44 19 82 19 111 22" strokeWidth="1.1" strokeOpacity="0.3" />
          <path d="M14 29 C44 31 80 31 107 29" strokeWidth="0.8" strokeOpacity="0.24" />
        </g>
      </svg>
      <span
        className={cn(
          "relative font-typewriter font-semibold tracking-[0.04em] text-[#1c1a12] [text-shadow:0_1px_0_rgba(255,255,255,0.35)]",
          textClassName,
        )}
      >
        {prefix}
        {formatPrice(price)}
      </span>
    </span>
  );

  if (original === undefined) return brush;

  return (
    <span className="inline-flex items-center gap-1.5">
      <s
        className={cn(
          "font-typewriter font-medium text-ink/70 decoration-ink/55 decoration-[1.5px]",
          strikeClassName,
        )}
      >
        {formatPrice(original)}
      </s>
      {brush}
    </span>
  );
}
