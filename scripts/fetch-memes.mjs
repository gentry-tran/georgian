// Fetches freely-licensed (CC / public-domain) funny cat images from Wikimedia
// Commons into src/assets/memes and records attribution in memes-credits.md.
// Original captions live in the app; these just add visual variety.
//
// Run: NODE_TLS_REJECT_UNAUTHORIZED=0 node scripts/fetch-memes.mjs
import { execSync } from "node:child_process";
import { writeFileSync, readFileSync, readdirSync, existsSync, appendFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");
const outDir = join(root, "src", "assets", "memes");
const env = { ...process.env, PATH: `${process.env.HOME}/homebrew/bin:${process.env.PATH}` };
const UA = "GeorgianLanguageApp/1.0 (educational; contact via repo)";

const QUERIES = [
  "funny cat", "surprised cat", "cat yawning", "grumpy cat", "cat playing",
  "silly cat", "cat jumping", "kitten funny", "cat sleeping funny", "cat face",
  "cat loaf", "cat in box", "cat staring", "sleepy kitten", "cat tongue",
  "wet cat", "cat hat", "cat zoomies", "cat stretching", "angry cat",
];
const TOTAL = 62; // desired total cat images on disk
const OK_LICENSE = /(CC0|CC BY|Public domain|No restrictions)/i;

// Continue numbering after any existing cat-NN.jpg, and skip titles we already
// downloaded (tracked in memes-credits.md) so re-runs only ADD new images.
const existing = readdirSync(outDir).filter((f) => /^cat-\d+\.jpg$/.test(f));
let startN = existing.reduce((mx, f) => Math.max(mx, parseInt(f.match(/\d+/)[0], 10)), 0);
const NEED = Math.max(0, TOTAL - existing.length);
const creditsFile = join(root, "memes-credits.md");
const alreadyTitles = new Set();
if (existsSync(creditsFile)) {
  for (const m of readFileSync(creditsFile, "utf8").matchAll(/—\s(.+?)\s—/g)) alreadyTitles.add(m[1].trim());
}

async function api(params) {
  const url = "https://commons.wikimedia.org/w/api.php?" + new URLSearchParams({ format: "json", ...params });
  return (await fetch(url, { headers: { "User-Agent": UA } })).json();
}

const seen = new Set(alreadyTitles);
const picked = [];
for (const q of QUERIES) {
  if (picked.length >= NEED) break;
  const d = await api({ action: "query", generator: "search", gsrnamespace: "6", gsrlimit: "25", gsrsearch: `${q} filetype:bitmap`, prop: "imageinfo", iiprop: "url|extmetadata", iiurlwidth: "500" });
  const pages = Object.values(d.query?.pages || {});
  for (const p of pages) {
    if (picked.length >= NEED) break;
    const ii = p.imageinfo?.[0];
    if (!ii) continue;
    const title = p.title.replace(/^File:/, "");
    if (seen.has(title)) continue;
    const lic = ii.extmetadata?.LicenseShortName?.value || "";
    if (!OK_LICENSE.test(lic)) continue;
    const thumb = ii.thumburl || ii.url;
    if (!/\.(jpe?g|png)$/i.test(thumb.split("?")[0])) continue;
    seen.add(title);
    picked.push({ title, thumb, lic, author: (ii.extmetadata?.Artist?.value || "").replace(/<[^>]+>/g, "").trim() });
  }
}

const credits = [];
let n = startN;
for (const m of picked) {
  n++;
  const id = String(n).padStart(2, "0");
  const file = join(outDir, `cat-${id}.jpg`);
  try {
    execSync(`curl -sL -A "${UA}" "${m.thumb}" -o "${file}.tmp"`, { env });
    execSync(`ffmpeg -y -loglevel error -i "${file}.tmp" -vf "scale='min(500,iw)':-1" "${file}"`, { env });
    execSync(`rm -f "${file}.tmp"`, { env });
    credits.push(`- cat-${id}.jpg — ${m.title} — ${m.author || "Wikimedia contributor"} — ${m.lic}`);
  } catch (e) {
    console.error("skip", m.title, e.message);
  }
}
const header = `# Meme image credits\n\nFunny cat images from Wikimedia Commons (CC / public domain). Captions are original.\n\n`;
if (existsSync(creditsFile)) appendFileSync(creditsFile, credits.join("\n") + "\n");
else writeFileSync(creditsFile, header + credits.join("\n") + "\n");
console.log(`Downloaded ${credits.length} new cat images (total target ${TOTAL}).`);
