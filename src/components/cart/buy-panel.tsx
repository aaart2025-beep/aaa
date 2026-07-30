"use client";

import * as React from "react";
import { useCart } from "@/lib/cart/store";
import { useT } from "@/lib/i18n/context";
import { TransitionLink } from "@/components/transition/page-transition";

/* The product buy area: a size selector (when the piece has real size options)
 * plus the price, a "Care & washing" slot and "Add to bag". The selected size
 * rides along as the cart line's variant. priceSlot / careSlot are rendered on
 * the server and passed in so the layout stays one client island. */
export function BuyPanel({
  slug,
  name,
  price,
  image,
  sizes,
  soldOut = false,
  priceSlot,
  careSlot,
}: {
  slug: string;
  name: string;
  price: number;
  image?: string;
  /** Buyable sizes; 0–1 entries → no picker shown. */
  sizes: string[];
  /** Out of stock — the buy button is replaced by a "sold out" state. */
  soldOut?: boolean;
  priceSlot: React.ReactNode;
  careSlot: React.ReactNode;
}) {
  const add = useCart((s) => s.add);
  const t = useT();
  const needSize = sizes.length > 1;
  const [size, setSize] = React.useState<string | null>(needSize ? null : (sizes[0] ?? null));
  const [hint, setHint] = React.useState(false);

  const onAdd = () => {
    if (soldOut) return;
    if (needSize && !size) {
      setHint(true);
      return;
    }
    add({ slug, name, price, image, variant: size ?? undefined });
  };

  return (
    <div className="w-full">
      {needSize && (
        <div className="mb-3.5 border-t border-dashed border-ink/30 pt-3">
          <div className="mb-2 flex items-center justify-between gap-2">
            <span className="font-archivo text-[11px] font-bold uppercase tracking-[0.16em] text-ink">{t("chrome.size")}</span>
            <TransitionLink
              href="/policies/sizes"
              className="font-typewriter inline-flex items-center gap-1 text-[10px] uppercase tracking-[0.14em] text-ink/60 underline decoration-ink/30 underline-offset-2 transition-colors hover:text-ink"
            >
              {t("shop.sizeGuide")} <span aria-hidden>↗</span>
            </TransitionLink>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {sizes.map((s) => {
              const active = size === s;
              return (
                <button
                  key={s}
                  type="button"
                  aria-pressed={active}
                  onClick={() => {
                    setSize(s);
                    setHint(false);
                  }}
                  className={`font-typewriter min-w-[2.9rem] px-3 py-2.5 text-[12px] uppercase tracking-[0.08em] transition-colors sm:min-w-[2.6rem] sm:py-2 sm:text-[11px] ${
                    active
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

      <div className="flex flex-wrap items-center justify-between gap-3">
        {priceSlot}
        <div className="flex items-center gap-2.5">
          {careSlot}
          {soldOut ? (
            <span
              className="font-archivo cursor-not-allowed border-2 border-red-600/70 px-7 py-3 text-[12px] font-bold uppercase tracking-[0.18em] text-red-600"
              aria-disabled="true"
            >
              {t("shop.soldOut")}
            </span>
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
