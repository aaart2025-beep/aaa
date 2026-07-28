import pkg from "playwright";
const { chromium } = pkg;
const BASE = process.argv[2] || "http://localhost:3000";
const OUT = process.argv[3] || "/tmp/aaa-shots/photos";
import { mkdirSync } from "fs";
mkdirSync(OUT, { recursive: true });
const browser = await chromium.launch({ channel: "chrome" }).catch(() => chromium.launch());
const page = await (await browser.newContext({ viewport: { width: 1440, height: 1000 } })).newPage();
const slugs = ["ecru-frayed-halter", "coastal-stripe-halter", "zebra-brim-cap", "sculpt-bodysuit"];
for (const s of slugs) {
  await page.goto(`${BASE}/shop/${s}`, { waitUntil: "networkidle", timeout: 60000 }).catch(() => {});
  await page.waitForTimeout(2500);
  await page.screenshot({ path: `${OUT}/${s}.png` });
  console.log("ok", s);
}
await page.goto(`${BASE}/shop`, { waitUntil: "networkidle", timeout: 60000 }).catch(() => {});
await page.waitForTimeout(3000);
await page.screenshot({ path: `${OUT}/shop.png` });
console.log("ok shop");
await browser.close();
