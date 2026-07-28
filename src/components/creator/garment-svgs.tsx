"use client";

import type * as React from "react";
import type { BaseKey } from "@/lib/creator/config";

/* Colorable garment drawings for the creator — the artist's flats, inked in
 * the workbook style, with every zone clickable and filled by the visitor's
 * palette. Zone order matches BASES[...].zones in lib/creator/config. */

const INK = "#3a352b";

interface ZoneProps {
  d: string | string[];
  color: string;
  active: boolean;
  onClick: () => void;
  /** render as coloured STROKE lines (laces, waveform) instead of a fill */
  stroke?: boolean;
  strokeWidth?: number;
  title: string;
}

function Zone({ d, color, active, onClick, stroke = false, strokeWidth = 5, title }: ZoneProps) {
  const ds = Array.isArray(d) ? d : [d];
  return (
    <g
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      className="cursor-pointer"
      role="button"
      aria-label={`Colour the ${title}`}
    >
      {ds.map((path, i) =>
        stroke ? (
          <g key={i}>
            {/* fat invisible hit area, then the coloured line, then active ring */}
            <path d={path} fill="none" stroke="transparent" strokeWidth={strokeWidth + 12} strokeLinecap="round" />
            <path
              d={path}
              fill="none"
              stroke={color}
              strokeWidth={strokeWidth}
              strokeLinecap="round"
              strokeLinejoin="round"
              className="transition-[stroke] duration-300"
            />
          </g>
        ) : (
          <g key={i}>
            <path d={path} fill={color} className="transition-[fill] duration-300" />
            <path d={path} fill="none" stroke={INK} strokeWidth={1.8} strokeLinejoin="round" />
          </g>
        ),
      )}
      {active &&
        ds.map((path, i) => (
          <path
            key={`hl-${i}`}
            d={path}
            fill="none"
            stroke="#a6db1e"
            strokeWidth={stroke ? strokeWidth + 5 : 3.5}
            strokeDasharray="7 5"
            strokeLinecap="round"
            strokeLinejoin="round"
            opacity={0.95}
            pointerEvents="none"
          />
        ))}
    </g>
  );
}

export interface GarmentArtProps {
  colors: string[];
  activeZone: number;
  onZone: (i: number) => void;
}

/* ------------------------------- hoodie ------------------------------- */

export function HoodieArt({ colors, activeZone, onZone }: GarmentArtProps) {
  const zp = (i: number) => ({ color: colors[i] ?? "#eee", active: activeZone === i, onClick: () => onZone(i) });
  return (
    <g>
      {/* sleeves (behind body) */}
      <Zone
        title="sleeves"
        {...zp(2)}
        d={[
          "M118 70 L82 88 L66 198 L98 208 L108 100 Z",
          "M202 70 L238 88 L254 198 L222 208 L212 100 Z",
        ]}
      />
      {/* body */}
      <Zone
        title="body"
        {...zp(0)}
        d="M118 68 L104 82 L100 230 C136 243 184 243 220 230 L216 82 L202 68 C176 82 144 82 118 68 Z"
      />
      {/* hood */}
      <Zone
        title="hood"
        {...zp(1)}
        d="M118 68 C112 30 208 30 202 68 C186 54 134 54 118 68 Z"
      />
      {/* pocket */}
      <Zone title="pocket" {...zp(3)} d="M134 166 L186 166 L181 210 L139 210 Z" />
      {/* ribbing: hem + cuffs */}
      <Zone
        title="ribbing"
        {...zp(4)}
        d={[
          "M100 224 L220 224 L220 236 C184 248 136 248 100 236 Z",
          "M64 192 L98 202 L96 214 L62 204 Z",
          "M256 192 L222 202 L224 214 L258 204 Z",
        ]}
      />
      {/* ink details: hood opening + drawcords */}
      <g fill="none" stroke={INK} strokeWidth={1.5} strokeLinecap="round" pointerEvents="none">
        <path d="M128 64 C136 50 184 50 192 64" />
        <path d="M150 70 C149 80 151 88 148 96 M170 70 C171 80 169 88 172 96" />
      </g>
    </g>
  );
}

/* -------------------------------- tee --------------------------------- */

export function TeeArt({ colors, activeZone, onZone }: GarmentArtProps) {
  const zp = (i: number) => ({ color: colors[i] ?? "#eee", active: activeZone === i, onClick: () => onZone(i) });
  return (
    <g>
      <Zone
        title="sleeves"
        {...zp(1)}
        d={[
          "M112 72 L72 96 L88 140 L112 126 Z",
          "M208 72 L248 96 L232 140 L208 126 Z",
        ]}
      />
      <Zone
        title="body"
        {...zp(0)}
        d="M112 70 L100 84 L104 234 C140 246 180 246 216 234 L220 84 L208 70 C182 86 138 86 112 70 Z"
      />
      <Zone
        title="collar"
        {...zp(2)}
        d="M112 70 C134 58 186 58 208 70 C198 82 122 82 112 70 Z"
      />
      <g fill="none" stroke={INK} strokeWidth={1.4} strokeLinecap="round" pointerEvents="none">
        <path d="M120 74 C140 84 180 84 200 74" />
        <path d="M106 228 L214 228" strokeDasharray="4 5" />
      </g>
    </g>
  );
}

/* -------------------------------- cap --------------------------------- */

