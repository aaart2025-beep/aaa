"use client";

import * as React from "react";
import { SpecCard, ComingSoonCard } from "@/components/paper/spec-card";
import { HandNote, ArrowDoodle } from "@/components/paper/annotations";
import { InkedText } from "@/components/paper/inked";
import { SketchDoodle } from "@/components/paper/sketch-doodle";
import { useScrollSwing } from "@/components/motion/use-scroll-swing";
import { useT } from "@/lib/i18n/context";
import type { Product, ProductCategory } from "@/lib/products";

/* The pinboard — every piece as a small square photo-note taped to the page,
 * all on the same warm-white paper so the grid reads clean and consistent.
 * Filterable by garment family, sortable by price/name. Tilts are
 * deterministic so the page never reshuffles. */

/** One shared note colour for every piece — a warm white that fits the paper. */
const NOTE_TONE = "#faf7f1";

const CATEGORY_ORDER: (ProductCategory | "All")[] = [
  "All",
  "Clothing",
  "Headwear",
  "Footwear",
  "Art Object",
];

type SortKey = "featured" | "price-asc" | "price-desc" | "name";
const SORTS: { key: SortKey; labelKey: string }[] = [
  { key: "featured", labelKey: "shop.sortFeatured" },
  { key: "price-asc", labelKey: "shop.sortPriceAsc" },
  { key: "price-desc", labelKey: "shop.sortPriceDesc" },
  { key: "name", labelKey: "shop.sortAZ" },
];

/** Translated label for a filter category (English enum stays the filter key). */
const CATEGORY_KEY: Record<ProductCategory | "All", string> = {
  All: "shop.catAll",
  Clothing: "shop.catClothing",
  Headwear: "shop.catHeadwear",
  Footwear: "shop.catFootwear",
  "Art Object": "shop.catArtObject",
};

function sortProducts(items: Product[], sort: SortKey): Product[] {
  const arr = [...items];
  if (sort === "price-asc") arr.sort((a, b) => a.price - b.price);
  if (sort === "price-desc") arr.sort((a, b) => b.price - a.price);
  if (sort === "name") arr.sort((a, b) => a.name.localeCompare(b.name));
  return arr;
}

/** Deterministic, subtle tilt per note position. */
const ROTS = [-1.6, 1.2, -0.8, 1.5, -1.1, 0.7, -1.7, 1.3, -0.6, 1.6];
const rotFor = (i: number) => ROTS[i % ROTS.length];
/** Per-note swing sensitivity + idle-sway timing, so they don't move in lockstep. */
const swingK = (i: number) => 0.6 + ((i * 37) % 80) / 100; // 0.6–1.4
const swayDur = (i: number) => `${6 + ((i * 53) % 30) / 10}s`; // 6–9s
const swayDelay = (i: number) => `${((i * 29) % 30) / 10}s`; // 0–3s

/** Pinboard physics: notes lean with scroll velocity (shared self-parking
 *  swing loop) and a few flutter at random — additive Web-Animations that
 *  compose with the lean + idle sway. */
function useStickerMotion(ref: React.RefObject<HTMLDivElement | null>, count: number) {
  useScrollSwing(ref);

  React.useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (typeof window === "undefined") return;
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return;

    const flutter = window.setInterval(() => {
      const cards = el.querySelectorAll<HTMLElement>(".shop-sticker");
      if (!cards.length) return;
      const pick = cards[Math.floor(Math.random() * cards.length)];
      pick.animate(
        [
          { transform: "rotate(0deg)" },
          { transform: "rotate(3deg)" },
          { transform: "rotate(-2.2deg)" },
          { transform: "rotate(1.2deg)" },
          { transform: "rotate(0deg)" },
        ],
        { duration: 1150, easing: "cubic-bezier(0.36,0.07,0.19,0.97)", composite: "add" },
      );
    }, 3200);

    return () => {
      window.clearInterval(flutter);
    };
  }, [ref, count]);
}

