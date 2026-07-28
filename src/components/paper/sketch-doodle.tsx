"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { SKETCHES, SKETCH_CAPTIONS, type Sketch } from "@/lib/sketches/library";

/* A living margin drawing: picks a random fashion flat from the studio
 * library, inks it stroke by stroke when it scrolls into view, then every
 * little while fades to a different sketch and draws that one — so no two
 * visits (or even two minutes) look the same. Decorative only (aria-hidden),
 * cheap (small one-shot SVG stroke animations), and static under
 * prefers-reduced-motion. */

const CYCLE_MIN_MS = 14000;
const CYCLE_SPREAD_MS = 12000;
const FADE_MS = 450;

type Complexity = "simple" | "complex" | "any";

function pick(complexity: Complexity, notId?: string): Sketch {
  const pool = SKETCHES.filter(
    (s) => (complexity === "any" || s.complexity === complexity) && s.id !== notId,
  );
  return pool[Math.floor(Math.random() * pool.length)] ?? SKETCHES[0];
}

export function SketchDoodle({
  complexity = "any",
  caption = false,
  className,
  strokeClassName = "text-ink/70",
}: {
  complexity?: Complexity;
  /** show a handwritten margin note under the drawing */
  caption?: boolean;
  className?: string;
  strokeClassName?: string;
}) {
  const [sketch, setSketch] = React.useState<Sketch | null>(null);
  const [note, setNote] = React.useState("");
  const [visible, setVisible] = React.useState(false);
  const [fading, setFading] = React.useState(false);
  const reduceRef = React.useRef(false);
  const wrapRef = React.useRef<HTMLDivElement>(null);

  // pick on the client only — the server renders an empty slot, so every
  // visit (and every remount) gets a different drawing without hydration drift
  React.useEffect(() => {
    reduceRef.current = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false;
    setSketch(pick(complexity));
    setNote(SKETCH_CAPTIONS[Math.floor(Math.random() * SKETCH_CAPTIONS.length)]);
  }, [complexity]);

  // draw only once on screen
  React.useEffect(() => {
    const el = wrapRef.current;
    if (!el || typeof IntersectionObserver === "undefined") {
      setVisible(true);
      return;
    }
    const io = new IntersectionObserver(([e]) => setVisible(e.isIntersecting), { rootMargin: "80px" });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  // while visible, wander to a new drawing every so often
  React.useEffect(() => {
    if (!visible || !sketch || reduceRef.current) return;
    const wait = CYCLE_MIN_MS + Math.random() * CYCLE_SPREAD_MS;
    let swapTimer = 0;
    const fadeTimer = window.setTimeout(() => {
      setFading(true);
      swapTimer = window.setTimeout(() => {
        setSketch((cur) => pick(complexity, cur?.id));
        setNote(SKETCH_CAPTIONS[Math.floor(Math.random() * SKETCH_CAPTIONS.length)]);
        setFading(false);
      }, FADE_MS);
    }, wait);
    return () => {
      window.clearTimeout(fadeTimer);
      window.clearTimeout(swapTimer);
    };
  }, [visible, sketch, complexity]);

  const solidCount = sketch ? sketch.paths.filter((p) => !p.dashed).length : 1;
  // simple doodles ink on quickly; complex flats take their time
  const total = sketch?.complexity === "complex" ? 2.6 : 1.3;
  const per = total / Math.max(solidCount, 1);

  return (
    <div
      ref={wrapRef}
      aria-hidden
      className={cn("select-none", className)}
      style={{ opacity: fading ? 0 : 1, transition: `opacity ${FADE_MS}ms ease` }}
    >
      {sketch && visible && (
        <svg key={sketch.id} viewBox={sketch.viewBox} className={cn("h-auto w-full", strokeClassName)}>
          <g fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
            {(() => {
              let solidIdx = 0;
              return sketch.paths.map((p, i) => {
                if (p.dashed) {
                  return (
                    <path
                      key={i}
                      d={p.d}
                      strokeWidth={p.w ?? 1.8}
                      strokeDasharray="2.5 3"
                      className="doodle-stitch"
                      style={{ animationDelay: `${(total * 0.92).toFixed(2)}s` }}
                    />
                  );
                }
                const delay = solidIdx * per * 0.88;
                solidIdx++;
                return (
                  <path
                    key={i}
                    d={p.d}
                    strokeWidth={p.w ?? 1.8}
                    pathLength={1}
                    className="doodle-draw"
                    style={{
                      animationDuration: `${(per * 1.55).toFixed(2)}s`,
                      animationDelay: `${delay.toFixed(2)}s`,
                    }}
                  />
                );
              });
            })()}
          </g>
        </svg>
      )}
      {caption && sketch && visible && (
        <p
          key={`${sketch.id}-note`}
          className="doodle-note font-script mt-0.5 text-center text-[13px] leading-tight text-ink/70 sm:text-[14px]"
          style={{ animationDelay: `${(total * 0.8).toFixed(2)}s` }}
        >
          {note}
        </p>
      )}
    </div>
  );
}