export function CapArt({ colors, activeZone, onZone }: GarmentArtProps) {
  const zp = (i: number) => ({ color: colors[i] ?? "#eee", active: activeZone === i, onClick: () => onZone(i) });
  return (
    <g>
      {/* brim (behind, tucks under the crown front) */}
      <Zone
        title="brim"
        {...zp(2)}
        d="M120 170 C92 168 56 172 34 186 C32 191 35 194 41 194 C66 197 96 193 116 182 C124 178 126 172 120 170 Z"
      />
      {/* crown dome */}
      <Zone
        title="crown"
        {...zp(0)}
        d="M96 170 C92 110 120 80 165 78 C214 80 248 116 250 170 C200 180 140 180 96 170 Z"
      />
      {/* front panel (the brim-side front of the crown) */}
      <Zone
        title="front panel"
        {...zp(1)}
        d="M150 81 C123 85 108 104 101 132 C98 150 98 162 100 170 C118 175 136 176 150 173 C147 142 147 111 150 81 Z"
      />
      {/* top button */}
      <Zone title="button" {...zp(3)} d="M159 74 a6 4.5 0 1 0 12 0 a6 4.5 0 1 0 -12 0 Z" />
      {/* panel seams, AAA mark on the front panel, brim topstitch */}
      <g fill="none" stroke={INK} strokeLinecap="round" pointerEvents="none">
        <path d="M165 80 C168 112 168 142 167 172" strokeWidth={1.4} opacity={0.5} />
        <path d="M203 84 C217 112 223 142 221 170" strokeWidth={1.4} opacity={0.5} />
        <path d="M108 134 L116 120 L124 134 L132 120 L140 134" strokeWidth={2} />
        <path d="M48 184 C74 188 98 185 114 177" stroke="#fff" strokeWidth={1} strokeDasharray="3 4" opacity={0.7} />
      </g>
    </g>
  );
}

/* ------------------------------- sneaker ------------------------------ */

export function SneakerArt({ colors, activeZone, onZone }: GarmentArtProps) {
  const zp = (i: number) => ({ color: colors[i] ?? "#eee", active: activeZone === i, onClick: () => onZone(i) });
  return (
    <g>
      {/* sole (behind; the upper seats down into it) */}
      <Zone
        title="sole"
        {...zp(4)}
        d="M50 208 C44 207 40 212 40 219 C40 228 47 233 57 233 L268 233 C280 233 286 227 285 219 C284 211 278 207 271 208 C200 204 120 204 50 208 Z"
      />
      {/* upper body */}
      <Zone
        title="upper"
        {...zp(0)}
        d="M52 216 C46 198 50 180 65 171 C83 161 105 162 125 161 C141 160 155 157 165 149 C169 157 173 164 179 169 C197 163 217 160 233 154 C257 153 273 173 277 198 C277 206 276 212 274 216 C200 213 122 213 52 216 Z"
      />
      {/* overlays: toe cap + heel counter */}
      <Zone
        title="overlays"
        {...zp(1)}
        d={[
          "M52 216 C48 199 53 182 66 173 C77 179 83 194 84 213 C72 215 60 216 52 216 Z",
          "M246 157 C264 159 274 177 278 200 C278 207 277 213 275 216 C262 216 252 216 246 215 C246 195 246 176 246 157 Z",
        ]}
      />
      {/* tongue — follows the upper colour */}
      <path
        d="M161 151 C163 138 174 136 178 147 C176 153 169 155 164 155 Z"
        fill={colors[0] ?? "#eee"}
        stroke={INK}
        strokeWidth={1.6}
        strokeLinejoin="round"
        pointerEvents="none"
        className="transition-[fill] duration-300"
      />
      {/* AAA waveform on the side quarter */}
      <Zone
        title="waveform"
        {...zp(2)}
        stroke
        strokeWidth={4}
        d="M150 195 L160 179 L170 195 L180 179 L190 195 L198 185"
      />
      {/* laces across the throat */}
      <Zone
        title="laces"
        {...zp(3)}
        stroke
        strokeWidth={4.5}
        d={["M127 167 L159 155", "M131 175 L163 163", "M135 183 L166 171"]}
      />
      {/* ink details: collar rim, midsole split, tread, eyelets */}
      <g fill="none" stroke={INK} strokeLinecap="round" pointerEvents="none">
        <path d="M165 150 C170 159 174 165 179 169 C197 163 216 160 232 155" strokeWidth={1.4} opacity={0.45} />
        <path d="M44 219 C150 215 210 215 285 218" strokeWidth={1.2} opacity={0.5} />
        <path d="M52 227 L280 225" strokeWidth={1.1} strokeDasharray="3 6" opacity={0.5} />
      </g>
      <g fill={INK} pointerEvents="none">
        <circle cx="125" cy="169" r="2" />
        <circle cx="129" cy="177" r="2" />
        <circle cx="133" cy="185" r="2" />
        <circle cx="161" cy="153" r="2" />
        <circle cx="165" cy="161" r="2" />
        <circle cx="168" cy="169" r="2" />
      </g>
    </g>
  );
}

export const GARMENT_ART: Record<BaseKey, React.ComponentType<GarmentArtProps>> = {
  hoodie: HoodieArt,
  tee: TeeArt,
  cap: CapArt,
  sneaker: SneakerArt,
};
