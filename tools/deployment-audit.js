const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const entryFiles = ["index.html", "lab.html", "species.html", "about.html", "credits.html", "404.html"];
const sourceFiles = [...entryFiles, "styles.css", "museum.js", "lab.js", "species.js", "credits.js", "script.js"];
const ignoredExact = new Set([
  "server.py", "启动网页.cmd", "启动网页.ps1", "README.md", "CASE_STUDY.md", "TEST_MATRIX.md", "DEPLOYMENT.md",
  "package.json", "pnpm-lock.yaml", "pnpm-workspace.yaml", "cursor.js", "assets/insect-cursor.glb",
  "assets/gecko-attack.mp4", "8367e5e25c8014d093e62621785060a9.png",
]);
const ignoredDirectories = ["node_modules/", ".git/", ".agents/", ".review/", ".vercel/", "tools/"];
const references = new Map();
const vercelIgnore = new Set(fs.readFileSync(path.join(root, ".vercelignore"), "utf8").split(/\r?\n/).map((line) => line.trim()).filter((line) => line && !line.startsWith("#")));
for (const expected of [...ignoredExact, ...ignoredDirectories]) {
  if (!vercelIgnore.has(expected)) throw new Error(`Deployment audit rules drifted from .vercelignore: ${expected}`);
}

function normalizeReference(value, source) {
  if (value.includes("${")) return null;
  const clean = value.trim().split(/\s+/)[0].replace(/^['"]|['"]$/g, "").split(/[?#]/)[0];
  if (!clean || /^(?:https?:|data:|mailto:|tel:|javascript:|#|\/\/)/.test(clean)) return null;
  const normalized = path.posix.normalize(path.posix.join(path.posix.dirname(source), clean));
  return normalized.startsWith("../") ? null : normalized;
}

for (const source of sourceFiles) {
  const absolute = path.join(root, source);
  if (!fs.existsSync(absolute)) throw new Error(`Missing source file: ${source}`);
  const text = fs.readFileSync(absolute, "utf8");
  const values = [];
  for (const match of text.matchAll(/(?:src|href|srcset)=["']([^"']+)["']/g)) values.push(...match[1].split(","));
  for (const match of text.matchAll(/url\(["']?([^)'" ]+)/g)) values.push(match[1]);
  for (const match of text.matchAll(/["'`](assets\/[A-Za-z0-9_./-]+)["'`]/g)) values.push(match[1]);
  for (const value of values) {
    const reference = normalizeReference(value, source);
    if (!reference) continue;
    if (!references.has(reference)) references.set(reference, new Set());
    references.get(reference).add(source);
  }
}

const manifestPath = path.join(root, "assets/museum/image-manifest.json");
const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));
for (const item of manifest.items || []) {
  for (const reference of [item.desktop, item.mobile]) {
    if (!reference) continue;
    if (!references.has(reference)) references.set(reference, new Set());
    references.get(reference).add("assets/museum/image-manifest.json");
  }
}

const missing = [];
const excludedRuntime = [];
for (const [reference, sources] of references) {
  if (!fs.existsSync(path.join(root, reference))) missing.push(`${reference} <- ${[...sources].join(", ")}`);
  if (ignoredExact.has(reference) || ignoredDirectories.some((prefix) => reference.startsWith(prefix))) excludedRuntime.push(reference);
}
if (missing.length) throw new Error(`Missing runtime references:\n${missing.join("\n")}`);
if (excludedRuntime.length) throw new Error(`Runtime files excluded by .vercelignore:\n${excludedRuntime.join("\n")}`);

const index = fs.readFileSync(path.join(root, "index.html"), "utf8");
if (!/<video[^>]*\bmuted\b[^>]*\bplaysinline\b[^>]*\bpreload="auto"/s.test(index)) throw new Error("Video attribute contract changed");
const runtimeJs = ["script.js", "game.js", "exploration.js", "experiment-bridge.js"].map((file) => fs.readFileSync(path.join(root, file), "utf8")).join("\n");
if (/\.play\s*\(/.test(runtimeJs)) throw new Error("Forbidden media .play() call detected");
const cursorBundle = fs.readFileSync(path.join(root, "cursor.bundle.js"), "utf8");
if (!cursorBundle.includes("data:application/octet-stream;base64,")) throw new Error("Production cursor bundle no longer embeds the GLB model");

const vercel = JSON.parse(fs.readFileSync(path.join(root, "vercel.json"), "utf8"));
if (!Array.isArray(vercel.headers) || !vercel.headers.length) throw new Error("Vercel headers are missing");

let bytes = 0; let files = 0;
function walk(directory, relative = "") {
  for (const item of fs.readdirSync(directory, { withFileTypes: true })) {
    const rel = path.posix.join(relative, item.name);
    if (item.isDirectory()) {
      if (ignoredDirectories.some((prefix) => `${rel}/`.startsWith(prefix))) continue;
      walk(path.join(directory, item.name), rel);
    } else if (!ignoredExact.has(rel) && !item.name.endsWith(".log") && !item.name.startsWith(".env")) {
      bytes += fs.statSync(path.join(directory, item.name)).size; files += 1;
    }
  }
}
walk(root);
console.log(`Deployment audit PASS`);
console.log(`Runtime references checked: ${references.size}`);
console.log(`Estimated publish package: ${files} files / ${(bytes / 1024 / 1024).toFixed(2)} MB`);
