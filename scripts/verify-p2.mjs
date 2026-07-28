import pkg from "playwright";
const { chromium } = pkg;
const browser = await chromium.launch({ channel: "chrome" }).catch(() => chromium.launch());
const page = await (await browser.newContext({ viewport: { width: 1440, height: 1000 } })).newPage();

// 1. /collection — canvases should mount only near viewport (≤3-ish), not 7
await page.goto("http://localhost:3000/collection", { waitUntil: "networkidle" }).catch(() => {});
await page.waitForTimeout(3000);
const topCanvases = await page.evaluate(() => document.querySelectorAll("canvas").length);
await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
await page.waitForTimeout(2500);
const bottomCanvases = await page.evaluate(() => document.querySelectorAll("canvas").length);
console.log(`collection canvases: top=${topCanvases} bottom=${bottomCanvases} (was 7 everywhere)`);

// 2. home — loader unmounts after fade; sessionStorage skip flag set
await page.goto("http://localhost:3000/", { waitUntil: "domcontentloaded" });
await page.waitForTimeout(6000);
const loaderStillMounted = await page.evaluate(() => !!document.querySelector(".z-\\[100\\]"));
const skipFlag = await page.evaluate(() => sessionStorage.getItem("aaa-hero-ready"));
console.log(`home: loader mounted after load=${loaderStillMounted} (want false), skip flag=${skipFlag}`);

// 3. /create — configurator canvas exists and renders
await page.goto("http://localhost:3000/create", { waitUntil: "networkidle" }).catch(() => {});
await page.waitForTimeout(5000);
const createCanvases = await page.evaluate(() => document.querySelectorAll("canvas").length);
console.log(`create canvases: ${createCanvases} (want 1)`);
const errors = [];
page.on("pageerror", (e) => errors.push(String(e)));
await page.screenshot({ path: "/tmp/aaa-shots/p2-create.png" });
await page.goto("http://localhost:3000/collection", { waitUntil: "domcontentloaded" });
await page.waitForTimeout(2000);
await page.screenshot({ path: "/tmp/aaa-shots/p2-collection.png" });
console.log("pageerrors:", errors.length ? errors : "none");
await browser.close();
