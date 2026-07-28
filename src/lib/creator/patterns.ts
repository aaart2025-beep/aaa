/* Seamless pattern tiles for the creator — drawn on a plain 2D canvas so they
 * work both as a three.js texture (3D garments) and as an image fill (mockup).
 * Motifs are pulled from the AAA world: graph paper, the AAA waveform, classic
 * stripes/pinstripes, a kilim band (like the Kilim Wrap Skirt), and dots. */

export type PatternType =
  | "solid"
  | "stripes"
  | "pinstripe"
  | "graph"
  | "waveform"
  | "kilim"
  | "dots"
  | "plaid"
  | "camo"
  | "floral";

export interface PatternDef {
  type: PatternType;
  /** the motif colour (drawn over the zone's base colour) */
  color: string;
  /** density multiplier (0.5 = larger/sparser, 2 = small/dense) */
  scale: number;
  /** texture rotation in degrees (applied at the texture level so tiles stay seamless) */
  angle: number;
}

export const PATTERNS: { key: PatternType; label: string }[] = [
  { key: "solid", label: "Solid" },
  { key: "stripes", label: "Stripes" },
  { key: "pinstripe", label: "Pinstripe" },
  { key: "graph", label: "Graph" },
  { key: "waveform", label: "Waveform" },
  { key: "kilim", label: "Kilim" },
  { key: "dots", label: "Dots" },
  { key: "plaid", label: "Plaid" },
  { key: "camo", label: "Camo" },
  { key: "floral", label: "Floral" },
];

export const defaultPattern = (): PatternDef => ({ type: "solid", color: "#26221a", scale: 1, angle: 0 });

const WAVE = "M-14 3 L-8 3 L-4 -5 L-1 4 L2 -6 L5 4 L9 -3 L13 3 L14 3";

