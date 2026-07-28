import pkg from "playwright";
const { chromium } = pkg;
const browser = await chromium.launch({ channel: "chrome" }).catch(() => chromium.launch());
const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, hasTouch: true, deviceScaleFactor: 2 });
const page = await ctx.newPage();
const routes = ["/shop", "/checkout", "/collection", "/about", "/login"];
for (const r of routes) {
  await page.goto(`http://localhost:3000${r}`, { waitUntil: "networkidle" }).catch(() => {});
  await page.waitForTimeout(2200);
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
  console.log(`${r}: horizontal overflow = ${overflow}px ${overflow > 0 ? "❌" : "✓"}`);
}
// tap-target audit on /shop
await page.goto("http://localhost:3000/shop", { waitUntil: "networkidle" }).catch(() => {});
await page.waitForTimeout(2000);
const targets = await page.evaluate(() => {
  const out = [];
  for (const b of document.querySelectorAll("button, a")) {
    const r = b.getBoundingClientRect();
    if (r.width === 0 || r.height === 0) continue;
    if (r.height < 34 && (b.textContent || "").trim()) out.push(`${(b.textContent || "").trim().slice(0, 18)} h=${Math.round(r.height)}`);
  }
  return out.slice(0, 10);
});
console.log("sub-34px tappables on /shop:", targets.length ? targets : "none ✓");
// hamburger drawer opens
await page.locator('button[aria-label="Open menu"]').first().click().catch((e) => console.log("hamburger fail", String(e).slice(0, 80)));
await page.waitForTimeout(700);
const drawerVisible = await page.evaluate(() => {
  const d = document.querySelector('aside[aria-label="Menu"]');
  return d ? getComputedStyle(d).transform : "missing";
});
console.log("menu drawer transform after open:", drawerVisible === "none" || drawerVisible.includes("matrix(1, 0, 0, 1, 0, 0)") ? "open ✓" : drawerVisible);
await page.screenshot({ path: "/tmp/aaa-shots/p5-drawer-390.png" });
// product page at 1440 (lg 2-col)
const page2 = await (await browser.newContext({ viewport: { width: 1440, height: 1000 } })).newPage();
await page2.goto("http://localhost:3000/shop", { waitUntil: "networkidle" }).catch(() => {});
const href = await page2.locator('a[href^="/shop/"]').first().getAttribute("href");
await page2.goto(`http://localhost:3000${href}`, { waitUntil: "networkidle" }).catch(() => {});
await page2.waitForTimeout(2500);
await page2.screenshot({ path: "/tmp/aaa-shots/p5-product-1440.png", fullPage: true });
console.log("product 2-col shot saved");
await browser.close();
