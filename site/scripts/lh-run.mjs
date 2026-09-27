#!/usr/bin/env node
// Ad-hoc Lighthouse runner for the STATIC site build.
// Usage: node scripts/lh-run.mjs [baseUrl] [mobile|desktop] [page ...]
// Pages default to the six routes tracked in .lighthouserc.json.
// Writes reports/lh-<slug>-<form>.json and prints a compact summary row per page.

import { spawnSync } from 'node:child_process';
import { mkdirSync, writeFileSync, readFileSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const [base = 'http://127.0.0.1:4173', form = 'mobile', ...pages] = process.argv.slice(2);
const routes = pages.length
  ? pages
  : ['/', '/play/', '/faq/', '/press/', '/blog/', '/blog/why-we-removed-the-radar/'];

mkdirSync(join(root, 'reports'), { recursive: true });
const cli = join(root, 'node_modules', 'lighthouse', 'cli', 'index.js');

const rows = [];
for (const route of routes) {
  const slug = route === '/' ? 'home' : route.replaceAll('/', ' ').trim().replaceAll(' ', '-');
  const out = join(root, 'reports', `lh-${slug}-${form}.json`);
  const args = [
    cli,
    base + route,
    '--output=json',
    `--output-path=${out}`,
    '--only-categories=performance,accessibility,best-practices,seo',
    '--max-wait-for-load=45000',
    '--quiet',
    '--chrome-flags=--headless=new',
  ];
  if (form === 'desktop') args.push('--preset=desktop');

  const r = spawnSync('node', args, { stdio: ['ignore', 'ignore', 'inherit'], timeout: 180_000 });
  if (!existsSync(out)) {
    console.error(`FAIL ${route}: no report written (exit ${r.status})`);
    continue;
  }
  const lhr = JSON.parse(readFileSync(out, 'utf8'));
  const c = lhr.categories;
  const a = lhr.audits;
  const row = {
    page: route,
    performance: Math.round(c.performance.score * 100),
    accessibility: Math.round(c.accessibility.score * 100),
    bestPractices: Math.round(c['best-practices'].score * 100),
    seo: Math.round(c.seo.score * 100),
    lcp: a['largest-contentful-paint'].displayValue,
    tbt: a['total-blocking-time'].displayValue,
    cls: a['cumulative-layout-shift'].displayValue,
  };
  rows.push(row);
  console.log(
    `${route.padEnd(36)} P${row.performance} A${row.accessibility} BP${row.bestPractices} SEO${row.seo}` +
      `  LCP ${row.lcp}  TBT ${row.tbt}  CLS ${row.cls}`,
  );
}

const summaryPath = join(root, 'reports', `lh-summary-${form}.json`);
writeFileSync(summaryPath, JSON.stringify({ base, form, at: new Date().toISOString(), rows }, null, 2));
console.log(`\n${rows.length} report(s) written to reports/ (summary: ${summaryPath})`);
