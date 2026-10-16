/**
 * AVIF sibling of scripts/media.mjs: same shots, same buckets, same
 * "never upscale" rule, same output directory, `.avif` instead of `.webp`.
 *
 *   node scripts/media-avif.mjs            # add missing .avif files
 *   node scripts/media-avif.mjs --force    # rebuild every .avif
 *   node scripts/media-avif.mjs --check    # verify the .avif set mirrors the .webp set
 *   node scripts/media-avif.mjs --report   # --check plus a per-bucket byte table
 *
 * WHY A SIBLING AND NOT A REPLACEMENT
 *   AVIF is broad but not universal, so the WebP set stays as the fallback and
 *   `Shot.full` stays WebP (it is the lightbox target AND the og:image; social
 *   crawlers do not accept image/avif). media.mjs keeps producing WebP, calls
 *   `writeAvif()` from this file so one `npm run media` keeps both sets in sync,
 *   and this file can also be run alone to (re)build AVIF without touching a
 *   single committed WebP.
 *
 * WHY THE QUALITY IS 55 AND NOT 60
 *   AVIF quality is not on the WebP scale. q55, effort 4, 4:2:0 measured
 *   -29.9% across the three existing buckets against the shipped WebP set
 *   (9.89 MB -> 6.93 MB); q60 only reaches -16.8%. Scoring each AVIF setting
 *   against the source PNG resized to 1600 px (PSNR + SSIM) showed q55 is
 *   SSIM-equal-or-better than the WebP the site ships today on 3 of 5
 *   worst-case shots and 0.0058 SSIM below on the darkest one. See
 *   _perf-lab/REPORT.md section 1.3 for the full table.
 *
 * GOTCHA WORTH KNOWING: sharp 0.35.4 reports `sharp.format.avif` as undefined.
 *   AVIF support lives under `sharp.format.heif` (`fileSuffix: ['.avif']`).
 *   `.avif()` on a sharp pipeline works fine; only the capability probe lies.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const here = path.dirname(fileURLToPath(import.meta.url));
const SITE = path.resolve(here, '..');
const ASSETS = path.resolve(SITE, '..', 'game-assets');
const OUT = path.join(SITE, 'public', 'media');
const MEDIA_JSON = path.join(SITE, 'src', 'data', 'media.json');

/** Buckets mirrored from media.mjs. Keep the two lists identical. */
export const AVIF_WIDTHS = [640, 1280, 1920];

export const AVIF_QUALITY = 55;
export const AVIF_EFFORT = 4;
export const AVIF_CHROMA = '4:2:0';

/**
 * Encode one AVIF mirror of the WebP that media.mjs writes for the same
 * (shot, bucket). `width` is the source's real pixel width, so the output is
 * never upscaled, exactly like media.mjs.
 *
 * @returns {Promise<boolean>} true when a file was written (false when skipped)
 */
export async function writeAvif({ src, id, width, bucket, force = false, out = OUT }) {
  const effective = Math.min(bucket, width);
  const dest = path.join(out, `${id}-${bucket}.avif`);
  if (!force && fs.existsSync(dest)) return false;
  // No .rotate() here on purpose: media.mjs does not auto-rotate its WebP
  // output either, and an AVIF whose geometry differs from its WebP sibling
  // would be a visible bug in the <picture> fallback. Both sets use the raw
  // pixel grid; the standalone runner warns if a source ever carries EXIF
  // orientation.
  const buf = await sharp(src)
    .resize({ width: effective })
    .avif({ quality: AVIF_QUALITY, effort: AVIF_EFFORT, chromaSubsampling: AVIF_CHROMA })
    .toBuffer();
  fs.writeFileSync(dest, buf);
  return true;
}

/** Buckets media.mjs actually writes for a source of this width. */
export function bucketsFor(width) {
  const out = [];
  for (const w of AVIF_WIDTHS) {
    const top = w === AVIF_WIDTHS[AVIF_WIDTHS.length - 1];
    if (!top && w !== AVIF_WIDTHS[0] && w >= width) continue;
    out.push(w);
  }
  return out;
}

/** Every .avif path the current srcset rule in media.ts can reference. */
export function expectedAvifFiles(shots, dims) {
  const files = [];
  for (const s of shots) {
    const d = dims[s.id];
    if (!d) throw new Error(`media-avif: ${s.id} has no dimensions — run node scripts/media.mjs`);
    for (const w of bucketsFor(d.w)) files.push(`${s.id}-${w}.avif`);
  }
  return files;
}

// --- standalone runner ------------------------------------------------------
const invokedDirectly =
  process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);

