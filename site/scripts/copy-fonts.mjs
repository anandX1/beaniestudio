#!/usr/bin/env node
/**
 * copy-fonts.mjs — stage the UN-SUBSETTED @fontsource originals into
 * scripts/.fontsrc/ so the subsetting step has a reproducible source.
 *
 * !! THIS SCRIPT MUST NEVER WRITE INTO public/fonts/ !!
 *
 * public/fonts/ no longer holds the @fontsource originals. It holds the
 * hand-subsetted `.v2.woff2` files that fonts.css and the BaseLayout preloads
 * actually serve (87,092 B -> 53,176 B, verified glyph-for-glyph and
 * advance-width-for-advance-width at wght 400/600/700). This script used to
 * write straight into public/fonts/ AND runs as the first half of the build
 * ("build": "node scripts/copy-fonts.mjs && astro build"), so pointing it back
 * at public/fonts/ would overwrite the subsets with the full-size originals on
 * the very next build — a silent revert with no error. Hence the guard below.
 *
 * To regenerate the shipped subsets:
 *   1. npm run copy-fonts        (stages originals in scripts/.fontsrc/)
 *   2. python _perf-lab/subset_fonts.py \
 *        --charset _perf-lab/out/charset.txt \
 *        --fonts   beaniestudio-site/site/scripts/.fontsrc \
 *        --out     beaniestudio-site/site/public/fonts
 *   3. python _perf-lab/verify-fonts-v2.py \
 *        --orig    beaniestudio-site/site/scripts/.fontsrc \
 *        --subset  beaniestudio-site/site/public/fonts \
 *        --charset _perf-lab/out/charset.txt
 *
 * Because /fonts/* is served `Cache-Control: public, max-age=31536000,
 * immutable` (see the repo-root _headers file), a changed font file MUST be
 * given a NEW filename (.v2 -> .v3 -> ...) and the URLs in
 * src/styles/fonts.css and src/layouts/BaseLayout.astro updated to match.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');

// Staging area only — deliberately NOT public/fonts. See the header comment.
const out = path.join(root, 'scripts', '.fontsrc');

// Hard guard, so even a careless future edit to `out` above cannot clobber the
// shipped subsets. Fails the build loudly instead of reverting fonts silently.
const protectedDir = path.join(root, 'public', 'fonts');
const rel = path.relative(protectedDir, path.resolve(out));
if (rel === '' || (!rel.startsWith('..') && !path.isAbsolute(rel))) {
  console.error('copy-fonts: REFUSING to write into public/fonts/.');
  console.error('  That directory holds the subsetted .v2.woff2 files this site serves.');
  console.error('  Copying @fontsource originals over them would silently revert the');
  console.error('  font subsetting (87 KB of fonts instead of 53 KB). Stage them in');
  console.error('  scripts/.fontsrc/ instead — see this file\'s header comment.');
  process.exit(1);
}

fs.mkdirSync(out, { recursive: true });

const files = [
  ['@fontsource/chakra-petch/files/chakra-petch-latin-500-normal.woff2', 'chakra-petch-latin-500-normal.woff2'],
  ['@fontsource/chakra-petch/files/chakra-petch-latin-700-normal.woff2', 'chakra-petch-latin-700-normal.woff2'],
  ['@fontsource-variable/public-sans/files/public-sans-latin-wght-normal.woff2', 'public-sans-latin-wght-normal.woff2'],
  ['@fontsource-variable/jetbrains-mono/files/jetbrains-mono-latin-wght-normal.woff2', 'jetbrains-mono-latin-wght-normal.woff2'],
];

for (const [src, name] of files) {
  const from = path.join(root, 'node_modules', src);
  const to = path.join(out, name);
  fs.copyFileSync(from, to);
  console.log(`✓ .fontsrc/${name}  ${Math.round(fs.statSync(to).size / 1024)}KB`);
}
console.log(`font sources staged in scripts/.fontsrc (${files.length} files) — public/fonts/ untouched.`);
