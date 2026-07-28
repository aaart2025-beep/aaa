"use client";

import * as React from "react";

/* First-visit loading overlay for the cover. Progress is written straight to
 * the bar's transform by the frame loader (zero React re-renders), the fade is
 * opacity-only, and the parent unmounts us entirely once the fade finishes. */
export function HeroLoader({
  wordmark,
  ready,
  barRef,
  onGone,
}: {
  wordmark: string;
  ready: boolean;
  barRef: React.RefObject<HTMLSpanElement | null>;
  onGone: () => void;
}) {
  return (
    <div
      aria-hidden
      onTransitionEnd={() => {
        if (ready) onGone();
      }}
      className={`fixed inset-0 z-[100] flex flex-col items-center justify-center gap-6 bg-night transition-opacity duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] ${
        ready ? "pointer-events-none opacity-0" : "opacity-100"
      }`}
    >
      <div className="animate-pulse pl-[0.42em] text-[13px] font-semibold tracking-[0.42em] text-white/85">
        {wordmark}
      </div>
      <div className="h-[2px] w-[180px] overflow-hidden rounded bg-white/15">
        <span
          ref={barRef}
          className="block h-full w-full origin-left rounded bg-white transition-transform duration-150 ease-linear"
          style={{ transform: "scaleX(0)" }}
        />
      </div>
    </div>
  );
}
