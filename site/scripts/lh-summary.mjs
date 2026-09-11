#!/usr/bin/env node
/**
 * Lighthouse CI summary — renders reports/lhci-report-*.json as a markdown
 * table in $GITHUB_STEP_SUMMARY (and stdout). Best-effort by design: any
 * problem with an individual report is skipped, never fails the pipeline.
 */
import fs from 'node:fs';

let files = [];
try {
  files = fs.readdirSync('reports').filter((f) => f.endsWith('.json'));
} catch {
  /* no reports dir — nothing to summarize */
}

let out = '## Lighthouse results\n\n| Page | Perf | SEO | A11y | BP |\n|---|---|---|---|---|\n';
let rows = 0;

for (const f of files) {
  try {
    const r = JSON.parse(fs.readFileSync(`reports/${f}`, 'utf8'));
    if (!r || !r.categories) continue;
    let page = f;
    for (const key of ['finalDisplayedUrl', 'finalUrl', 'requestedUrl']) {
      if (r[key]) {
        try {
          page = decodeURIComponent(new URL(r[key]).pathname);
          break;
        } catch {
          /* keep filename fallback */
        }
      }
    }
    const score = (c) => (r.categories[c] && r.categories[c].score != null ? Math.round(r.categories[c].score * 100) : '–');
    out += `| ${page} | ${score('performance')} | ${score('seo')} | ${score('accessibility')} | ${score('best-practices')} |\n`;
    rows++;
  } catch {
    /* a bad report never kills the pipeline */
  }
}

if (!rows) out += '| (no parsable reports — check artifacts) | | | | |\n';

if (process.env.GITHUB_STEP_SUMMARY) fs.appendFileSync(process.env.GITHUB_STEP_SUMMARY, out);
console.log(out);