/** Paint one seamless SxS tile of the pattern over `base`. */
export function paintPatternTile(ctx: CanvasRenderingContext2D, S: number, base: string, def: PatternDef): void {
  ctx.clearRect(0, 0, S, S);
  ctx.fillStyle = base;
  ctx.fillRect(0, 0, S, S);
  if (def.type === "solid") return;

  const k = Math.max(0.4, def.scale);
  ctx.strokeStyle = def.color;
  ctx.fillStyle = def.color;
  ctx.lineCap = "butt";

  if (def.type === "stripes") {
    const bands = Math.round(3 * k);
    const period = S / bands;
    for (let i = 0; i < bands; i++) ctx.fillRect(0, i * period, S, period * 0.5);
  } else if (def.type === "pinstripe") {
    const lines = Math.round(6 * k);
    const gap = S / lines;
    ctx.lineWidth = Math.max(1.5, S * 0.008);
    for (let i = 0; i < lines; i++) {
      const y = i * gap + gap / 2;
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(S, y);
      ctx.stroke();
    }
  } else if (def.type === "graph") {
    const cells = Math.round(6 * k);
    const gap = S / cells;
    ctx.lineWidth = Math.max(1, S * 0.005);
    ctx.globalAlpha = 0.7;
    for (let i = 0; i <= cells; i++) {
      const p = i * gap;
      ctx.beginPath();
      ctx.moveTo(p, 0);
      ctx.lineTo(p, S);
      ctx.moveTo(0, p);
      ctx.lineTo(S, p);
      ctx.stroke();
    }
    ctx.globalAlpha = 1;
  } else if (def.type === "waveform") {
    const cols = Math.round(8 * k);
    const rows = Math.round(5 * k);
    const stepX = S / cols;
    const stepY = S / rows;
    ctx.lineWidth = Math.max(1.6, S * 0.01);
    ctx.lineJoin = "round";
    const path = new Path2D(WAVE);
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        ctx.save();
        ctx.translate(c * stepX + stepX / 2, r * stepY + stepY / 2);
        ctx.scale(stepX / 30, stepX / 30);
        ctx.stroke(path);
        ctx.restore();
      }
    }
  } else if (def.type === "kilim") {
    const bands = Math.round(4 * k);
    const bh = S / bands;
    for (let b = 0; b < bands; b++) {
      const y = b * bh;
      // a row of alternating triangles (a woven kilim band)
      const tw = bh * 0.9;
      ctx.globalAlpha = b % 2 ? 0.55 : 1;
      for (let x = 0; x < S; x += tw) {
        ctx.beginPath();
        ctx.moveTo(x, y + bh * 0.75);
        ctx.lineTo(x + tw / 2, y + bh * 0.2);
        ctx.lineTo(x + tw, y + bh * 0.75);
        ctx.closePath();
        ctx.fill();
      }
      ctx.globalAlpha = 1;
      ctx.fillRect(0, y + bh * 0.82, S, bh * 0.07);
    }
  } else if (def.type === "dots") {
    const cells = Math.round(5 * k);
    const gap = S / cells;
    const r = gap * 0.18;
    for (let i = 0; i < cells; i++) {
      for (let j = 0; j < cells; j++) {
        ctx.beginPath();
        ctx.arc(i * gap + gap / 2, j * gap + gap / 2, r, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  } else if (def.type === "plaid") {
    // tartan: wide bands + thin lines, both directions, overlapping (Skate Flannel)
    const n = Math.max(2, Math.round(2.5 * k));
    const period = S / n;
    ctx.globalAlpha = 0.5;
    for (let i = 0; i < n; i++) {
      ctx.fillRect(0, i * period, S, period * 0.34);
      ctx.fillRect(i * period, 0, period * 0.34, S);
    }
    ctx.globalAlpha = 0.85;
    for (let i = 0; i < n; i++) {
      ctx.fillRect(0, i * period + period * 0.55, S, period * 0.1);
      ctx.fillRect(i * period + period * 0.55, 0, period * 0.1, S);
    }
    ctx.globalAlpha = 1;
  } else if (def.type === "camo") {
    // soft organic blobs, tiled seamlessly via wrapped copies
    const blobs = [
      [0.2, 0.25, 0.2], [0.62, 0.16, 0.16], [0.82, 0.52, 0.18],
      [0.36, 0.62, 0.22], [0.1, 0.82, 0.17], [0.66, 0.86, 0.19], [0.5, 0.42, 0.15],
    ];
    ctx.globalAlpha = 0.5;
    for (const [bx, by, br] of blobs) {
      for (let ox = -1; ox <= 1; ox++) {
        for (let oy = -1; oy <= 1; oy++) {
          ctx.beginPath();
          ctx.ellipse((bx + ox) * S, (by + oy) * S, br * S, br * S * 0.78, 0.5, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    }
    ctx.globalAlpha = 1;
  } else if (def.type === "floral") {
    // simple five-petal flowers on a grid (Floral Mosaic)
    const cells = Math.max(2, Math.round(2.5 * k));
    const gap = S / cells;
    for (let i = 0; i < cells; i++) {
      for (let j = 0; j < cells; j++) {
        const cx = i * gap + gap / 2;
        const cy = j * gap + gap / 2;
        const r = gap * 0.16;
        for (let p = 0; p < 5; p++) {
          const a = (p / 5) * Math.PI * 2;
          ctx.beginPath();
          ctx.ellipse(cx + Math.cos(a) * r, cy + Math.sin(a) * r, r * 0.7, r * 0.4, a, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.beginPath();
        ctx.arc(cx, cy, r * 0.42, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }
}

/** Build a tile canvas for the pattern (client only). */
export function makePatternCanvas(base: string, def: PatternDef, S = 256): HTMLCanvasElement | null {
  if (typeof document === "undefined") return null;
  const c = document.createElement("canvas");
  c.width = c.height = S;
  const ctx = c.getContext("2d");
  if (!ctx) return null;
  paintPatternTile(ctx, S, base, def);
  return c;
}

/** Data-URL of one tile, for SVG/CSS image fills (client only). */
export function patternDataUrl(base: string, def: PatternDef, S = 256): string | null {
  const c = makePatternCanvas(base, def, S);
  return c ? c.toDataURL() : null;
}
