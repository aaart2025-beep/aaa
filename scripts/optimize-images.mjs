// One-time (re-runnable) image compressor for /public — recompresses in place
// so no code paths change and both the Vercel and static Hostinger deploys
// benefit. Skips anything already small. Usage: node scripts/optimize-images.mjs
import sharp from "sharp";
import { readdirSync, statSync, renameSync, unlinkSync } from "fs";
import { join, extname } from "path";

const TARGET_DIRS = ["public/products", "public/images"];
const MAX_EDGE = 1600; // px — nothing on the site renders larger
const SKIP_BELOW = 120 * 1024; // already-small files stay untouched
const PNG_OPTS = { quality: 82, palette: true, compressionLevel: 9 };
const JPEG_OPTS = { quality: 78, mozjpeg: true };
const WEBP_OPTS = { quality: 80 };

const files = [];
for (const dir of TARGET_DIRS) {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (!statSync(p).isFile()) continue;
    const ext = extname(name).toLowerCase();
    if ([".png", ".jpg", ".jpeg", ".webp"].includes(ext)) files.push({ p, ext });
  }
}

let before = 0;
let after = 0;
let skipped = 0;
const rows = [];

for (const { p, ext } of files) {
  const orig = statSync(p).size;
  before += orig;
  if (orig < SKIP_BELOW) {
    after += orig;
    skipped++;
    continue;
  }
  try {
    const tmp = `${p}.opt`;
    let pipe = sharp(p).rotate(); // respect EXIF orientation
    const meta = await sharp(p).metadata();
    if ((meta.width ?? 0) > MAX_EDGE || (meta.height ?? 0) > MAX_EDGE) {
      pipe = pipe.resize(MAX_EDGE, MAX_EDGE, { fit: "inside", withoutEnlargement: true });
    }
    if (ext === ".png") pipe = pipe.png(PNG_OPTS);
    else if (ext === ".webp") pipe = pipe.webp(WEBP_OPTS);
    else pipe = pipe.jpeg(JPEG_OPTS);
    await pipe.toFile(tmp);
    const optimized = statSync(tmp).size;
    if (optimized < orig * 0.92) {
      renameSync(tmp, p);
      after += optimized;
      rows.push({ file: p.split("/").pop(), from: orig, to: optimized });
    } else {
      unlinkSync(tmp); // not worth it — keep the original
      after += orig;
      skipped++;
    }
  } catch (e) {
    after += orig;
    console.error(`FAILED ${p}: ${String(e).slice(0, 100)}`);
  }
}

const mb = (n) => (n / 1024 / 1024).toFixed(1);
rows.sort((a, b) => b.from - b.to - (a.from - a.to)).reverse();
console.log(`\nTop savings:`);
for (const r of rows.slice(-12).reverse()) {
  console.log(`  ${r.file}: ${mb(r.from)}MB → ${mb(r.to)}MB`);
}
console.log(`\n${files.length} files scanned, ${rows.length} recompressed, ${skipped} kept as-is`);
console.log(`TOTAL: ${mb(before)}MB → ${mb(after)}MB (saved ${mb(before - after)}MB)`);
