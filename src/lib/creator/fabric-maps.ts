/* Procedural fabric normal maps (client canvas) so the 3D garments catch light
 * with real surface texture — weave, twill ridges, corduroy ribs, leather
 * pebbling, fleece fuzz — without shipping any image assets. A height field is
 * generated per fabric kind, then Sobel-converted to a tangent-space normal map. */

export type FabricKind = "smooth" | "leather" | "woven" | "twill" | "ribbed" | "fuzzy";

function mulberry32(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** smooth value noise via a bilinearly-interpolated random lattice */
function valueNoise(S: number, grid: number, rng: () => number): Float32Array {
  const g = grid + 1;
  const lat = new Float32Array(g * g);
  for (let i = 0; i < g * g; i++) lat[i] = rng();
  const out = new Float32Array(S * S);
  for (let y = 0; y < S; y++) {
    for (let x = 0; x < S; x++) {
      const fx = (x / S) * grid;
      const fy = (y / S) * grid;
      const x0 = Math.floor(fx);
      const y0 = Math.floor(fy);
      const tx = fx - x0;
      const ty = fy - y0;
      const a = lat[y0 * g + x0];
      const b = lat[y0 * g + x0 + 1];
      const c = lat[(y0 + 1) * g + x0];
      const d = lat[(y0 + 1) * g + x0 + 1];
      const top = a + (b - a) * tx;
      const bot = c + (d - c) * tx;
      out[y * S + x] = top + (bot - top) * ty;
    }
  }
  return out;
}

function heightField(kind: FabricKind, S: number): Float32Array {
  const rng = mulberry32(1337);
  const h = new Float32Array(S * S);
  if (kind === "fuzzy") {
    const n = valueNoise(S, 96, rng);
    for (let i = 0; i < h.length; i++) h[i] = n[i];
  } else if (kind === "leather") {
    const n1 = valueNoise(S, 16, rng);
    const n2 = valueNoise(S, 44, rng);
    for (let i = 0; i < h.length; i++) h[i] = n1[i] * 0.7 + n2[i] * 0.3;
  } else if (kind === "smooth") {
    const n = valueNoise(S, 28, rng);
    for (let i = 0; i < h.length; i++) h[i] = n[i] * 0.35;
  } else {
    // woven / twill / ribbed — periodic ridges
    for (let y = 0; y < S; y++) {
      for (let x = 0; x < S; x++) {
        const u = x / S;
        const v = y / S;
        let val: number;
        if (kind === "twill") val = Math.cos((u + v) * Math.PI * 2 * 13);
        else if (kind === "ribbed") val = Math.cos(u * Math.PI * 2 * 18);
        else val = (Math.cos(u * Math.PI * 2 * 17) + Math.cos(v * Math.PI * 2 * 17)) * 0.5; // woven
        h[y * S + x] = val * 0.5 + 0.5;
      }
    }
  }
  return h;
}

export function makeFabricNormal(kind: FabricKind, S = 256): HTMLCanvasElement | null {
  if (typeof document === "undefined") return null;
  const h = heightField(kind, S);
  const c = document.createElement("canvas");
  c.width = c.height = S;
  const ctx = c.getContext("2d");
  if (!ctx) return null;
  const img = ctx.createImageData(S, S);
  const strength = 2.0;
  const at = (x: number, y: number) => h[((y + S) % S) * S + ((x + S) % S)];
  for (let y = 0; y < S; y++) {
    for (let x = 0; x < S; x++) {
      const dx = (at(x + 1, y) - at(x - 1, y)) * strength;
      const dy = (at(x, y + 1) - at(x, y - 1)) * strength;
      // tangent-space normal from the height gradient
      let nx = -dx;
      let ny = -dy;
      const nz = 1;
      const len = Math.hypot(nx, ny, nz) || 1;
      nx /= len;
      ny /= len;
      const nzn = nz / len;
      const o = (y * S + x) * 4;
      img.data[o] = (nx * 0.5 + 0.5) * 255;
      img.data[o + 1] = (ny * 0.5 + 0.5) * 255;
      img.data[o + 2] = (nzn * 0.5 + 0.5) * 255;
      img.data[o + 3] = 255;
    }
  }
  ctx.putImageData(img, 0, 0);
  return c;
}
