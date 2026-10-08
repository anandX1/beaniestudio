/**
 * Screenshot pipeline: game-assets/*.png → responsive WebP in public/media/.
 *
 *   node scripts/media.mjs          # build missing outputs
 *   node scripts/media.mjs --force  # rebuild everything
 *
 * For every shot in src/data/media.json:
 *   public/media/<id>-640.webp, -1280.webp, -1920.webp (never upscaled)
 *   public/media/press/static-<id>.jpg      (only when "press": true)
 * and src/data/media-meta.json gets the source width/height (for aspect
 * ratios and CLS-free <img> tags). Outputs are committed — Cloudflare serves
 * the repo root, so there's no build step there.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const here = path.dirname(fileURLToPath(import.meta.url));
const SITE = path.resolve(here, '..');
const ASSETS = path.resolve(SITE, '..', 'game-assets');
const OUT = path.join(SITE, 'public', 'media');
const PRESS = path.join(OUT, 'press');
const WIDTHS = [640, 1280, 1920];
const force = process.argv.includes('--force');

const { shots } = JSON.parse(fs.readFileSync(path.join(SITE, 'src', 'data', 'media.json'), 'utf8'));
fs.mkdirSync(PRESS, { recursive: true });

const meta = {};
let made = 0;
for (const s of shots) {
  const src = path.join(ASSETS, s.src);
  if (!fs.existsSync(src)) throw new Error(`media: missing source ${s.src}`);
  const img = sharp(src).rotate();
  const { width, height } = await img.metadata();
  meta[s.id] = { w: width, h: height };
  for (const w of WIDTHS) {
    // Smaller buckets only when the source is bigger; the top bucket is
    // always written, at the source's own width if it's under 1920.
    const top = w === WIDTHS[WIDTHS.length - 1];
    if (!top && w !== WIDTHS[0] && w >= width) continue;
    const out = path.join(OUT, `${s.id}-${w}.webp`);
    if (!force && fs.existsSync(out)) continue;
    await sharp(src).resize({ width: Math.min(w, width) }).webp({ quality: w <= 640 ? 72 : 76, effort: 6, smartSubsample: true }).toFile(out);
    made++;
  }
  if (s.press) {
    const out = path.join(PRESS, `static-${s.id}.jpg`);
    if (force || !fs.existsSync(out)) {
      await sharp(src).flatten({ background: '#000' }).jpeg({ quality: 88, mozjpeg: true }).toFile(out);
      made++;
    }
  }
}
// Drop outputs for shots that left the manifest.
const keep = new Set(shots.map((s) => s.id));
for (const f of fs.readdirSync(OUT)) {
  const m = f.match(/^(.*)-(640|1280|1920)\.webp$/);
  if (m && !keep.has(m[1])) fs.rmSync(path.join(OUT, f));
}
for (const f of fs.readdirSync(PRESS)) {
  const m = f.match(/^static-(.*)\.jpg$/);
  if (m && !shots.find((s) => s.id === m[1] && s.press)) fs.rmSync(path.join(PRESS, f));
}
fs.writeFileSync(path.join(SITE, 'src', 'data', 'media-meta.json'), JSON.stringify(meta, null, 1) + '\n');
console.log(`media: ${shots.length} shots, ${made} files written`);
