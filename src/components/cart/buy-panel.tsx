"use client";

import * as React from "react";
import { createPortal } from "react-dom";
import { useCart } from "@/lib/cart/store";
import { useT } from "@/lib/i18n/context";
import { useColorVariant } from "@/components/shop/color-variant";

const isHex = (c: string) => /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(c.trim());

/* The product buy area: an optional size selector and colour selector (when the
 * piece offers a real choice), the price, the "Description" / "Size guide" /
 * "Care & washing" slots and "Add to bag". The chosen size and colour ride along
 * as the cart line's variant (e.g. "M · Black"). Selecting a colour also swaps
 * the gallery (via the shared colour-variant context) and the cart thumbnail.
 * priceSlot / careSlot / guideSlot / descSlot / orderSlot are rendered on the
 * server and passed in so the layout stays one client island. */
export function BuyPanel({
  slug,
  name,
  price,
  image,
  sizes,
  unavailableSizes,
  colors = [],
  colorImages,
  colorSizes,
  colorSoldOut,
  soldOut = false,
  requireAck = false,
  priceSlot,
  careSlot,
  guideSlot,
  descSlot,
  orderSlot,
}: {
  slug: string;
  name: string;
  price: number;
  image?: string;
  /** Buyable sizes; 0–1 entries → no picker shown. */
  sizes: string[];
  /** Sizes shown but out of stock: struck-through and not selectable. */
  unavailableSizes?: string[];
  /** Colour options (hex → swatch, otherwise a labelled chip). 0–1 → no picker. */
  colors?: string[];
  /** Per-colour photo sets, so the cart thumbnail matches the chosen colour. */
  colorImages?: Record<string, string[]>;
  /** Available sizes per colour — when set, only these show for that colour. */
  colorSizes?: Record<string, string[]>;
  /** Per-colour sold-out — selecting such a colour shows the sold-out state. */
  colorSoldOut?: Record<string, boolean>;
  /** Out of stock (whole product) — the buy button is replaced by a "sold out" state. */
  soldOut?: boolean;
  /** Shoes: require the shopper to acknowledge the price-clause pop-up before the
   * item is added to the bag. */
  requireAck?: boolean;
  priceSlot: React.ReactNode;
  careSlot: React.ReactNode;
  /** This product's size-guide trigger (a pop-up). Omitted when there's none. */
  guideSlot?: React.ReactNode;
  /** This product's description trigger (a pop-up). Omitted when there's none. */
  descSlot?: React.ReactNode;
  /** "Order now" custom-order trigger, shown only when the piece is sold out. */
  orderSlot?: React.ReactNode;
}) {
  const add = useCart((s) => s.add);
  const t = useT();

  // Selected colour comes from the shared context (so the gallery swaps too);
  // fall back to local state if the panel is ever used without a provider.
  const ctx = useColorVariant();
  const [localColour, setLocalColour] = React.useState<string | null>(colors[0] ?? null);
  const colour = ctx ? ctx.selected : localColour;
  const setColour = ctx ? ctx.setSelected : setLocalColour;

  // The first colour is the primary/main piece — it uses the product's own
  // sizes, stock and photos. Any added colour is an independent variant with its
  // own sizes and sold-out state, so one colour's stock never affects another.
  const isPrimary = !colour || colour === colors[0];
  const perColour = !isPrimary && colour ? colorSizes?.[colour] : undefined;
  const usingPerColour = Boolean(perColour && perColour.length);
  const activeSizes = React.useMemo(
    () => (usingPerColour ? perColour! : sizes).filter((s) => s && !/^one\b/i.test(s)),
    [usingPerColour, perColour, sizes],
  );
  // Struck-out sizes apply to the primary (its soldOutSizes); an added colour's
  // list is exactly what's in stock, so nothing is struck.
  const gone = React.useMemo(
    () => (isPrimary ? new Set(unavailableSizes ?? []) : new Set<string>()),
    [isPrimary, unavailableSizes],
  );
  const available = activeSizes.filter((s) => !gone.has(s));
  // A size must always be chosen when the piece offers any size (even one), so
  // the sizes render as cube buttons and a pick is required before ordering.
  const needSize = available.length >= 1;
  const allGone = activeSizes.length > 0 && available.length === 0;
  // Sold-out is per colour: the primary uses the product flag, an added colour
  // its own flag — so a sold-out colour never disables the others.
  const variantSoldOut = isPrimary ? soldOut : Boolean(colour && colorSoldOut?.[colour]);
  const disabled = variantSoldOut || allGone;
  const [size, setSize] = React.useState<string | null>(null);
  const [hint, setHint] = React.useState(false);
  // Shoe price-clause acknowledgement modal.
  const [ackOpen, setAckOpen] = React.useState(false);
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => setMounted(true), []);

  // When the colour changes, drop a chosen size the new colour doesn't offer.
  // Never auto-select — the shopper must click a size cube themselves.
  React.useEffect(() => {
    setSize((prev) => (prev && available.includes(prev) ? prev : null));
    setHint(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [colour]);

  // Lock scroll + allow Escape to dismiss while the acknowledgement is open.
  React.useEffect(() => {
    if (!ackOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setAckOpen(false);
    };
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [ackOpen]);

  // Actually drop the piece into the bag (after any required acknowledgement).
  const doAdd = () => {
    const variant = [size, colour].filter(Boolean).join(" · ") || undefined;
    const thumb = (!isPrimary && colour && colorImages?.[colour]?.[0]) || image;
    add({ slug, name, price, image: thumb, variant });
  };

  const onAdd = () => {
    if (disabled) return;
    if (needSize && !size) {
      setHint(true);
      return;
    }
    // Shoes: confirm the price clause first; the add happens on confirm.
    if (requireAck) {
      setAckOpen(true);
      return;
    }
    doAdd();
  };

  const confirmAck = () => {
    setAckOpen(false);
    doAdd();
  };

  return (
    <div className="w-full">
      {/* description + size guide — grouped top-right, above the pickers */}
      {(descSlot || guideSlot) && (
        <div className="mb-3 flex flex-wrap items-center justify-end gap-x-4 gap-y-1.5">
          {descSlot}
          {guideSlot}
        </div>
      )}

      {activeSizes.length >= 1 && (
        <div className="mb-3.5 border-t border-dashed border-ink/30 pt-3">
          <div className="mb-2">
            <span className="font-archivo text-[11px] font-bold uppercase tracking-[0.16em] text-ink">{t("chrome.size")}</span>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {activeSizes.map((s) => {
              // When the piece/colour is sold out, no size can be chosen.
              const blocked = gone.has(s) || disabled;
              const active = size === s;
              return (
                <button
                  key={s}
                  type="button"
                  aria-pressed={active}
                  disabled={blocked}
                  aria-disabled={blocked}
                  title={blocked ? t("shop.soldOut") : undefined}
                  onClick={() => {
                    if (blocked) return;
                    setSize(s);
                    setHint(false);
                  }}
                  className={`font-typewriter min-w-[2.9rem] px-3 py-2.5 text-[12px] uppercase tracking-[0.08em] transition-colors sm:min-w-[2.6rem] sm:py-2 sm:text-[11px] ${
                    blocked
                      ? "cursor-not-allowed border border-ink/20 text-ink/35 line-through"
                      : active
                        ? "bg-ink text-paper"
                        : "border border-ink/40 text-ink/75 hover:border-ink hover:text-ink"
                  }`}
                >
                  {s}
                </button>
              );
            })}
            {hint && (
              <span className="font-typewriter text-[9px] uppercase tracking-[0.14em] text-red-600">{t("chrome.pickSize")}</span>
            )}
          </div>
        </div>
      )}

      {colors.length > 1 && (
        <div className="mb-3.5 border-t border-dashed border-ink/30 pt-3">
          <div className="mb-2 flex items-center gap-2">
            <span className="font-archivo text-[11px] font-bold uppercase tracking-[0.16em] text-ink">{t("chrome.colour")}</span>
            {colour && !isHex(colour) ? null : colour ? (
              <span className="font-typewriter text-[10px] uppercase tracking-[0.1em] text-ink/55">{colour}</span>
            ) : null}
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {colors.map((c) => {
              const active = colour === c;
              return isHex(c) ? (
                <button
                  key={c}
                  type="button"
                  aria-pressed={active}
                  aria-label={c}
                  title={c}
                  onClick={() => setColour(c)}
                  className={`h-8 w-8 rounded-full border transition-transform ${
                    active ? "border-ink ring-2 ring-ink ring-offset-2 ring-offset-paper" : "border-ink/40 hover:scale-105"
                  }`}
                  style={{ backgroundColor: c }}
                />
              ) : (
                <button
                  key={c}
                  type="button"
                  aria-pressed={active}
                  onClick={() => setColour(c)}
                  className={`font-typewriter px-3 py-2 text-[12px] uppercase tracking-[0.08em] transition-colors sm:py-1.5 sm:text-[11px] ${
                    active ? "bg-ink text-paper" : "border border-ink/40 text-ink/75 hover:border-ink hover:text-ink"
                  }`}
                >
                  {c}
                </button>
              );
            })}
          </div>
        </div>
      )}

      <div className="flex flex-wrap items-center justify-between gap-3">
        {priceSlot}
        <div className="flex items-center gap-2.5">
          {careSlot}
          {disabled ? (
            <div className="flex flex-wrap items-center justify-end gap-2.5">
              <span
                className="font-archivo cursor-not-allowed border-2 border-red-600/70 px-5 py-3 text-[12px] font-bold uppercase tracking-[0.18em] text-red-600"
                aria-disabled="true"
              >
                {t("shop.soldOut")}
              </span>
              {orderSlot}
            </div>
          ) : (
            <button
              type="button"
              onClick={onAdd}
              className="chip-lime font-archivo px-7 py-3 text-[12px] font-bold uppercase tracking-[0.18em]"
            >
              {t("chrome.addToBag")}
            </button>
          )}
        </div>
      </div>

      {/* Shoe price-clause acknowledgement — centred pop-up; the item is only
          added once the shopper confirms they've read it. Portaled to <body> so
          no transformed ancestor can shift it off-centre. */}
      {mounted && ackOpen &&
        createPortal(
          <div
            className="book-theme fixed inset-0 z-[120] flex items-center justify-center p-5"
            role="dialog"
            aria-modal="true"
            aria-label={t("shop.shoeNoteTitle")}
          >
            <div
              className="absolute inset-0 bg-ink/70 backdrop-blur-[2px]"
              onClick={() => setAckOpen(false)}
            />
            {/* Solid colours set inline too: this modal is portaled to <body>,
                outside the .book-theme scope where the paper/ink tokens live, so
                we can't rely on bg-paper/text-ink resolving here. */}
            <div
              className="relative w-full max-w-sm border-2 border-ink/70 p-6 text-center shadow-2xl"
              style={{ backgroundColor: "oklch(0.945 0.018 88)", color: "oklch(0.21 0.004 60)" }}
            >
              <p className="font-typewriter text-[10px] font-bold uppercase tracking-[0.24em]" style={{ color: "oklch(0.21 0.004 60 / 0.65)" }}>
                {t("shop.shoeNoteLabel")}
              </p>
              <h2 className="font-archivo mt-1 text-[17px] font-extrabold uppercase tracking-tight">
                {t("shop.shoeNoteTitle")}
              </h2>
              <p className="font-typewriter mt-3 text-[13px] font-medium leading-[1.8] tracking-[0.02em]" style={{ color: "oklch(0.21 0.004 60 / 0.9)" }}>
                {t("shop.shoeNote")}
              </p>
              <div className="mt-6 flex flex-col gap-2.5">
                <button
                  type="button"
                  onClick={confirmAck}
                  className="chip-lime font-archivo w-full px-6 py-3 text-[12px] font-bold uppercase tracking-[0.16em]"
                >
                  {t("shop.shoeAckConfirm")}
                </button>
                <button
                  type="button"
                  onClick={() => setAckOpen(false)}
                  className="font-typewriter text-[10px] uppercase tracking-[0.16em] text-ink/60 underline underline-offset-2 transition-colors hover:text-ink"
                >
                  {t("shop.shoeAckCancel")}
                </button>
              </div>
            </div>
          </div>,
          document.body,
        )}
    </div>
  );
}
