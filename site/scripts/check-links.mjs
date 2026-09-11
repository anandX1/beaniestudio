#!/usr/bin/env node
/**
 * Internal link checker — crawls the BUILT site and verifies every internal
 * link and image/script reference resolves. Broken links leak PageRank and
 * burn crawl budget; this makes them a build failure, not a surprise.
 *
 * Usage: node scripts/check-links.mjs
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const distDir = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'dist');
if (!fs.existsSync(distDir)) {
  console.error('✗ dist/ not found — run `npm run build` first.');
  process.exit(1);
}

const pages = [];
(function walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full);
    else if (entry.name.endsWith('.html')) pages.push(full);
  }
})(distDir);

const routeOf = (file) => {
  let route = path.relative(distDir, file).replace(/\\/g, '/').replace(/index\.html$/, '').replace(/\.html$/, '');
  if (route && !route.endsWith('/')) route += '/';
  return '/' + route;
};

const resolve = (baseRoute, href) => {
  if (/^(https?:)?\/\//.test(href) || href.startsWith('mailto:') || href.startsWith('data:')) return null;
  if (href.startsWith('/')) return href.split('#')[0];
  const baseDir = baseRoute.replace(/[^/]*$/, '');
  return path.posix.normalize(baseDir + href.split('#')[0]);
};

const exists = (route) => {
  const clean = route.replace(/\/$/, '') || '/';
  const candidates = [
    path.join(distDir, clean, 'index.html'),
    path.join(distDir, `${clean}.html`),
    path.join(distDir, clean.replace(/^\//, '')),
  ];
  return candidates.some((p) => fs.existsSync(p));
};

const assetOk = (ref) => fs.existsSync(path.join(distDir, ref.replace(/^\//, '')));

let errors = 0;
let checked = 0;

for (const page of pages) {
  const route = routeOf(page);
  const html = fs.readFileSync(page, 'utf8');
  const refs = [
    ...html.matchAll(/(?:href|src)="([^"]+)"/g),
  ].map((m) => m[1]);

  const seen = new Set();
  for (const href of refs) {
    if (seen.has(href)) continue;
    seen.add(href);
    if (href.startsWith('#')) continue;
    const target = resolve(route, href);
    if (target === null) continue;
    checked++;
    const isAsset = /\.(png|jpe?g|svg|webp|avif|ico|xml|txt|css|js|woff2?|webmanifest)$/i.test(target);
    const ok = isAsset ? assetOk(target) : exists(target);
    if (!ok) {
      errors++;
      console.error(`✗ ${route} → ${href}`);
    }
  }
}

console.log(`\n${checked} references checked across ${pages.length} pages.`);
if (errors) {
  console.error(`✗ ${errors} broken reference(s).`);
  process.exit(1);
}
console.log('✓ all internal references resolve.');
