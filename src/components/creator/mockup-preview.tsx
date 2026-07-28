"use client";

import * as React from "react";
import { Tape, HandNote } from "@/components/paper/annotations";
import { GARMENT_ART } from "@/components/creator/garment-svgs";
import { baseOf, type BaseKey, type Design } from "@/lib/creator/config";
import { useT } from "@/lib/i18n/context";

/* A realistic, EXACT mockup of the live design — no AI, no guessing. It reuses
 * the same zone artwork as the editor (so colours, fabric and logo placement
 * match the design 100%) and dresses it up like a studio product shot:
 *   • fabric grain      — feTurbulence keyed to the chosen fabric
 *   • volume / folds     — feSpecularLighting bumped from the garment alpha
 *   • studio backdrop    — soft sweep + glow + contact shadow + vignette
 *   • the AAA mark        — printed / embroidered / hand-painted, where dragged
 * Pure SVG: free, instant, and ships in the static export. */

const VB_W = 320;
const VB_H = 300;
const WAVE = "M-30 6 L-18 6 L-10 -8 L-3 7 L4 -10 L11 7 L18 -5 L25 6 L30 6";

/* ---- fabric → texture profile (keys are unique across all bases) ---- */
type Profile = "smooth" | "woven" | "fuzzy" | "ribbed" | "twill" | "washed";

const FABRIC_PROFILE: Record<string, Profile> = {
  // hoodie
  fleece: "fuzzy", organic: "woven", sherpa: "fuzzy", acid: "washed",
  // tee
  heavy: "woven", slub: "woven", vintage: "washed",
  // cap
  twill: "twill", corduroy: "ribbed", burlap: "woven", denim: "twill",
  // sneaker
  leather: "smooth", suede: "fuzzy", croc: "woven", canvas: "woven",
};

interface FxParams {
  bf: string; // turbulence base frequency
  oct: number; // octaves
  ga: number; // grain alpha (fabric speckle strength)
  ss: number; // surfaceScale (volume depth)
  sc: number; // specularConstant (highlight strength)
  se: number; // specularExponent (gloss tightness)
  blur?: number; // extra alpha softening (fuzzy fabrics)
}

const FX: Record<Profile, FxParams> = {
  smooth: { bf: "0.5 0.5", oct: 1, ga: 0.05, ss: 2.6, sc: 0.75, se: 24 },
  woven: { bf: "0.55 0.55", oct: 2, ga: 0.14, ss: 1.6, sc: 0.5, se: 10 },
  fuzzy: { bf: "0.32 0.32", oct: 2, ga: 0.15, ss: 1.1, sc: 0.45, se: 6, blur: 1.1 },
  ribbed: { bf: "0.02 0.95", oct: 1, ga: 0.17, ss: 1.4, sc: 0.5, se: 9 },
  twill: { bf: "0.08 0.5", oct: 2, ga: 0.13, ss: 1.5, sc: 0.5, se: 10 },
  washed: { bf: "0.02 0.02", oct: 3, ga: 0.1, ss: 1.3, sc: 0.45, se: 8 },
};

/** soft contact-shadow baseline per garment (studio floor) */
const GROUND: Record<BaseKey, { y: number; rx: number }> = {
  hoodie: { y: 246, rx: 80 },
  tee: { y: 248, rx: 76 },
  cap: { y: 202, rx: 72 },
  sneaker: { y: 240, rx: 104 },
};

function shade(hex: string, factor: number): string {
  const n = parseInt(hex.replace("#", ""), 16);
  if (Number.isNaN(n)) return hex;
  const c = (v: number) => Math.max(0, Math.min(255, Math.round(v * factor)));
  const r = c((n >> 16) & 255);
  const g = c((n >> 8) & 255);
  const b = c(n & 255);
  return `#${((1 << 24) | (r << 16) | (g << 8) | b).toString(16).slice(1)}`;
}

function FabricFilter({ id, p }: { id: string; p: FxParams }) {
  return (
    <filter id={id} x="-15%" y="-15%" width="130%" height="130%" colorInterpolationFilters="sRGB">
      {/* fabric grain, clipped to the garment */}
      <feTurbulence type="fractalNoise" baseFrequency={p.bf} numOctaves={p.oct} seed="11" result="n" />
      <feColorMatrix
        in="n"
        type="matrix"
        values={`0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 ${p.ga} 0`}
        result="grainA"
      />
      <feComposite in="grainA" in2="SourceAlpha" operator="in" result="grain" />
      {/* volume / folds from the alpha as a height field */}
      <feGaussianBlur in="SourceAlpha" stdDeviation={2.2 + (p.blur ?? 0)} result="bump" />
      <feSpecularLighting
        in="bump"
        surfaceScale={p.ss}
        specularConstant={p.sc}
        specularExponent={p.se}
        lightingColor="#fffdf6"
        result="spec"
      >
        <feDistantLight azimuth="230" elevation="58" />
      </feSpecularLighting>
      <feComposite in="spec" in2="SourceAlpha" operator="in" result="specC" />
      {/* combine: garment + highlights (screen) + grain (multiply) */}
      <feBlend in="SourceGraphic" in2="specC" mode="screen" result="lit" />
      <feBlend in="lit" in2="grain" mode="multiply" />
    </filter>
  );
}

