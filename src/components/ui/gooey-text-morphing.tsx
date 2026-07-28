"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

interface GooeyTextProps {
  texts: string[];
  morphTime?: number;
  cooldownTime?: number;
  /** When false, render the first phrase statically and run no animation loop
   *  (the hero keeps this off until its end state is actually visible). */
  active?: boolean;
  className?: string;
  textClassName?: string;
}

/**
 * Smooth blur crossfade between phrases. Deterministic from→to logic (no shared
 * index/cooldown coupling, which caused the "stuck / repeats then jumps" bug),
 * and GPU-composited (no SVG threshold filter, which glitched the page on iOS).
 */
export function GooeyText({
  texts,
  morphTime = 1,
  cooldownTime = 0.25,
  active = true,
  className,
  textClassName,
}: GooeyTextProps) {
  const aRef = React.useRef<HTMLSpanElement>(null);
  const bRef = React.useRef<HTMLSpanElement>(null);

  React.useEffect(() => {
    if (!texts.length) return;
    if (!active) {
      // Idle: show the first phrase, spend zero frames.
      if (aRef.current) {
        aRef.current.textContent = texts[0];
        aRef.current.style.opacity = "1";
        aRef.current.style.filter = "blur(0px)";
      }
      if (bRef.current) bRef.current.style.opacity = "0";
      return;
    }
    const holdMs = Math.max(0, cooldownTime * 1000);
    const morphMs = Math.max(1, morphTime * 1000);
    const MAX_BLUR = 10;

    let raf = 0;
    let cancelled = false;
    let i = 0;
    let from = texts[0];
    let to = texts[1 % texts.length];
    let phase: "hold" | "morph" = "hold";
    let t0 = performance.now();

    const setTexts = () => {
      if (aRef.current) aRef.current.textContent = from;
      if (bRef.current) bRef.current.textContent = to;
    };
    // p = 0 → fully "from" (span A), p = 1 → fully "to" (span B)
    const apply = (p: number) => {
      const a = aRef.current;
      const b = bRef.current;
      if (!a || !b) return;
      a.style.opacity = String(Math.pow(1 - p, 0.5));
      a.style.filter = `blur(${(p * MAX_BLUR).toFixed(1)}px)`;
      b.style.opacity = String(Math.pow(p, 0.5));
      b.style.filter = `blur(${((1 - p) * MAX_BLUR).toFixed(1)}px)`;
    };

    setTexts();
    apply(0);

    const loop = (now: number) => {
      if (cancelled) return;
      const elapsed = now - t0;
      if (phase === "hold") {
        if (elapsed >= holdMs) {
          phase = "morph";
          t0 = now;
        }
      } else {
        const p = Math.min(elapsed / morphMs, 1);
        apply(p);
        if (p >= 1) {
          // Commit: the text we just morphed to becomes the new "from".
          i = (i + 1) % texts.length;
          from = texts[i];
          to = texts[(i + 1) % texts.length];
          setTexts();
          apply(0);
          phase = "hold";
          t0 = now;
        }
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);

    return () => {
      cancelled = true;
      cancelAnimationFrame(raf);
    };
  }, [texts, morphTime, cooldownTime, active]);

  const spanCls = cn(
    "col-start-1 row-start-1 inline-block transform-gpu select-none whitespace-nowrap text-center will-change-[opacity,filter]",
    "text-foreground",
    textClassName
  );

  return (
    <div
      className={cn("relative grid transform-gpu place-items-center", className)}
      style={{ isolation: "isolate" }}
    >
      <span ref={aRef} className={spanCls} />
      <span ref={bRef} className={spanCls} />
    </div>
  );
}
