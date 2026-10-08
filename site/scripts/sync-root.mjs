/**
 * Copy the built site (site/dist) to the repo root — Cloudflare Pages serves
 * the repo root directly. Deletes every root entry that isn't source or repo
 * plumbing first, so removed pages don't linger.
 *
 *   npm run build && npm run sync-root
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const SITE = path.resolve(here, '..');
const ROOT = path.resolve(SITE, '..');
const DIST = path.join(SITE, 'dist');
const KEEP = new Set(['.git', '.github', '.gitignore', '.assetsignore', 'wrangler.jsonc', 'README.md', 'site', 'game-assets', 'node_modules']);

if (!fs.existsSync(path.join(DIST, 'index.html'))) {
  console.error('sync-root: site/dist is missing — run `npm run build` first');
  process.exit(1);
}
for (const entry of fs.readdirSync(ROOT)) {
  if (KEEP.has(entry)) continue;
  fs.rmSync(path.join(ROOT, entry), { recursive: true, force: true });
}
fs.cpSync(DIST, ROOT, { recursive: true });
console.log('sync-root: copied', fs.readdirSync(DIST).length, 'entries from site/dist to the repo root');