export function MockupPreview({ design }: { design: Design }) {
  const t = useT();
  const def = baseOf(design.base);
  const Art = GARMENT_ART[design.base];
  const profile = FABRIC_PROFILE[design.fabric] ?? "woven";
  const p = FX[profile];
  const ground = GROUND[design.base];
  const svgRef = React.useRef<SVGSVGElement>(null);

  const lx = design.logo.x * VB_W;
  const ly = design.logo.y * VB_H;
  const lc = design.logo.color;
  const style = design.logo.style;

  const download = () => {
    const svg = svgRef.current;
    if (!svg) return;
    const blob = new Blob(
      [`<?xml version="1.0" encoding="UTF-8"?>\n${svg.outerHTML.replace("<svg", '<svg xmlns="http://www.w3.org/2000/svg"')}`],
      { type: "image/svg+xml" },
    );
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `aaa-mockup-${design.base}.svg`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="relative flex flex-col bg-paper p-3 shadow-paper sm:p-5">
      <Tape className="-left-3 -top-2.5 h-5 w-16 -rotate-[18deg]" />
      <Tape className="-right-3 -top-2.5 h-5 w-16 rotate-[18deg]" />

      <div className="relative w-full overflow-hidden border border-ink/15">
        <svg
          ref={svgRef}
          viewBox={`0 0 ${VB_W} ${VB_H}`}
          className="block w-full select-none"
          aria-label={t("pages.mockup.aria", { label: def.label })}
        >
          <defs>
            <linearGradient id="mk-studio" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#f5f0e4" />
              <stop offset="0.62" stopColor="#ece4d3" />
              <stop offset="1" stopColor="#e1d7c0" />
            </linearGradient>
            <radialGradient id="mk-glow" cx="0.5" cy="0.4" r="0.55">
              <stop offset="0" stopColor="#fffdf7" stopOpacity="0.9" />
              <stop offset="1" stopColor="#fffdf7" stopOpacity="0" />
            </radialGradient>
            <radialGradient id="mk-vig" cx="0.5" cy="0.48" r="0.72">
              <stop offset="0.68" stopColor="#3a352b" stopOpacity="0" />
              <stop offset="1" stopColor="#3a352b" stopOpacity="0.14" />
            </radialGradient>
            <filter id="mk-soft" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="4" />
            </filter>
            <filter id="mk-brush" x="-25%" y="-25%" width="150%" height="150%">
              <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed="4" result="t" />
              <feDisplacementMap in="SourceGraphic" in2="t" scale="2.4" />
            </filter>
            <FabricFilter id="mk-fab" p={p} />
          </defs>

          {/* studio backdrop */}
          <rect width={VB_W} height={VB_H} fill="url(#mk-studio)" />
          <rect width={VB_W} height={VB_H} fill="url(#mk-glow)" />

          {/* contact shadow */}
          <ellipse cx={VB_W / 2} cy={ground.y} rx={ground.rx} ry="9" fill="#2a261d" opacity="0.16" filter="url(#mk-soft)" />

          {/* the garment — exact zones, dressed with fabric + volume */}
          <g filter="url(#mk-fab)" pointerEvents="none" aria-hidden>
            <Art colors={design.zoneColors} activeZone={-1} onZone={() => {}} />
          </g>

          {/* the AAA mark — exactly where it was placed, in the chosen finish */}
          <g transform={`translate(${lx} ${ly}) scale(${design.logo.scale})`} aria-hidden>
            {style === "embroidered" && (
              <>
                <path
                  d={WAVE}
                  fill="none"
                  stroke={shade(lc, 0.7)}
                  strokeWidth={3.8}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  transform="translate(0 0.7)"
                />
                <path
                  d={WAVE}
                  fill="none"
                  stroke={lc}
                  strokeWidth={3.1}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeDasharray="2.4 1.5"
                />
              </>
            )}
            {style === "painted" && (
              <path
                d={WAVE}
                fill="none"
                stroke={lc}
                strokeWidth={3.2}
                strokeLinecap="round"
                strokeLinejoin="round"
                opacity={0.9}
                filter="url(#mk-brush)"
              />
            )}
            {style === "printed" && (
              <path d={WAVE} fill="none" stroke={lc} strokeWidth={2.6} strokeLinecap="round" strokeLinejoin="round" />
            )}
          </g>

          {/* studio vignette on top for depth */}
          <rect width={VB_W} height={VB_H} fill="url(#mk-vig)" pointerEvents="none" />
        </svg>
      </div>

      <p className="font-typewriter mt-2.5 flex items-baseline justify-between text-[9px] uppercase tracking-[0.18em] text-ink/70">
        <span>{t("pages.mockup.livePreview")}</span>
        <button type="button" onClick={download} className="uppercase tracking-[0.16em] underline-offset-2 hover:text-ink hover:underline">
          ↓ {t("pages.mockup.saveRender")}
        </button>
      </p>
      <HandNote rot={-2} className="mt-1 self-end text-[14px]">
        {t("pages.mockup.note")}
      </HandNote>
    </div>
  );
}
