"use client";

import * as React from "react";

const SETTLE_FRAMES = 30;

/* Writes one decaying `--aaa-swing` (degrees) onto the target element from
 * scroll velocity — children read it via CSS to lean/sway while the visitor
 * scrolls. The loop parks itself after ~half a second of stillness and a
 * passive scroll listener restarts it, so a resting page spends zero rAF work.
 * Disabled under reduced-motion. */
export function useScrollSwing(
  ref: React.RefObject<HTMLElement | null>,
  { factor = 0.28, max = 4.5 }: { factor?: number; max?: number } = {},
) {
  React.useEffect(() => {
    const el = ref.current;
    if (!el || typeof window === "undefined") return;
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return;

    let raf = 0;
    let running = false;
    let idle = 0;
    let last = window.scrollY;
    let cur = 0;

    const tick = () => {
      const y = window.scrollY;
      const dv = y - last;
      last = y;
      const target = Math.max(-max, Math.min(max, dv * factor));
      cur += (target - cur) * 0.14;
      if (Math.abs(cur) < 0.004) cur = 0;
      el.style.setProperty("--aaa-swing", `${cur.toFixed(3)}deg`);
      idle = cur === 0 && dv === 0 ? idle + 1 : 0;
      if (idle >= SETTLE_FRAMES) {
        running = false;
        return;
      }
      raf = requestAnimationFrame(tick);
    };

    const wake = () => {
      if (running) return;
      running = true;
      idle = 0;
      last = window.scrollY;
      raf = requestAnimationFrame(tick);
    };

    window.addEventListener("scroll", wake, { passive: true });
    wake(); // settle any initial motion, then park

    return () => {
      window.removeEventListener("scroll", wake);
      cancelAnimationFrame(raf);
      el.style.removeProperty("--aaa-swing");
    };
  }, [ref, factor, max]);
}
