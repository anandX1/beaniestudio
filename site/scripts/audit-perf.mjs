#!/usr/bin/env node
/**
 * audit-perf.mjs — repeatable performance forensics for beaniestudio.site
 *
 * WHY THIS EXISTS
 * Creative work lands, then someone has to prove it did not cost anything. Ad-hoc
 * checking does not work: you cannot tell a 40 KB regression from run-to-run noise, and
 * you cannot remember what the numbers were last time. This measures a fixed set of
 * metrics, writes a dated snapshot, and diffs two snapshots so a regression shows up as
 * a number with an arrow next to it.
 *
 * USAGE
 *   node scripts/audit-perf.mjs --label baseline
 *   node scripts/audit-perf.mjs --label after-antigravity --diff baseline
 *   node scripts/audit-perf.mjs --url http://127.0.0.1:4321 --label local
 *   node scripts/audit-perf.mjs --pages /,/guide/map/,/faq/ --label quick
 *
 * Snapshots are written OUTSIDE the repo by default (../_perf-runs/) so they survive a
 * `git clean` and are never deployed. Override with --out.
 *
 * HOW IT MEASURES
 * Drives Chrome headless over CDP on a TCP port (this host denies the Unix socket that
 * agent-browser needs). PerformanceObserver is installed with
 * Page.addScriptToEvaluateOnNewDocument so LCP and CLS are captured from the very first
 * frame — reading them after load would miss the LCP candidate entirely.
 *
 * WHAT IT DOES NOT DO
 * - It does not use Lighthouse. Lighthouse's `simulate` throttling invents a CLS figure
 *   that this project has already been burned by (0.393 reported, 0.014 real). These are
 *   unobstructed real-browser numbers.
 * - It is not a lab-vs-field substitute. Cloudflare RUM is the field source; this catches
 *   regressions before they reach the field.
 */

import { spawn } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';

// ---------------------------------------------------------------- args

const argv = process.argv.slice(2);
const flag = (n) => argv.includes(`--${n}`);
const opt = (n, d) => { const i = argv.indexOf(`--${n}`); return i !== -1 ? argv[i + 1] : d; };

const BASE = opt('url', 'https://beaniestudio.site');
const LABEL = opt('label', new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19));
const DIFF = opt('diff', null);
const OUT = path.resolve(opt('out', path.join(process.cwd(), '..', '_perf-runs')));
const PAGES = opt('pages', '/,/guide/map/,/guide/jingles/,/guide/crushers/,/guide/numbers/,/screenshots/,/faq/').split(',').map((s) => s.trim());
const VIEWPORT = { width: 1440, height: 900 };

/**
 * Run each page this many times and report the MEDIAN run.
 *
 * Measured on this host: `/` LCP varied 5156ms -> 11192ms between two consecutive runs,
 * and `/screenshots/` transferred 617KB then 375KB for the same page. The weight swing is
 * `loading="lazy"` (how many images happen to load inside the settle window); the LCP
 * swing is `font-display: swap` re-triggering LCP at a different font-arrival time on each
 * run. A single run cannot distinguish a 40KB regression from that noise, so a single run
 * is not allowed to be the basis of a judgement.
 */
const RUNS = Math.max(1, Math.min(7, parseInt(opt('runs', '3'), 10)));

// ---------------------------------------------------------------- chrome

const CANDIDATES = [
  process.env.CHROME_PATH,
  'C:/Program Files/Google/Chrome/Application/chrome.exe',
  'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe',
  path.join(os.homedir(), 'AppData/Local/Google/Chrome/Application/chrome.exe'),
  'C:/Program Files/Microsoft/Edge/Application/msedge.exe',
  'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
];

