#!/usr/bin/env node
/**
 * rank-track.mjs — real SERP position tracking, $0/month.
 *
 * Uses the community OpenSERP binary (tools/bin, MIT, github.com/karust/openserp)
 * to render actual Bing + DuckDuckGo results pages with local Chrome and find
 * where beaniestudio.site ranks for our Tier-1 keywords.
 *
 * Why Bing/DDG and not Google: Google hard-blocks anonymous SERP scraping
 * ("rate_limited" from residential IPs). Our Google positions come free and
 * legitimately from Google Search Console — this tracker covers the gap GSC
 * does NOT fill: where we stand on engines we can actually query, daily,
 * without an API bill. Since every publish IndexNow-pings Bing, Bing movement
 * is also our fastest feedback loop on new content.
 *
 * Usage:
 *   node tools/rank-track.mjs            # run all keywords on both engines
 *   node tools/rank-track.mjs --engine bing
 *   node tools/rank-track.mjs --delay 8000
 *
 * Output: append-only JSONL history at content/rank-history.jsonl (local-only,
 * gitignored) + a human-readable summary printed at the end. Studio's
 * /api/rank endpoints read the same files.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawn, spawnSync } from 'node:child_process';

const here = path.dirname(fileURLToPath(import.meta.url));
const siteRoot = path.join(here, '..');
const contentDir = path.join(siteRoot, 'content');
const cfg = JSON.parse(fs.readFileSync(path.join(here, 'rank-keywords.json'), 'utf8'));
const historyPath = path.join(contentDir, 'rank-history.jsonl');

// ---- CLI flags ----
const args = process.argv.slice(2);
const flag = (name, def) => {
  const i = args.indexOf(`--${name}`);
  return i >= 0 && args[i + 1] && !args[i + 1].startsWith('--') ? args[i + 1] : def;
};
const onlyEngine = flag('engine', null);
const engines = cfg.engines.filter((e) => !onlyEngine || e === onlyEngine);
const delayMs = Number(flag('delay', 6000)); // politeness gap between queries
const depth = Number(flag('depth', 30)); // how deep to look (results counted)

const exe = path.join(here, 'bin', process.platform === 'win32' ? 'openserp.exe' : 'openserp');
if (!fs.existsSync(exe)) {
  console.error('✗ OpenSERP not installed. Run: node tools/setup-openserp.mjs');
  process.exit(1);
}

const target = cfg.targetDomain;
const now = new Date().toISOString();

/** Run one query via the CLI (server mode is for Studio; CLI is simpler here). */
function query(engine, text) {
  const r = spawnSync(exe, ['search', engine, text, '--limit', String(depth)], {
    encoding: 'utf8',
    maxBuffer: 16 * 1024 * 1024,
    timeout: 90_000,
  });
  if (r.status !== 0 || !r.stdout) {
    const errLine = (r.stderr || r.stdout || '').split('\n').find((l) => /error|rate_limited/i.test(l)) || 'unknown error';
    return { error: errLine.trim().slice(0, 160) };
  }
  try {
    const j = JSON.parse(r.stdout);
    return { results: j.results || [] };
  } catch {
    return { error: 'unparseable output' };
  }
}

const run = { date: now, target, depth, engineResults: {} };
let totalTracked = 0;
let top10 = 0;
const summary = [];

for (const engine of engines) {
  run.engineResults[engine] = [];
  console.log(`\n=== ${engine.toUpperCase()} (${cfg.keywords.length} keywords, depth ${depth}) ===`);
  for (let k = 0; k < cfg.keywords.length; k++) {
    const kw = cfg.keywords[k];
    process.stdout.write(`[${k + 1}/${cfg.keywords.length}] "${kw}" … `);
    const { results, error } = query(engine, kw);
    if (error) {
      console.log(`✗ ${error}`);
      run.engineResults[engine].push({ keyword: kw, error });
      continue;
    }
    // first index of our domain in the organic results (rank is 1-based)
    const hit = results.find((r) => {
      try { return new URL(r.url).hostname.replace(/^www\./, '') === target; } catch { return false; }
    });
    const rank = hit ? hit.rank : null;
    const total = results.length;
    run.engineResults[engine].push({ keyword: kw, rank, total, top3Urls: results.slice(0, 3).map((r) => r.domain) });
    totalTracked++;
    if (rank && rank <= 10) top10++;
    console.log(rank ? `#${rank} of ${total}` : `not in top ${total}`);
    if (k < cfg.keywords.length - 1) await new Promise((r) => setTimeout(r, delayMs));
  }
}

// ---- append history ----
fs.appendFileSync(historyPath, JSON.stringify(run) + '\n');

// ---- printable summary with movement vs previous run ----
let prev = null;
const lines = fs.readFileSync(historyPath, 'utf8').trim().split('\n');
if (lines.length > 1) {
  try { prev = JSON.parse(lines[lines.length - 2]); } catch { /* first run */ }
}
console.log('\n──────── SUMMARY ────────');
for (const engine of engines) {
  const prevMap = new Map(
    prev?.engineResults?.[engine]?.map((e) => [e.keyword, e.rank]) ?? []
  );
  console.log(`\n${engine}:`);
  for (const row of run.engineResults[engine]) {
    if (row.error) { console.log(`  ✗ ${row.keyword}: ${row.error}`); continue; }
    const was = prevMap.get(row.keyword);
    let delta = '';
    if (was && row.rank) delta = row.rank < was ? ` ▲${was - row.rank}` : row.rank > was ? ` ▼${row.rank - was}` : ' =';
    else if (!was && row.rank) delta = ' ★new';
    else if (was && !row.rank) delta = ' (dropped out)';
    const pos = row.rank ? `#${row.rank}` : '—';
    console.log(`  ${pos.padStart(4)}${delta.padEnd(8)} ${row.keyword}`);
  }
}
console.log(`\nTracked ${totalTracked} queries · ${top10} top-10 placements · history: ${path.relative(siteRoot, historyPath)}`);