if (invokedDirectly) {
  const force = process.argv.includes('--force');
  const check = process.argv.includes('--check') || process.argv.includes('--report');
  const report = process.argv.includes('--report');

  if (!fs.existsSync(MEDIA_JSON)) throw new Error(`no media.json at ${MEDIA_JSON}`);
  const { shots } = JSON.parse(fs.readFileSync(MEDIA_JSON, 'utf8'));
  const META_JSON = path.join(SITE, 'src', 'data', 'media-meta.json');
  const dims = JSON.parse(fs.readFileSync(META_JSON, 'utf8'));
  fs.mkdirSync(OUT, { recursive: true });

  // --check / --report are read-only: they never encode and never prune.
  if (check) {
    const missing = [];
    const bigger = [];
    const rows = [];
    for (const s of shots) {
      const d = dims[s.id];
      if (!d) throw new Error(`media-avif: ${s.id} has no dimensions — run node scripts/media.mjs`);
      for (const w of bucketsFor(d.w)) {
        const wp = path.join(OUT, `${s.id}-${w}.webp`);
        const ap = path.join(OUT, `${s.id}-${w}.avif`);
        const wb = fs.existsSync(wp) ? fs.statSync(wp).size : null;
        const ab = fs.existsSync(ap) ? fs.statSync(ap).size : null;
        if (ab == null) missing.push(`${s.id}-${w}.avif`);
        if (wb != null && ab != null && ab > wb) bigger.push({ file: `${s.id}-${w}`, webp: wb, avif: ab });
        if (ab != null) rows.push({ id: s.id, bucket: w, w: Math.min(w, d.w), webp: wb, avif: ab });
      }
    }
    const tot = (k) => rows.reduce((a, r) => a + (r[k] ?? 0), 0);
    console.log(
      `media-avif --check: ${rows.length} mirrored files, ${missing.length} missing, ` +
        `${bigger.length} AVIF larger than its WebP (see NOTE below)`
    );
    console.log(
      `  AVIF ${(tot('avif') / 1024 / 1024).toFixed(2)} MB vs WebP ${(tot('webp') / 1024 / 1024).toFixed(2)} MB` +
        `  ->  -${(100 * (1 - tot('avif') / tot('webp'))).toFixed(1)}%`
    );
    if (missing.length) {
      console.log('  MISSING (would 404 for an AVIF browser):');
      for (const m of missing.slice(0, 20)) console.log(`    ${m}`);
      if (missing.length > 20) console.log(`    ... and ${missing.length - 20} more`);
    }
    if (bigger.length) {
      // Not a failure: AVIF's container overhead loses to WebP on a handful of
      // very small / very flat images. The whole set's worst case is +880 B and
      // +4.1 KB across 10 of 224 files, against a 2.96 MB aggregate saving.
      // Reported because an AVIF-capable browser really does download those
      // bytes — it is a known, measured, accepted trade, not a silent one.
      console.log(`  NOTE: ${bigger.length} AVIF larger than its WebP (AVIF browsers download that much more):`);
      for (const b of bigger) console.log(`    ${b.file}  webp ${b.webp}  avif ${b.avif}  (+${b.avif - b.webp} B)`);
    }
    // Only a missing mirror can 404 an AVIF browser, so only that is fatal.
    process.exit(missing.length ? 1 : 0);
    if (report) {
      const by = {};
      for (const r of rows) {
        by[r.bucket] ??= { n: 0, avif: 0, webp: 0 };
        by[r.bucket].n++;
        by[r.bucket].avif += r.avif;
        by[r.bucket].webp += r.webp ?? 0;
      }
      console.log('\n  bucket   files      AVIF KB     WebP KB    saving');
      for (const [b, v] of Object.entries(by).sort((a, c) => a[0] - c[0])) {
        console.log(
          `  ${String(b).padEnd(7)} ${String(v.n).padStart(5)} ${(v.avif / 1024).toFixed(0).padStart(11)} ` +
            `${(v.webp / 1024).toFixed(0).padStart(11)}   -${(100 * (1 - v.avif / v.webp)).toFixed(1)}%`
        );
      }
    }
    process.exit(missing.length || bigger.length ? 1 : 0);
  }

  let made = 0;
  let skipped = 0;
  const t0 = Date.now();
  const orientationWarnings = [];
  for (const s of shots) {
    const src = path.join(ASSETS, s.src);
    if (!fs.existsSync(src)) throw new Error(`media-avif: missing source ${s.src}`);
    const md = await sharp(src).rotate().metadata();
    if (md.orientation && md.orientation !== 1) orientationWarnings.push(`${s.id} (orientation ${md.orientation})`);
    const width = md.width;
    for (const w of bucketsFor(width)) {
      if (await writeAvif({ src, id: s.id, width, bucket: w, force })) made++;
      else skipped++;
    }
  }

  // Stale AVIF for shots that left the manifest — mirrors media.mjs.
  const keep = new Set(shots.map((s) => s.id));
  let pruned = 0;
  for (const f of fs.readdirSync(OUT)) {
    const m = f.match(/^(.*)-(640|1280|1920)\.avif$/);
    if (m && !keep.has(m[1])) {
      fs.rmSync(path.join(OUT, f));
      pruned++;
    }
  }

  console.log(
    `media-avif: ${shots.length} shots, ${made} files written, ${skipped} already present, ` +
      `${pruned} stale pruned, ${((Date.now() - t0) / 1000).toFixed(0)} s`
  );
  if (orientationWarnings.length) {
    console.log(`  EXIF orientation on: ${orientationWarnings.join(', ')} (auto-rotated, same as media.mjs)`);
  }
}
