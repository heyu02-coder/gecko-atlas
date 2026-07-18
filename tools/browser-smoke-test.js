const { chromium } = require("playwright");
const fs = require("fs");

const candidates = {
  edge: ["C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe", "C:/Program Files/Microsoft/Edge/Application/msedge.exe"],
  chrome: ["C:/Program Files/Google/Chrome/Application/chrome.exe", "C:/Program Files (x86)/Google/Chrome/Application/chrome.exe"],
};
const browserName = process.argv[2] || "edge";
const executablePath = (candidates[browserName] || []).find(fs.existsSync);
if (!executablePath) throw new Error(`${browserName} executable not found`);

const base = process.env.GECKO_TEST_URL || "http://127.0.0.1:4173";
const profiles = [
  { name: "desktop", viewport: { width: 1440, height: 950 } },
  { name: "tablet", viewport: { width: 768, height: 1024 } },
  { name: "mobile", viewport: { width: 390, height: 844 }, isMobile: true },
];

async function assert(value, message) { if (!value) throw new Error(message); }

(async () => {
  const browser = await chromium.launch({ headless: true, executablePath });
  const results = [];
  for (const profile of profiles) {
    const page = await browser.newPage(profile);
    const runtimeErrors = [];
    page.on("pageerror", (error) => runtimeErrors.push(error.message));
    page.on("console", (message) => { if (message.type() === "error") runtimeErrors.push(message.text()); });

    const response = await page.goto(`${base}/index.html`, { waitUntil: "domcontentloaded" });
    await assert(response?.ok(), "homepage HTTP failure");
    await assert(await page.locator("#gecko-video").evaluate((video) => video.muted && !video.autoplay && !video.loop && !video.controls), "video attribute contract failed");
    await page.waitForFunction(() => document.documentElement.classList.contains("insect-cursor-ready"), null, { timeout: 20000 });
    await assert(await page.locator("canvas.insect-cursor").count() === 1, "3D insect cursor did not initialize");
    await page.locator("[data-search-open]").click();
    await page.locator(".search-overlay input").fill("体温");
    await assert(await page.locator(".search-results").getByText("体温管理").count(), "full-site search failed");
    await page.locator("[data-search-close]").click();

    await page.goto(`${base}/lab.html#thermoregulation`, { waitUntil: "domcontentloaded" });
    await page.locator("#thermoregulation").scrollIntoViewIfNeeded();
    await assert(await page.locator("[data-thermo-start]").isVisible(), "thermoregulation controls missing");

    for (const id of ["tokay", "marine", "komodo"]) {
      const dossierResponse = await page.goto(`${base}/species.html?id=${id}`, { waitUntil: "domcontentloaded" });
      await assert(dossierResponse?.ok(), `${id} dossier HTTP failure`);
      await assert(await page.locator("[data-dossier-map] svg").count() === 1, `${id} map missing`);
      await assert(await page.locator("[data-dossier-sources] a").count() >= 4, `${id} sources incomplete`);
    }

    for (const path of ["about.html", "credits.html", "404.html"]) {
      const staticResponse = await page.goto(`${base}/${path}`, { waitUntil: "domcontentloaded" });
      await assert(staticResponse?.ok(), `${path} HTTP failure`);
    }
    await assert(await page.locator(".error-copy").isVisible(), "custom 404 recovery page missing");
    await page.waitForTimeout(500);
    await assert(runtimeErrors.length === 0, `runtime errors: ${runtimeErrors.join(" | ")}`);
    results.push({ browser: browserName, profile: profile.name, status: "PASS" });
  }
  await browser.close();
  console.log(JSON.stringify(results, null, 2));
})().catch((error) => { console.error(error.stack || error); process.exit(1); });
