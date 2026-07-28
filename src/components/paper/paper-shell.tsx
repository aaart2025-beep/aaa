import type * as React from "react";
import { cn } from "@/lib/utils";

/* The workbook page every content route lives on: cream graph paper edge to
 * edge, the stacked page-block visible along both sides (you are inside the
 * book), and a soft inner vignette. Pure CSS layers — nothing repaints. */

export function PaperShell({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <main
      id="main-content"
      tabIndex={-1}
      className={cn(
        "book-theme bg-grid-paper relative min-h-screen overflow-x-clip outline-none",
        className,
      )}
    >
      {/* stacked page edges — the rest of the book under this sheet */}
      <div aria-hidden className="pointer-events-none fixed inset-y-0 left-0 z-40 hidden w-2.5 sm:block">
        <div className="book-edges-left absolute inset-y-1 left-0 w-1.5" />
        <div className="book-edges-left absolute inset-y-2.5 left-1.5 w-1" />
      </div>
      <div aria-hidden className="pointer-events-none fixed inset-y-0 right-0 z-40 hidden w-2.5 sm:block">
        <div className="book-edges-right absolute inset-y-1 right-0 w-1.5" />
        <div className="book-edges-right absolute inset-y-2.5 right-1.5 w-1" />
      </div>

      {/* page surface shading — a breath of depth at the margins */}
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 z-0"
        style={{
          background:
            "linear-gradient(to right, oklch(0.21 0.004 60 / 0.05), transparent 3.5%, transparent 96.5%, oklch(0.21 0.004 60 / 0.05)), radial-gradient(130% 100% at 50% 0%, transparent 78%, oklch(0.21 0.004 60 / 0.05) 100%)",
        }}
      />

      <div className="relative z-10">{children}</div>
    </main>
  );
}