export function ShopGrid({ products: allProducts }: { products: Product[] }) {
  const t = useT();
  const [filter, setFilter] = React.useState<ProductCategory | "All">("All");
  const [sort, setSort] = React.useState<SortKey>("featured");

  // hidden pieces never show on the live shop
  const products = allProducts.filter((p) => !p.hidden);

  const categories = CATEGORY_ORDER.filter(
    (c) => c === "All" || products.some((p) => p.category === c),
  );
  const filtered = filter === "All" ? products : products.filter((p) => p.category === filter);
  const visible = sortProducts(filtered, sort);

  const gridRef = React.useRef<HTMLDivElement>(null);
  useStickerMotion(gridRef, visible.length);

  const chipCls =
    "chip-ink font-typewriter shrink-0 whitespace-nowrap px-3.5 py-2 text-[11px] uppercase tracking-[0.14em] sm:py-1.5 sm:text-[10px]";

  return (
    <section id="pieces" className="relative scroll-mt-24">
      {/* filter + sort chips — one row, swipes sideways on phones */}
      <div
        role="group"
        aria-label={t("shop.filterSortAria")}
        className="flex items-center gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden [mask-image:linear-gradient(90deg,#000_90%,transparent)] sm:flex-wrap sm:overflow-visible sm:[mask-image:none]"
      >
        <span className="font-typewriter mr-1 shrink-0 text-[10px] uppercase tracking-[0.22em] text-ink/70">{t("shop.filterLabel")}</span>
        {categories.map((c) => (
          <button key={c} type="button" aria-pressed={filter === c} onClick={() => setFilter(c)} className={chipCls}>
            {t(CATEGORY_KEY[c])}
          </button>
        ))}
        <span aria-hidden className="mx-1.5 h-4 w-px shrink-0 bg-ink/30" />
        <span className="font-typewriter mr-1 shrink-0 text-[10px] uppercase tracking-[0.22em] text-ink/70">{t("shop.sortLabel")}</span>
        {SORTS.map((s) => (
          <button key={s.key} type="button" aria-pressed={sort === s.key} onClick={() => setSort(s.key)} className={chipCls}>
            {t(s.labelKey)}
          </button>
        ))}
      </div>
      <p className="font-typewriter mt-2 text-[10px] uppercase tracking-[0.18em] text-ink/70">
        {t("shop.piecesHandmade", { count: visible.length })}
      </p>

      {/* margin scribble */}
      <div className="pointer-events-none absolute -top-12 right-0 hidden items-end gap-1 lg:flex">
        <HandNote rot={-3} className="text-[17px]">
          <InkedText text={t("shop.noTwoIdentical")} mode="script" speed={42} />
        </HandNote>
        <ArrowDoodle className="h-7 w-12 translate-y-3 rotate-[64deg]" />
      </div>

      {/* the board of square photo-notes, with pages from the studio's
          sketchbook pinned in between — a different drawing inks itself on
          every visit */}
      <div ref={gridRef} className="mt-9 grid grid-cols-3 gap-x-2 gap-y-5 sm:gap-x-4 sm:gap-y-9 md:grid-cols-4 md:gap-x-5 md:gap-y-10 xl:grid-cols-5">
        {visible.flatMap((p, i) => {
          const cells = [
            <div
              key={p.slug}
              className="shop-sticker relative"
              style={
                {
                  "--rest-rot": `${rotFor(i)}deg`,
                  "--swing-k": swingK(i),
                  "--breathe-dur": `${6.5 + (i % 5) * 0.6}s`,
                  "--breathe-delay": `${((i * 7) % 40) / 10}s`,
                } as React.CSSProperties
              }
            >
              <div className="animate-paper-sway" style={{ "--rest-rot": "0deg", "--sway-dur": swayDur(i), "--sway-delay": swayDelay(i) } as React.CSSProperties}>
                <SpecCard product={p} priority={i < 8} tone={NOTE_TONE} />
              </div>
            </div>,
          ];
          // a drawing inked straight onto the page after the 4th piece, then
          // every 7th — no card, no tape, just pencil on the graph paper
          if (i % 7 === 3 && i < visible.length - 1) {
            cells.push(
              <div
                key={`sketch-${p.slug}`}
                aria-hidden
                className="relative flex items-center justify-center"
                style={{ rotate: `${-rotFor(i + 3) * 1.4}deg` }}
              >
                <SketchDoodle caption className="w-[86%] max-w-[190px]" strokeClassName="text-ink/70" />
              </div>,
            );
          }
          return cells;
        })}
        {filter === "All" && (
          <>
            <div className="shop-sticker relative" style={{ "--rest-rot": "1.3deg", "--swing-k": 1.1 } as React.CSSProperties}>
              <ComingSoonCard tone={NOTE_TONE} />
            </div>
            <div className="shop-sticker relative hidden sm:block" style={{ "--rest-rot": "-1.1deg", "--swing-k": 0.9 } as React.CSSProperties}>
              <ComingSoonCard tone={NOTE_TONE} />
            </div>
            <div className="shop-sticker relative hidden xl:block" style={{ "--rest-rot": "0.8deg", "--swing-k": 1.2 } as React.CSSProperties}>
              <ComingSoonCard tone={NOTE_TONE} />
            </div>
          </>
        )}
      </div>

      {visible.length === 0 && (
        <p className="font-typewriter mt-12 text-center text-[11px] uppercase tracking-[0.2em] text-ink/70">
          {t("shop.emptyTab")}
        </p>
      )}
    </section>
  );
}