function findChrome() {
  for (const c of CANDIDATES) if (c && fs.existsSync(c)) return c;
  throw new Error('No Chrome/Edge found. Set CHROME_PATH to chrome.exe');
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// Minimal CDP client over the global WebSocket (Node 22 has it built in).
class CDP {
  constructor(ws) { this.ws = ws; this.id = 0; this.pending = new Map(); this.listeners = new Map(); }
  static async attach(url) {
    const ws = new WebSocket(url);
    await new Promise((res, rej) => { ws.onopen = res; ws.onerror = (e) => rej(new Error('ws: ' + e.message)); });
    const c = new CDP(ws);
    ws.onmessage = (e) => {
      const m = JSON.parse(e.data);
      if (m.id && c.pending.has(m.id)) {
        const { res, rej } = c.pending.get(m.id); c.pending.delete(m.id);
        m.error ? rej(new Error(m.method + ': ' + m.error.message)) : res(m.result);
      } else if (m.method) {
        (c.listeners.get(m.method) || []).forEach((f) => f(m.params));
      }
    };
    return c;
  }
  on(ev, fn) { if (!this.listeners.has(ev)) this.listeners.set(ev, []); this.listeners.get(ev).push(fn); }
  send(method, params = {}) {
    const id = ++this.id;
    return new Promise((res, rej) => { this.pending.set(id, { res, rej }); this.ws.send(JSON.stringify({ id, method, params })); });
  }
}

// ---------------------------------------------------------------- measure one page

const INSTRUMENT = `
  window.__perf = { lcp: 0, lcpEl: null, cls: 0, shifts: [], longtasks: [], fcp: 0 };
  try {
    new PerformanceObserver((l) => {
      for (const e of l.getEntries()) {
        window.__perf.lcpAll = window.__perf.lcpAll || [];
        // First candidate = what actually painted first for the user. Final = the settled
        // value, which on this site is usually the font-swap re-paint. Reporting only one
        // of them is how a font regression hides.
        if (window.__perf.lcpFirst === undefined) window.__perf.lcpFirst = Math.round(e.startTime);
        window.__perf.lcpAll.push(Math.round(e.startTime));
        window.__perf.lcp = e.startTime;
        window.__perf.lcpEl = e.element ? (e.element.tagName + (e.element.className ? '.' + String(e.element.className).trim().split(/\\s+/).slice(0,2).join('.') : '')) : String(e.url || '');
        window.__perf.lcpSize = e.size || 0;
      }
    }).observe({ type: 'largest-contentful-paint', buffered: true });
    new PerformanceObserver((l) => {
      for (const e of l.getEntries()) {
        if (!e.hadRecentInput) { window.__perf.cls += e.value; window.__perf.shifts.push({ v: +e.value.toFixed(4), t: Math.round(e.startTime) }); }
      }
    }).observe({ type: 'layout-shift', buffered: true });
    new PerformanceObserver((l) => {
      for (const e of l.getEntries()) window.__perf.fcp = e.startTime;
    }).observe({ type: 'paint', buffered: true });
    new PerformanceObserver((l) => {
      for (const e of l.getEntries()) window.__perf.longtasks.push(Math.round(e.duration));
    }).observe({ type: 'longtask', buffered: true });
  } catch (e) { window.__perf.err = String(e); }
`;

async function measurePage(cdp, url, isFirst) {
  if (isFirst) {
    await cdp.send('Page.enable');
    await cdp.send('Page.addScriptToEvaluateOnNewDocument', { source: INSTRUMENT });
  }
  await cdp.send('Emulation.setDeviceMetricsOverride', { ...VIEWPORT, deviceScaleFactor: 1, mobile: false });

  const loaded = new Promise((res) => {
    const to = setTimeout(res, 25000);
    cdp.on('Page.loadEventFired', () => { clearTimeout(to); res(); });
  });
  await cdp.send('Page.navigate', { url });
  await loaded;
  await sleep(2500); // let late LCP/CLS candidates settle

  const { result } = await cdp.send('Runtime.evaluate', {
    returnByValue: true,
    expression: `(() => {
      const res = performance.getEntriesByType('resource');
      const by = (f) => res.filter(f).reduce((a, e) => ({ n: a.n + 1, bytes: a.bytes + (e.transferSize || e.encodedBodySize || 0) }), { n: 0, bytes: 0 });
      const nav = performance.getEntriesByType('navigation')[0] || {};
      const doc = performance.getEntriesByType('resource').length ? 0 : 0;
      const imgs = res.filter(e => e.initiatorType === 'img' || /\\.(webp|avif|png|jpg|jpeg|svg)(\\?|$)/i.test(e.name));
      const fmt = {};
      for (const i of imgs) { const m = i.name.match(/\\.(\\w{2,5})(\\?|$)/); const k = m ? m[1].toLowerCase() : 'other'; fmt[k] = (fmt[k] || 0) + 1; }
      // render-blocking: stylesheets and sync scripts in <head> before first paint is a proxy
      const blocking = [...document.querySelectorAll('link[rel="stylesheet"]:not([media])')].length;
      const scripts = [...document.querySelectorAll('script[src]')].length;
      const lazy = [...document.querySelectorAll('img[loading="lazy"]')].length;
      const eager = [...document.querySelectorAll('img:not([loading="lazy"])')].length;
      const withDims = [...document.querySelectorAll('img[width][height]')].length;
      return {
        doc: { bytes: (nav.transferSize || 0), ttfb: Math.round(nav.responseStart || 0), dcl: Math.round(nav.domContentLoadedEventEnd || 0), load: Math.round(nav.loadEventEnd || 0) },
        counts: { requests: res.length, img: imgs.length, css: res.filter(e => e.initiatorType === 'link' || /\\.css(\\?|$)/i.test(e.name)).length, js: res.filter(e => e.initiatorType === 'script' || /\\.js(\\?|$)/i.test(e.name)).length },
        bytes: { total: res.reduce((a, e) => a + (e.transferSize || e.encodedBodySize || 0), 0), img: by(e => e.initiatorType === 'img' || /\\.(webp|avif|png|jpg|jpeg)(\\?|$)/i.test(e.name)).bytes, js: by(e => e.initiatorType === 'script' || /\\.js(\\?|$)/i.test(e.name)).bytes, css: by(e => /\\.css(\\?|$)/i.test(e.name)).bytes, font: by(e => /\\.woff2?(\\?|$)/i.test(e.name)).bytes },
        imgFormats: fmt,
        dom: { nodes: document.querySelectorAll('*').length, depth: (() => { let d = 0, e = document.body; const w = (n, l) => { d = Math.max(d, l); for (const c of n.children) w(c, l + 1); }; if (e) w(e, 1); return d; })(),
               sections: document.querySelectorAll('section').length, imgs: document.querySelectorAll('img').length, lazy, eager, withDims },
        blocking, scripts,
        perf: window.__perf || {},
        styleSheets: document.styleSheets.length,
        inlineCssBytes: [...document.querySelectorAll('style')].reduce((a, s) => a + (s.textContent || '').length, 0),
        biome: document.body.getAttribute('data-biome'),
        title: document.title,
      };
    })()`,
  });
  return result.value;
}

// ---------------------------------------------------------------- diff

function flatten(o, p = '', out = {}) {
  for (const [k, v] of Object.entries(o || {})) {
    const key = p ? `${p}.${k}` : k;
    if (v && typeof v === 'object' && !Array.isArray(v)) flatten(v, key, out);
    else out[key] = v;
  }
  return out;
}

function diffSnapshots(a, b) {
  const A = flatten(a), B = flatten(b);
  const rows = [];
  for (const k of new Set([...Object.keys(A), ...Object.keys(B)])) {
    const x = A[k], y = B[k];
    if (typeof x !== 'number' || typeof y !== 'number') { if (x !== y) rows.push({ key: k, from: x, to: y, delta: '~', pct: '' }); continue; }
    if (x === y) continue;
    const d = y - x, pct = x ? ((d / x) * 100).toFixed(1) + '%' : 'new';
    rows.push({ key: k, from: x, to: y, delta: (d > 0 ? '+' : '') + d, pct });
  }
  // worst by relative change
  return rows.sort((p, q) => {
    const rel = (r) => (typeof r.from === 'number' && r.from ? Math.abs((r.to - r.from) / r.from) : 0);
    return rel(q) - rel(p);
  });
}

// ---------------------------------------------------------------- main

async function main() {
  if (DIFF) {
    const a = JSON.parse(fs.readFileSync(path.join(OUT, `${DIFF}.json`), 'utf8'));
    const b = JSON.parse(fs.readFileSync(path.join(OUT, `${LABEL}.json`), 'utf8'));
    console.log(`\nDIFF  ${DIFF}  ->  ${LABEL}\n`);
    for (const page of Object.keys(b.pages)) {
      if (!a.pages[page]) { console.log(` ${page}: NEW`); continue; }
      const rows = diffSnapshots(a.pages[page], b.pages[page]).filter((r) => !/shifts|err/.test(r.key));
      console.log(` ${page}`);
      if (!rows.length) { console.log('   no change'); continue; }
      for (const r of rows.slice(0, 14)) console.log(`   ${(r.delta + '').padStart(9)} ${(r.pct + '').padStart(8)}  ${r.key}  (${r.from} -> ${r.to})`);
    }
    return;
  }

  const chrome = findChrome();
  const port = 9500 + Math.floor(Math.random() * 400);
  const profile = fs.mkdtempSync(path.join(os.tmpdir(), 'perf-'));
  const proc = spawn(chrome, [
    '--headless=new', `--remote-debugging-port=${port}`, `--user-data-dir=${profile}`,
    '--no-first-run', '--no-default-browser-check', '--disable-gpu', '--hide-scrollbars',
    '--window-size=' + VIEWPORT.width + ',' + VIEWPORT.height, 'about:blank',
  ], { stdio: 'ignore' });

  let wsUrl = null;
  for (let i = 0; i < 60; i++) {
    try {
      const r = await fetch(`http://127.0.0.1:${port}/json/version`);
      wsUrl = (await r.json()).webSocketDebuggerUrl; break;
    } catch { await sleep(250); }
  }
  if (!wsUrl) { proc.kill(); throw new Error('Chrome did not expose a CDP endpoint'); }

  const cdp = await CDP.attach(wsUrl);
  const { targetId } = await cdp.send('Target.createTarget', { url: 'about:blank' });
  const { sessionId } = await cdp.send('Target.attachToTarget', { targetId, flatten: true });

  // route session-scoped messages
  const session = { send: (m, p) => cdp.send(m, p) };
  cdp.on('Page.loadEventFired', () => {});

  const snap = { label: LABEL, base: BASE, viewport: VIEWPORT, at: new Date().toISOString(), chrome, pages: {} };

  // We drive the attached page target through the browser-level CDP with sessionId.
  const sendS = (method, params = {}) => new Promise((res, rej) => {
    const id = ++cdp.id;
    cdp.pending.set(id, { res, rej });
    cdp.ws.send(JSON.stringify({ id, method, params, sessionId }));
  });
  cdp.on('Page.loadEventFired', () => {}); // session events come back with sessionId; handled below

  // Re-wire: messages with sessionId must still resolve by id (already does) and events
  // must reach listeners. The base class already handles both.

  for (let i = 0; i < PAGES.length; i++) {
    const p = PAGES[i];
    const url = BASE.replace(/\/$/, '') + p;
    process.stdout.write(`  measuring ${p} ... `);
    try {
      const runs = [];
      for (let r = 0; r < RUNS; r++) {
        try { runs.push(await measurePage({ send: sendS, on: (e, f) => cdp.on(e, f) }, url, i === 0 && r === 0)); }
        catch (e) { runs.push({ error: String(e.message) }); }
      }
      const good = runs.filter((x) => !x.error && x.perf);
      if (!good.length) { console.log('FAILED ' + ((runs[0] && runs[0].error) || 'all runs failed')); snap.pages[p] = { error: 'all runs failed' }; continue; }
      // Median run, so every field comes from one internally consistent measurement, and
      // the spread is kept so a noisy page is visibly noisy rather than falsely precise.
      good.sort((a, b) => (a.perf.lcp || 0) - (b.perf.lcp || 0));
      const pick = good[Math.floor(good.length / 2)];
      const lcps = good.map((x) => Math.round(x.perf.lcp || 0));
      pick.spread = { runs: good.length, lcp: lcps, lcpMin: Math.min(...lcps), lcpMax: Math.max(...lcps),
        lcpFirsts: good.map((x) => x.perf.lcpFirst || 0).filter(Boolean),
        bytes: good.map((x) => x.bytes.total), requests: good.map((x) => x.counts.requests) };
      snap.pages[p] = pick;
      const pct = Math.min(...lcps) ? Math.round(((Math.max(...lcps) - Math.min(...lcps)) / Math.min(...lcps)) * 100) : 0;
      console.log(`LCP ${lcps.join('/')}ms (spread ${pct}%)  CLS ${(pick.perf.cls || 0).toFixed(3)}  ${(pick.bytes.total / 1024).toFixed(0)}KB`);
    } catch (e) {
      console.log('FAILED ' + e.message);
      snap.pages[p] = { error: String(e.message) };
    }
  }

  fs.mkdirSync(OUT, { recursive: true });
  const file = path.join(OUT, `${LABEL}.json`);
  fs.writeFileSync(file, JSON.stringify(snap, null, 2));
  console.log(`\n  snapshot -> ${file}`);

  proc.kill();
  try { fs.rmSync(profile, { recursive: true, force: true }); } catch {}

  // summary
  console.log('\n  ' + 'page'.padEnd(20) + 'LCP   CLS    weight    req  js    img    inline-css  blockers');
  let tLcp = 0, tBytes = 0, n = 0;
  for (const [p, m] of Object.entries(snap.pages)) {
    if (m.error) continue;
    tLcp += m.perf.lcp || 0; tBytes += m.bytes.total; n++;
    console.log('  ' + p.padEnd(20)
      + String(Math.round(m.perf.lcp || 0)).padStart(4)
      + String((m.perf.cls || 0).toFixed(3)).padStart(7)
      + String(((m.bytes.total / 1024) | 0) + 'KB').padStart(9)
      + String(m.counts.requests).padStart(6)
      + String(((m.bytes.js / 1024) | 0) + 'K').padStart(5)
      + String(((m.bytes.img / 1024) | 0) + 'K').padStart(7)
      + String(((m.inlineCssBytes / 1024) | 0) + 'K').padStart(12)
      + String(m.blocking).padStart(10));
  }
  if (n) console.log(`\n  mean LCP ${Math.round(tLcp / n)}ms · mean weight ${Math.round(tBytes / n / 1024)}KB across ${n} pages`);
}

main().catch((e) => { console.error('audit-perf failed:', e.message); process.exit(1); });
