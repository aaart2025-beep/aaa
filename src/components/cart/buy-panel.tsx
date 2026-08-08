"use client";

import * as React from "react";
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
  soldOut = false,
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
  /** Out of stock — the buy button is replaced by a "sold out" state. */
  soldOut?: boolean;
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

  // Sizes shown depend on the colour: a colour with its own set shows only those
  // (all in stock); otherwise the general sizes with any sold-out ones struck out.
  const perColour = colour ? colorSizes?.[colour] : undefined;
  const usingPerColour = Boolean(perColour && perColour.length);
  const activeSizes = React.useMemo(
    () => (usingPerColour ? perColour! : sizes).filter((s) => s && !/^one\b/i.test(s)),
    [usingPerColour, perColour, sizes],
  );
  const gone = React.useMemo(
    () => (usingPerColour ? new Set<string>() : new Set(unavailableSizes ?? [])),
    [usingPerColour, unavailableSizes],
  );
  const available = activeSizes.filter((s) => !gone.has(s));
  const needSize = available.length > 1;
  const allGone = activeSizes.length > 0 && available.length === 0;
  const disabled = soldOut || allGone;
  const [size, setSize] = React.useState<string | null>(available.length === 1 ? available[0] : null);
  const [hint, setHint] = React.useState(false);

  // When the colour changes, drop a chosen size that the new colour doesn't
  // offer, and auto-select when only one size is available.
  React.useEffect(() => {
    setSize((prev) => (prev && available.includes(prev) ? prev : available.length === 1 ? available[0] : null));
    setHint(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [colour]);

  const onAdd = () => {
    if (disabled) return;
    if (needSize && !size) {
      setHint(true);
      return;
    }
    const variant = [size, colour].filter(Boolean).join(" · ") || undefined;
    const thumb = (colour && colorImages?.[colour]?.[0]) || image;
    add({ slug, name, price, image: thumb, variant });
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

      {activeSizes.length > 1 && (
        <div className="mb-3.5 border-t border-dashed border-ink/30 pt-3">
          <div className="mb-2">
            <span className="font-archivo text-[11px] font-bold uppercase tracking-[0.16em] text-ink">{t("chrome.size")}</span>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {activeSizes.map((s) => {
              const off = gone.has(s);
              const active = size === s;
              return (
                <button
                  key={s}
                  type="button"
                  aria-pressed={active}
                  disabled={off}
                  aria-disabled={off}
                  title={off ? t("shop.soldOut") : undefined}
                  onClick={() => {
                    if (off) return;
                    setSize(s);
                    setHint(false);
                  }}
                  className={`font-typewriter min-w-[2.9rem] px-3 py-2.5 text-[12px] uppercase tracking-[0.08em] transition-colors sm:min-w-[2.6rem] sm:py-2 sm:text-[11px] ${
                    off
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
    </div>
  );
}
