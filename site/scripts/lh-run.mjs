#!/usr/bin/env node
// Ad-hoc Lighthouse runner for the STATIC site build.
// Usage: node scripts/lh-run.mjs [baseUrl] [mobile|desktop] [--real] [page ...]
// Pages default to the six routes tracked in .lighthouserc.json.
// Writes reports/lh-<slug>-<form>[-real].json and prints a compact summary row per page.
//
// TWO THINGS TO KNOW BEFORE TRUSTING A NUMBER THIS PRINTS:
//
// 1. The throttling method changes CLS dramatically, and the default lies.
//    Lighthouse's default ("simulate") re-times resources through a model. On this
//    site it reports CLS 0.393; real throttling ("devtools") reports 0.014, and an
//    independent throttled CDP harness also reports 0.0139. The 0.393 is an
//    artifact. Pass --real whenever the metric you care about is CLS, LCP or TBT.
//    Simulated runs are still fine for SEO / accessibility / best-practices, which
//    do not depend on timing.
//
// 2. Lighthouse is deliberately NOT a dependency of this project (CI pulls it via
//    `npx @lhci/cli`). This script used to hardcode node_modules/lighthouse and so
//    crashed with "Cannot find module" on a clean checkout — meaning the local
//    measurement path documented in SEO-PLAYBOOK §7 never actually ran. It now uses
//    a local install when present and otherwise falls back to npx, like CI does.

import { spawnSync } from 'node:child_process';
import { mkdirSync, writeFileSync, readFileSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');

const argv = process.argv.slice(2);
const real = argv.includes('--real');
const positional = argv.filter((a) => a !== '--real');
const [base = 'http://127.0.0.1:4173', form = 'mobile', ...pages] = positional;
const routes = pages.length
  ? pages
  : ['/', '/guide/', '/guide/map/', '/screenshots/', '/faq/', '/press/', '/blog/why-static-is-not-a-generator-game/'];

mkdirSync(join(root, 'reports'), { recursive: true });
const localCli = join(root, 'node_modules', 'lighthouse', 'cli', 'index.js');
const haveLocal = existsSync(localCli);

/** Quote an argument for the shell string used on the npx path (this repo's own
 *  directory name contains spaces). Quotes are stripped so nothing can break out. */
const q = (s) => `"${String(s).replace(/"/g, '')}"`;

function runOne(url, outPath) {
  const flags = [
    '--output=json',
    `--output-path=${outPath}`,
    '--only-categories=performance,accessibility,best-practices,seo',
    '--max-wait-for-load=45000',
    '--quiet',
    '--chrome-flags=--headless=new',
  ];
  if (real) flags.push('--throttling-method=devtools');
  if (form === 'desktop') flags.push('--preset=desktop');

  if (haveLocal) {
    return spawnSync(process.execPath, [localCli, url, ...flags], {
      stdio: ['ignore', 'ignore', 'inherit'],
      timeout: 420_000,
    });
  }
  // npx ships as npx.cmd on Windows, which Node refuses to spawn without a shell.
  const cmd = ['npx', '--yes', 'lighthouse@12', q(url), ...flags.map(q)].join(' ');
  return spawnSync(cmd, { stdio: ['ignore', 'ignore', 'inherit'], timeout: 420_000, shell: true });
}

const suffix = real ? '-real' : '';
const rows = [];
for (const route of routes) {
  const slug = route === '/' ? 'home' : route.replaceAll('/', ' ').trim().replaceAll(' ', '-');
  const out = join(root, 'reports', `lh-${slug}-${form}${suffix}.json`);
  const r = runOne(base + route, out);
  if (!existsSync(out)) {
    console.error(`FAIL ${route}: no report written (exit ${r.status})`);
    continue;
  }
  const lhr = JSON.parse(readFileSync(out, 'utf8'));
  const c = lhr.categories;
  const a = lhr.audits;
  const row = {
    page: route,
    throttling: real ? 'devtools' : 'simulate',
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

const summaryPath = join(root, 'reports', `lh-summary-${form}${suffix}.json`);
writeFileSync(
  summaryPath,
  JSON.stringify({ base, form, throttling: real ? 'devtools' : 'simulate', at: new Date().toISOString(), rows }, null, 2),
);
if (!real) {
  console.log('\nthrottling: simulate (model) — CLS here is a known false positive on this site; re-run with --real');
}
console.log(`${rows.length} report(s) written to reports/ (summary: ${summaryPath})`);
