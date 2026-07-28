// Product photo surgery:
//  1. Remove leftover white mannequin pixels inside the halter cutouts
//     (region-grow from seeds over flat near-white, then feather the edge).
//  2. Crop multi-angle photos down to a single view (cap front, cap back,
//     bodysuit front) by segmenting the alpha projection.
//  3. Trim transparent margins on every product cutout and re-pad uniformly,
//     so all pieces render the same visual size on the shop grid.
// Idempotent; run: node scripts/fix-product-photos.mjs
import sharp from "sharp";
import { statSync } from "fs";

const DIR = "public/products";

async function loadRaw(file) {
  const img = sharp(`${DIR}/${file}`).ensureAlpha();
  const { data, info } = await img.raw().toBuffer({ resolveWithObject: true });
  return { data, w: info.width, h: info.height };
}

function saveRaw({ data, w, h }, file) {
  return sharp(data, { raw: { width: w, height: h, channels: 4 } })
    .png({ compressionLevel: 9, palette: false })
    .toFile(`${DIR}/${file}`);
}

/** BFS from seed points over connected flat near-white pixels → alpha 0. */
async function removeMannequin(file, seeds, minChannel, maxSpread) {
  const { data, w, h } = await loadRaw(file);
  const isWhite = (i) => {
    const r = data[i], g = data[i + 1], b = data[i + 2], a = data[i + 3];
    if (a < 40) return false;
    const mx = Math.max(r, g, b), mn = Math.min(r, g, b);
    return mn >= minChannel && mx - mn <= maxSpread;
  };
  const mask = new Uint8Array(w * h);
  const queue = [];
  for (const [nx, ny] of seeds) {
    const x = Math.round(nx * w), y = Math.round(ny * h);
    const p = y * w + x;
    if (isWhite(p * 4) && !mask[p]) {
      mask[p] = 1;
      queue.push(p);
    }
  }
  let head = 0;
  while (head < queue.length) {
    const p = queue[head++];
    const x = p % w, y = (p / w) | 0;
    for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
      const nx = x + dx, ny = y + dy;
      if (nx < 0 || ny < 0 || nx >= w || ny >= h) continue;
      const np = ny * w + nx;
      if (!mask[np] && isWhite(np * 4)) {
        mask[np] = 1;
        queue.push(np);
      }
    }
  }
  // apply: masked → transparent; unmasked neighbours of the mask get softened
  // alpha so the cut edge doesn't look razor-hard against the knit
  let removed = 0;
  for (let p = 0; p < w * h; p++) {
    if (mask[p]) {
      data[p * 4 + 3] = 0;
      removed++;
    }
  }
  for (let p = 0; p < w * h; p++) {
    if (mask[p] || data[p * 4 + 3] === 0) continue;
    const x = p % w, y = (p / w) | 0;
    let nearMask = false;
    for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
      const nx = x + dx, ny = y + dy;
      if (nx < 0 || ny < 0 || nx >= w || ny >= h) continue;
      if (mask[ny * w + nx]) nearMask = true;
    }
    if (nearMask) data[p * 4 + 3] = Math.round(data[p * 4 + 3] * 0.55);
  }
  await saveRaw({ data, w, h }, file);
  console.log(`${file}: mannequin removed (${removed} px, ${((removed / (w * h)) * 100).toFixed(1)}%)`);
}

/** Split the image into content segments along an axis (gaps = fully
 *  transparent lines) and keep only one segment, tightly cropped. */
