#!/usr/bin/env node
/**
 * IndexNow ping — submits every sitemap URL to Bing/Seznam/Yandex instantly.
 *
 * Protocol: https://www.indexnow.org/documentation
 *  1. A key file `<key>.txt` containing only the key must be served from the site root.
 *  2. POST { host, key, keyLocation, urlList } to an IndexNow endpoint (≤10,000 URLs).
 *
 * Reads the BUILT sitemap (run after `npm run build`) so the URL list always matches
 * what's actually deployed. Google doesn't participate in IndexNow — it discovers via
 * sitemap + Search Console; Bing/Seznam/Yandex pick pages up in minutes.
 *
 * Usage: node scripts/ping-indexnow.mjs [--dry]
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const SITE = 'https://beaniestudio.site';
/** Rotating this invalidates the old key: generate with `node -e "console.log(require('crypto').randomBytes(16).toString('hex'))"` */
const KEY = 'c2769c2629e7b24f6076ecdc17b61001';
const ENDPOINT = 'https://api.indexnow.org/indexnow'; // aggregator: fans out to all participating engines

const dry = process.argv.includes('--dry');

const distDir = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'dist');
const sitemapFile = path.join(distDir, 'sitemap-0.xml');

if (!fs.existsSync(sitemapFile)) {
  console.error('✗ dist/sitemap-0.xml not found — run `npm run build` first.');
  process.exit(1);
}

const urls = [...fs.readFileSync(sitemapFile, 'utf8').matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
if (!urls.length) {
  console.error('✗ sitemap contains no URLs.');
  process.exit(1);
}

console.log(`IndexNow: ${urls.length} URL(s) from sitemap`);
for (const u of urls) console.log(`  ${u}`);

if (dry) {
  console.log('dry run — nothing submitted.');
  process.exit(0);
}

const body = {
  host: new URL(SITE).host,
  key: KEY,
  keyLocation: `${SITE}/${KEY}.txt`,
  urlList: urls,
};

const res = await fetch(ENDPOINT, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json; charset=utf-8' },
  body: JSON.stringify(body),
});

console.log(`POST ${ENDPOINT} → ${res.status} ${res.statusText}`);
if (res.status === 200 || res.status === 202) {
  console.log('✓ accepted. Bing typically crawls within minutes.');
} else if (res.status === 400 || res.status === 403) {
  console.error('✗ rejected — is the key file deployed at the root, and does the key match?');
  process.exit(1);
} else if (res.status === 429) {
  console.error('✗ rate-limited — you are pinging too often. Once per deploy is plenty.');
  process.exit(1);
} else {
  console.error('✗ unexpected response — check https://www.indexnow.org/documentation');
  process.exit(1);
}
