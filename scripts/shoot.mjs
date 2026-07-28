// Screenshot harness for AAA site — usage: node /tmp/aaa-shot.mjs [outDir] [baseUrl]
// run from ~/artist-site-app so playwright resolves
import pkg from "playwright";
const { chromium } = pkg;
import { mkdirSync } from "fs";

const OUT = process.argv[2] || "/tmp/aaa-shots/before";
const BASE = process.argv[3] || "http://localhost:3000";
const WIDTHS = [390, 768, 1440];
const ROUTES = [
  ["home", "/"],
  ["shop", "/shop"],
  ["product", "/shop/__FIRST__"],
  ["collection", "/collection"],
  ["category", "/collection/__CAT__"],
  ["create", "/create"],
  ["a-book", "/a-book"],
  ["about", "/about"],
  ["checkout", "/checkout"],
  ["login", "/login"],
];

mkdirSync(OUT, { recursive: true });
const browser = await chromium
  .launch({ channel: "chrome" })
  .catch(() => chromium.launch());

// discover first product slug + first category from the shop page
const probe = await browser.newPage();
await probe.goto(`${BASE}/shop`, { waitUntil: "networkidle", timeout: 45000 });
await probe.waitForTimeout(2500);
const firstSlug = await probe
  .locator('a[href^="/shop/"]')
  .first()
  .getAttribute("href")
  .then((h) => (h || "/shop/").split("/").pop())
  .catch(() => "");
await probe.goto(`${BASE}/collection`, { waitUntil: "domcontentloaded", timeout: 45000 });
await probe.waitForTimeout(1500);
const firstCat = await probe
  .locator('a[href^="/collection/"]')
  .first()
  .getAttribute("href")
  .then((h) => (h || "/collection/for-her").split("/").pop())
  .catch(() => "for-her");
await probe.close();

for (const width of WIDTHS) {
  const ctx = await browser.newContext({
    viewport: { width, height: width < 500 ? 844 : 1000 },
    deviceScaleFactor: 1,
    reducedMotion: "no-preference",
  });
  const page = await ctx.newPage();
  for (const [name, route] of ROUTES) {
    const url =
      BASE + route.replace("__FIRST__", firstSlug || "").replace("__CAT__", firstCat);
    if (route.includes("__FIRST__") && !firstSlug) continue;
    try {
      await page.goto(url, { waitUntil: "networkidle", timeout: 45000 });
      await page.waitForTimeout(name === "home" ? 4000 : 2800);
      await page.screenshot({ path: `${OUT}/${name}-${width}.png`, fullPage: name !== "home" && name !== "a-book" });
      console.log(`ok ${name}-${width}`);
    } catch (e) {
      console.log(`FAIL ${name}-${width}: ${String(e).slice(0, 120)}`);
    }
  }
  await ctx.close();
}
await browser.close();
console.log("done →", OUT);
