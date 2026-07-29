"use client";

import * as React from "react";
import Image from "next/image";
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

/* The centred product image for the spec sheet — sits straight on the graph
 * paper (white backdrop multiplies away). The five studio views stay mounted
 * and switch instantly via a compact tab row beneath. */

export function SpecImage({ name, views }: { name: string; views: ResolvedView[] }) {
  const t = useT();
  const label = (v: ResolvedView) => t(VIEW_KEY[v.key]);
  const withImg = views.filter((v) => v.src);
  const [active, setActive] = React.useState(views[0]?.key ?? "front");
  const cur = views.find((v) => v.key === active) ?? views[0];

  // gentle pointer-tilt so the piece feels dimensional as you move over it
  const tiltRef = React.useRef<HTMLDivElement>(null);
  const reduce = React.useRef(false);
  React.useEffect(() => {
    reduce.current = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false;
  }, []);
  const onTilt = (e: React.PointerEvent) => {
    const el = tiltRef.current;
    if (!el || reduce.current) return;
    const r = el.getBoundingClientRect();
    const nx = (e.clientX - r.left) / r.width - 0.5;
    const ny = (e.clientY - r.top) / r.height - 0.5;
    el.style.setProperty("--rx", `${(-ny * 9).toFixed(2)}deg`);
    el.style.setProperty("--ry", `${(nx * 11).toFixed(2)}deg`);
  };
  const resetTilt = () => {
    const el = tiltRef.current;
    if (!el) return;
    el.style.setProperty("--rx", "0deg");
    el.style.setProperty("--ry", "0deg");
  };

  return (
    <div className="flex min-h-0 flex-1 flex-col items-center">
      {/* plate-drift: slow idle float that pauses on hover (the tilt leads).
          Heights flow through flex-grow (never h-full) — percentage heights
          collapse to zero on phones where the ancestor chain is indefinite. */}
      <div className="plate-drift relative flex min-h-0 w-full flex-1 flex-col">
        <div
          ref={tiltRef}
          onPointerMove={onTilt}
          onPointerLeave={resetTilt}
          className="relative min-h-0 w-full flex-1 transition-transform duration-300 ease-out [transform:perspective(1100px)_rotateX(var(--rx,0deg))_rotateY(var(--ry,0deg))]"
        >
        {views.map((v) =>
          v.src ? (
            <div
              key={v.key}
              aria-hidden={v.key !== active}
              className={cn(
                "absolute inset-0 overflow-hidden transition-opacity duration-300",
                v.key === active ? "opacity-100" : "pointer-events-none opacity-0",
              )}
            >
              <Image
                src={v.src}
                alt={`${name} — ${label(v)}`}
                fill
                sizes="(max-width: 768px) 94vw, 600px"
                priority={v.key === "front"}
                className={cn(
                  v.zoom
                    ? "scale-[2.4] object-cover [object-position:50%_32%]"
                    : "object-contain p-2 drop-shadow-[0_12px_22px_rgba(40,34,24,0.22)]",
                )}
              />
            </div>
          ) : (
            <div
              key={v.key}
              aria-hidden={v.key !== active}
              className={cn(
                "dashed-slot absolute inset-6 flex flex-col items-center justify-center gap-1.5 text-center transition-opacity duration-300",
                v.key === active ? "opacity-100" : "pointer-events-none opacity-0",
              )}
            >
              <span className="font-archivo text-[9px] uppercase tracking-[0.18em] text-ink/70">{t("shop.viewOf", { label: label(v) })}</span>
              <span className="font-script text-[16px] text-ink/70">{t("shop.toBePhotographed")}</span>
            </div>
          ),
        )}
          {cur?.zoom && cur.src && (
            <span className="font-archivo absolute bottom-1 right-1 bg-paper/85 px-1.5 py-0.5 text-[8px] uppercase tracking-[0.14em] text-ink/70">
              {t("shop.detailZoom", { x: "2.4" })}
            </span>
          )}
        </div>
      </div>

      {withImg.length > 1 && (
        <div className="mt-3 flex shrink-0 flex-wrap items-center justify-center gap-1.5">
          {views.map((v) => (
            <button
              key={v.key}
              type="button"
              disabled={!v.src}
              onClick={() => v.src && setActive(v.key)}
              aria-pressed={v.key === active}
              className={cn(
                "font-archivo rounded-full border px-3.5 py-2 text-[10.5px] font-semibold uppercase tracking-[0.12em] transition-colors sm:py-1.5 sm:text-[9.5px]",
                v.key === active
                  ? "border-ink bg-ink text-paper"
                  : "border-ink/30 text-ink/70 hover:border-ink/60 hover:text-ink",
                !v.src && "cursor-not-allowed opacity-30",
              )}
            >
              {label(v)}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
