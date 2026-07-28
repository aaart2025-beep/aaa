import type * as React from "react";
import { cn } from "@/lib/utils";

/* Small hand-made marks shared by every workbook page: paperclips, tape,
 * handwritten margin notes and doodled arrows. All static SVG/CSS — no JS. */

export function Paperclip({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 40 90"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      className={cn("text-ink/70", className)}
    >
      <path
        d="M20 86 V24 a13 13 0 0 1 13 -13 a13 13 0 0 1 13 13 V70"
        transform="translate(-13 -4)"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
      />
      <path
        d="M7 66 V24 a13 13 0 0 1 13 -13"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function Tape({ className }: { className?: string }) {
  return <span aria-hidden className={cn("tape absolute", className)} />;
}

/** Handwritten margin note. Tilt with `rot` (degrees); size via className. */
export function HandNote({
  children,
  rot = -2,
  className,
}: {
  children: React.ReactNode;
  rot?: number;
  className?: string;
}) {
  return (
    <span
      className={cn("margin-note inline-block leading-tight", className)}
      style={{ "--note-rot": `${rot}deg` } as React.CSSProperties}
    >
      {children}
    </span>
  );
}

/** A doodled curved arrow. `flip` mirrors it horizontally; rotate via className. */
export function ArrowDoodle({
  className,
  flip = false,
}: {
  className?: string;
  flip?: boolean;
}) {
  return (
    <svg
      viewBox="0 0 90 50"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      className={cn("text-ink/70", flip && "-scale-x-100", className)}
    >
      <path
        d="M4 10 C30 2 62 10 78 34"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path
        d="M66 32 L79 36 L76 23"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/** A scrawled circle/oval used to ring a price or a word. */
export function CircleDoodle({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 120 54"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      className={cn("text-ink/70", className)}
    >
      <path
        d="M30 8 C70 -2 116 8 114 26 C112 46 70 54 36 48 C8 43 2 28 14 16 C22 8 44 4 62 5"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
      />
    </svg>
  );
}

/** Tiny ✕✕ stitch marks that punctuate corners of paper cards. */
export function StitchMarks({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 34 12"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      className={cn("text-ink/70", className)}
    >
      <path d="M2 2 L10 10 M10 2 L2 10" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      <path d="M22 2 L30 10 M30 2 L22 10" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}
