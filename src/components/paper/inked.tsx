"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

/* The page writes itself: typed copy appears character-by-character with a
 * caret, handwriting flows in letter-by-letter, drawings ink their strokes on
 * — each the first time it scrolls into view. Layout never shifts (the full
 * text always occupies the line invisibly) and the real text stays in the DOM
 * for crawlers; screen readers get the whole line via aria-label. Reduced
 * motion renders everything instantly. */

function usePrefersReducedMotion(): boolean {
  return React.useSyncExternalStore(
    (onChange) => {
      const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
      mq.addEventListener("change", onChange);
      return () => mq.removeEventListener("change", onChange);
    },
    () => window.matchMedia("(prefers-reduced-motion: reduce)").matches,
    () => false,
  );
}

function useInView<T extends Element>(margin = "-12% 0px"): [React.RefObject<T | null>, boolean] {
  const ref = React.useRef<T>(null);
  const [seen, setSeen] = React.useState(false);
  React.useEffect(() => {
    const el = ref.current;
    if (!el || seen) return;
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setSeen(true);
          io.disconnect();
        }
      },
      { rootMargin: margin, threshold: 0.15 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [seen, margin]);
  return [ref, seen];
}

/* ------------------------------ InkedText ------------------------------ */

export function InkedText({
  text,
  mode = "type",
  speed,
  startDelay = 0,
  caret,
  className,
  as: Tag = "span",
}: {
  text: string;
  /** "type" = typewriter with caret; "script" = handwriting flowing in. */
  mode?: "type" | "script";
  /** ms per character (defaults: type 18, script 36). */
  speed?: number;
  startDelay?: number;
  /** show the blinking caret while typing (default: only for "type"). */
  caret?: boolean;
  className?: string;
  as?: "span" | "p" | "h1" | "h2" | "h3" | "blockquote";
}) {
  const reduce = usePrefersReducedMotion();
  const [ref, seen] = useInView<HTMLElement>();
  const [count, setCount] = React.useState(0);
  const perChar = speed ?? (mode === "type" ? 18 : 36);
  const showCaret = caret ?? mode === "type";
  const done = count >= text.length;

  React.useEffect(() => {
    if (!seen || reduce) return;
    let i = 0;
    let timer = 0;
    const begin = () => {
      timer = window.setInterval(() => {
        // type a couple of characters per tick on long passages so paragraphs
        // finish writing in a few seconds, not half a minute
        i += text.length > 140 ? 3 : 1;
        setCount(Math.min(i, text.length));
        if (i >= text.length) window.clearInterval(timer);
      }, perChar);
    };
    const delayId = window.setTimeout(begin, startDelay);
    return () => {
      window.clearTimeout(delayId);
      window.clearInterval(timer);
    };
  }, [seen, reduce, text, perChar, startDelay]);

  const instant = reduce || !text;
  const visibleCount = instant ? text.length : count;

  if (mode === "script") {
    // handwriting: each letter flows in where it belongs
    return (
      <Tag ref={ref as React.RefObject<never>} aria-label={text} className={cn("whitespace-pre-wrap", className)}>
        {Array.from(text).map((ch, i) => (
          <span
            key={i}
            aria-hidden
            className="inline-block transition-[opacity,transform] duration-200 ease-out"
            style={{
              opacity: i < visibleCount ? 1 : 0,
              transform: i < visibleCount ? "none" : "translateY(0.18em) rotate(3deg)",
              whiteSpace: ch === " " ? "pre" : undefined,
            }}
          >
            {ch}
          </span>
        ))}
      </Tag>
    );
  }

  return (
    <Tag ref={ref as React.RefObject<never>} aria-label={text} className={cn("relative inline-block", className)}>
      {/* full text reserves the layout (and is what crawlers read) */}
      <span aria-hidden className={instant ? undefined : "invisible"}>
        {text}
      </span>
      {!instant && (
        <span
          aria-hidden
          className={cn("absolute inset-0", showCaret && seen && !done && "inked-caret")}
        >
          {text.slice(0, visibleCount)}
        </span>
      )}
    </Tag>
  );
}

/* ------------------------------- Reveal -------------------------------- */

export function Reveal({
  children,
  delay = 0,
  className,
  as: Tag = "div",
}: {
  children: React.ReactNode;
  /** seconds, e.g. 0.15 */
  delay?: number;
  className?: string;
  as?: "div" | "section" | "li" | "figure" | "span";
}) {
  const reduce = usePrefersReducedMotion();
  const [ref, seen] = useInView<HTMLElement>();
  const [armed, setArmed] = React.useState(false);

  // Arm (hide) only after mount and only if the element starts below the
  // viewport — above-the-fold content renders instantly, no LCP cost.
  React.useEffect(() => {
    const el = ref.current;
    if (!el || reduce) return;
    if (el.getBoundingClientRect().top > window.innerHeight * 0.92) setArmed(true);
  }, [reduce, ref]);

  return (
    <Tag
      ref={ref as React.RefObject<never>}
      className={cn(armed && !seen && "reveal-pending", armed && seen && "reveal-in", className)}
      style={{ "--reveal-delay": `${delay}s` } as React.CSSProperties}
    >
      {children}
    </Tag>
  );
}

/* ----------------------------- InkedSketch ----------------------------- */

/** Wraps a sketch SVG: strokes wait un-inked until scrolled into view, then
 * draw themselves on (labels fade in after the linework). */
export function InkedSketch({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const [ref, seen] = useInView<HTMLDivElement>();
  return (
    <div
      ref={ref}
      className={cn(seen ? "sketch-animate" : "sketch-pending", className)}
      style={{ "--sketch-len": 900 } as React.CSSProperties}
    >
      {children}
    </div>
  );
}
