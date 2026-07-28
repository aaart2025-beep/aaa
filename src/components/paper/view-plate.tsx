"use client";

import * as React from "react";
import Image from "next/image";
import { Tape, HandNote } from "@/components/paper/annotations";
import { cn } from "@/lib/utils";
import { useT } from "@/lib/i18n/context";
import type { ResolvedView, ViewKey } from "@/lib/products";

/** Translated tab/caption label for a studio view, keyed by canonical view. */
const VIEW_KEY: Record<ViewKey, string> = {
  front: "shop.viewFront",
  back: "shop.viewBack",
  sideLeft: "shop.viewSideLeft",
  sideRight: "shop.viewSideRight",
  fabric: "shop.viewFabric",
};

/* The studio photo plate — one piece, five canonical views (front, back, the
 * two sides, fabric close-up). All available views stay mounted and stacked so
 * switching is instant; views not yet photographed show an honest dashed slot.
 * The fabric fallback is a zoomed detail crop of the front shot. */

export function ViewPlate({
  name,
  views,
}: {
  name: string;
  views: ResolvedView[];
}) {
  const t = useT();
  const label = (v: ResolvedView) => t(VIEW_KEY[v.key]);
  const [active, setActive] = React.useState(views[0]?.key ?? "front");
  const current = views.find((v) => v.key === active) ?? views[0];

  return (
    <div className="flex flex-col">
      {/* plate */}
      <div className="relative bg-paper p-3 shadow-paper sm:p-4">
        <Tape className="-left-3 -top-2.5 h-5 w-16 -rotate-[24deg]" />
        <Tape className="-right-3 -top-2.5 h-5 w-16 rotate-[24deg]" />

        <div className="relative aspect-[4/5] overflow-hidden border border-ink/15 bg-paper/30">
          {views.map((v) =>
            v.src ? (
              <div
                key={v.key}
                aria-hidden={v.key !== active}
                className={cn(
                  "absolute inset-0 transition-opacity duration-300",
                  v.key === active ? "z-[1] opacity-100" : "z-0 opacity-0",
                )}
              >
                <div className={cn("absolute inset-0 overflow-hidden", !v.zoom && "p-3 sm:p-5")}>
                  <Image
                    src={v.src}
                    alt={`${name} — ${label(v)}`}
                    fill
                    sizes="(max-width: 768px) 92vw, 520px"
                    priority={v.key === "front" || Boolean(v.zoom)}
                    className={cn(
                      v.zoom
                        ? "scale-[2.5] object-cover [object-position:50%_32%]"
                        : "object-contain drop-shadow-[0_12px_22px_rgba(40,34,24,0.22)]",
                    )}
                  />
                </div>
              </div>
            ) : (
              <div
                key={v.key}
                aria-hidden={v.key !== active}
                className={cn(
                  "dashed-slot absolute inset-3 flex flex-col items-center justify-center gap-2 text-center transition-opacity duration-300 sm:inset-5",
                  v.key === active ? "z-[1] opacity-100" : "z-0 opacity-0",
                )}
              >
                <span className="font-typewriter text-[9px] uppercase tracking-[0.2em] text-ink/70">
                  {t("shop.viewOf", { label: label(v) })}
                </span>
                <HandNote rot={-2} className="text-[17px]">
                  {t("shop.toBePhotographed")}
                </HandNote>
              </div>
            ),
          )}

          <span className="font-typewriter absolute left-2.5 top-2 z-[2] text-[9px] uppercase tracking-[0.16em] text-ink/70">
            {current?.fig}
          </span>
          {current?.zoom && current.src && (
            <span className="font-typewriter absolute bottom-2 right-2.5 z-[2] bg-paper/85 px-1.5 py-0.5 text-[8px] uppercase tracking-[0.16em] text-ink/70">
              {t("shop.detailZoom", { x: "2.5" })}
            </span>
          )}
        </div>

        <p className="font-typewriter mt-2.5 flex items-baseline justify-between text-[9px] uppercase tracking-[0.18em] text-ink/70">
          <span>{name}</span>
          <span>{current ? label(current) : ""}</span>
        </p>
      </div>

      {/* view tabs */}
      <div role="tablist" aria-label={t("shop.productViewsAria")} className="mt-4 flex flex-wrap gap-2">
        {views.map((v) => (
          <button
            key={v.key}
            type="button"
            role="tab"
            aria-selected={v.key === active}
            data-active={v.key === active}
            onClick={() => setActive(v.key)}
            className={cn(
              "chip-ink font-typewriter px-3 py-1 text-[9.5px] uppercase tracking-[0.14em]",
              !v.src && "opacity-60",
            )}
          >
            {label(v)}
            {!v.src && <span aria-hidden> ·…</span>}
          </button>
        ))}
      </div>
    </div>
  );
}
