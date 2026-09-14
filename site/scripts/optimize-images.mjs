#!/usr/bin/env node
/**
 * optimize-images.mjs — right-size the static images Lighthouse flagged.
 *
 * Runs against public/ IN PLACE (originals backed up to scripts/.orig/ once,
 * so re-running is safe and idempotent — it skips files already optimized).
 *
 * What it does and why:
 *   favicon.png        256×256 126KB  → 64×64 WebP-class PNG  (~3-6KB).
 *                      The browser draws it at 16-36px; Lighthouse flagged
 *                      exactly this file (125KB est saving).
 *   apple-touch-icon   256→180×180 (iOS home-screen size).
 *   public/yt/*.jpg    1280×720 → 862×486 at q78. Cards render at 862×372
 *                      max (862px column minus card padding); 1280 was
 *                      pure waste on every phone.
 *
 * logo.png (703×703) stays untouched — it IS a press asset, downloadable
 * on purpose from /press.
 */
import sharp from 'sharp';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const pub = path.join(root, 'public');
const backupDir = path.join(path.dirname(fileURLToPath(import.meta.url)), '.orig');

/** Copy to backup once; never overwrite an original with an optimized file. */
function backup(file) {
  const dst = path.join(backupDir, file);
  fs.mkdirSync(path.dirname(dst), { recursive: true });
  if (!fs.existsSync(dst)) fs.copyFileSync(path.join(pub, file), dst);
}

const jobs = [
  { file: 'favicon.png', width: 64, height: 64, quality: null },
  { file: 'apple-touch-icon.png', width: 180, height: 180, quality: null },
  ...fs
    .readdirSync(path.join(pub, 'yt'))
    .filter((f) => f.endsWith('.jpg'))
    .map((f) => ({ file: `yt/${f}`, width: 862, height: 486, quality: 78 })),
];

let saved = 0;
for (const job of jobs) {
  const src = path.join(pub, job.file);
  if (!fs.existsSync(src)) continue;
  const before = fs.statSync(src).size;
  const meta = await sharp(src).metadata();
  // Idempotency: if it's already at/below target width, skip.
  if ((meta.width ?? 0) <= job.width) {
    console.log(`= ${job.file} already ${meta.width}px — skipped`);
    continue;
  }
  backup(job.file);
  // Read fully into memory first: sharp keeps the source handle open, and
  // writing to the same path on Windows races that handle (UNKNOWN -4094).
  const input = fs.readFileSync(src);
  let pipe = sharp(input).resize(job.width, job.height, { fit: 'cover' });
  pipe = job.quality != null ? pipe.jpeg({ quality: job.quality, mozjpeg: true }) : pipe.png({ compressionLevel: 9, palette: true });
  const out = await pipe.toBuffer();
  if (out.length >= before) {
    console.log(`= ${job.file} resize would grow file (${before} → ${out.length}) — skipped`);
    continue;
  }
  try {
    fs.writeFileSync(src, out);
  } catch {
    // Windows handle-release race — one short retry is always enough.
    await new Promise((r) => setTimeout(r, 150));
    fs.writeFileSync(src, out);
  }
  saved += before - out.length;
  console.log(`✓ ${job.file}  ${Math.round(before / 1024)}KB → ${Math.round(out.length / 1024)}KB  (${meta.width}×${meta.height} → ${job.width}×${job.height})`);
}
console.log(`done — ${(saved / 1024).toFixed(0)}KB saved this run`);