async function cropSegment(file, axis, keepIndex) {
  const { data, w, h } = await loadRaw(file);
  const len = axis === "x" ? w : h;
  const other = axis === "x" ? h : w;
  const filled = new Array(len).fill(false);
  for (let i = 0; i < len; i++) {
    for (let j = 0; j < other; j++) {
      const p = axis === "x" ? j * w + i : i * w + j;
      if (data[p * 4 + 3] > 12) {
        filled[i] = true;
        break;
      }
    }
  }
  // merge tiny gaps (<1.5% of length) so frayed edges don't split a segment
  const minGap = Math.round(len * 0.015);
  const segments = [];
  let start = -1, gap = 0;
  for (let i = 0; i < len; i++) {
    if (filled[i]) {
      if (start === -1) start = i;
      gap = 0;
    } else if (start !== -1) {
      gap++;
      if (gap > minGap) {
        segments.push([start, i - gap]);
        start = -1;
        gap = 0;
      }
    }
  }
  if (start !== -1) segments.push([start, len - 1 - gap]);
  if (segments.length <= keepIndex) {
    console.log(`${file}: only ${segments.length} segment(s) found — skipped`);
    return;
  }
  const [s0, s1] = segments[keepIndex];
  const region =
    axis === "x"
      ? { left: s0, top: 0, width: s1 - s0 + 1, height: h }
      : { left: 0, top: s0, width: w, height: s1 - s0 + 1 };
  await sharp(data, { raw: { width: w, height: h, channels: 4 } })
    .extract(region)
    .png({ compressionLevel: 9 })
    .toFile(`${DIR}/${file}.tmp.png`);
  await sharp(`${DIR}/${file}.tmp.png`).toFile(`${DIR}/${file}`);
  const { unlinkSync } = await import("fs");
  unlinkSync(`${DIR}/${file}.tmp.png`);
  console.log(`${file}: kept ${axis}-segment ${keepIndex} of ${segments.length} [${s0}..${s1}]`);
}

/** Trim transparent margins and re-pad with a uniform border so every product
 *  fills its shop square equally. Only touches cutouts (images with alpha). */
async function trimAndPad(file, padFrac = 0.045) {
  const path = `${DIR}/${file}`;
  const meta = await sharp(path).metadata();
  if (!meta.hasAlpha) return false;
  const { data, info } = await sharp(path).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const w = info.width, h = info.height;
  let minX = w, minY = h, maxX = -1, maxY = -1;
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      if (data[(y * w + x) * 4 + 3] > 12) {
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;
      }
    }
  }
  if (maxX < 0) return false; // fully transparent?!
  const cw = maxX - minX + 1, ch = maxY - minY + 1;
  // already tight? (margins under 6% on every side) → leave untouched
  const margins = [minX, minY, w - 1 - maxX, h - 1 - maxY];
  const loose = margins.some((m) => m > Math.max(w, h) * 0.06);
  if (!loose) return false;
  const pad = Math.round(Math.max(cw, ch) * padFrac);
  await sharp(data, { raw: { width: w, height: h, channels: 4 } })
    .extract({ left: minX, top: minY, width: cw, height: ch })
    .extend({ top: pad, bottom: pad, left: pad, right: pad, background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png({ compressionLevel: 9 })
    .toFile(`${path}.tmp.png`);
  const { renameSync } = await import("fs");
  renameSync(`${path}.tmp.png`, path);
  return true;
}

// ---- 1. mannequin removal -------------------------------------------------
await removeMannequin(
  "halter-ecru-front.png",
  [[0.5, 0.28], [0.5, 0.4], [0.46, 0.2], [0.54, 0.2], [0.5, 0.5]],
  238,
  12,
);
await removeMannequin(
  "halter-stripe-front.png",
  [[0.5, 0.28], [0.5, 0.4], [0.46, 0.2], [0.54, 0.2], [0.5, 0.5]],
  248,
  8,
);
await removeMannequin(
  "halter-ecru-back.png",
  [[0.5, 0.3], [0.5, 0.45], [0.42, 0.35], [0.58, 0.35], [0.5, 0.55]],
  240,
  10,
);

// ---- 2. single-view crops ---------------------------------------------------
await cropSegment("cap-zebra.png", "x", 0); // straight-on front cap
await cropSegment("cap-zebra-views.png", "y", 1); // clean back view
await cropSegment("bodysuit-rust.png", "x", 0); // front figure

// ---- 3. uniform sizing across the shop -------------------------------------
const res = await fetch("https://aaa-teal-theta.vercel.app/api/content");
const content = await res.json();
const products = content.products ?? content.data?.products ?? [];
const files = new Set();
for (const p of products) for (const img of p.images ?? []) {
  if (img.startsWith("/products/")) files.add(img.slice("/products/".length));
}
let trimmed = 0;
for (const f of files) {
  try {
    statSync(`${DIR}/${f}`);
  } catch {
    continue; // blob-hosted or missing — skip
  }
  if (await trimAndPad(f)) {
    trimmed++;
    console.log(`trimmed: ${f}`);
  }
}
console.log(`\nuniform-size pass: ${trimmed} of ${files.size} images re-margined`);
