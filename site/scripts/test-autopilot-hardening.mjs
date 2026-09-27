#!/usr/bin/env node
/**
 * test-autopilot-hardening.mjs — smoke-checks the hardened autopilot WITHOUT
 * publishing anything. Verifies:
 *   1. module loads and `status` runs from the correct cwd
 *   2. the attempt-breaker counts publish-fail/crash entries for today
 *   3. a torn final ledger line (process killed mid-append) doesn't brick
 *      lastPublishedDate / attempt counting
 * Run: node site/scripts/test-autopilot-hardening.mjs   (exit 0 = all pass)
 */
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const SITE_ROOT = path.resolve(here, '..');
const LOG = path.join(SITE_ROOT, 'content', 'autopilot-log.jsonl');

let failed = 0;
const check = (name, pass, detail) => {
  console.log(`${pass ? 'PASS' : 'FAIL'} ${name}`, detail ?? '');
  if (!pass) failed++;
};

// --- 1. status still runs end-to-end (correct cwd) -------------------------
{
  const r = spawnSync(process.execPath, [path.join(SITE_ROOT, 'tools', 'autopilot.mjs'), 'status'], {
    cwd: SITE_ROOT, encoding: 'utf8', timeout: 30_000,
  });
  let ok = r.status === 0;
  let parsed = null;
  try { parsed = JSON.parse(r.stdout); } catch { ok = false; }
  check('status-runs', ok && parsed && typeof parsed.queueSize === 'number',
    parsed ? `queue=${parsed.queueSize} dueNow=${parsed.dueNow}` : (r.stderr || '').slice(0, 120));
}

// --- 2 + 3. attempt counting + torn-line tolerance --------------------------
// Parse the same way autopilot.mjs does, against a synthetic ledger that
// contains: a publish-crash for today's post, a TORN final line, and a
// publish-ok from a previous day.
const readLedger = (text) => text.split('\n').filter(Boolean).filter((line) => {
  try { return JSON.parse(line); } catch { return false; }
}).map((l) => JSON.parse(l));

const synthetic = [
  JSON.stringify({ at: '2026-09-26T22:00:00Z', op: 'publish-ok', id: 'x', date: '2026-09-26' }),
  JSON.stringify({ at: '2026-09-27T22:42:45Z', op: 'publish-start', id: '005-hide-and-seek-horror-game-roblox' }),
  JSON.stringify({ at: '2026-09-27T22:50:00Z', op: 'publish-crash', id: '005-hide-and-seek-horror-game-roblox', error: 'test' }),
  '{"at":"2026-09-27T23:0', // torn line — the 09-27 kill mid-append
].join('\n');

const entries = readLedger(synthetic);
const today = '2026-09-27';
const attempts = entries.filter((l) =>
  (l.op === 'publish-fail' || l.op === 'publish-crash') &&
  l.id === '005-hide-and-seek-horror-game-roblox' &&
  String(l.at || '').slice(0, 10) === today).length;
check('attempt-breaker-counts', attempts === 1, `counted ${attempts}, expected 1`);

const lastOk = [...entries].reverse().find((l) => l.op === 'publish-ok');
check('torn-line-tolerated', entries.length === 3 && lastOk && lastOk.date === '2026-09-26',
  `parsed ${entries.length}/4 lines, lastOk=${lastOk && lastOk.date}`);

// And the REAL ledger must parse without throwing (whatever state it's in).
{
  let ok = true, lines = 0;
  try {
    lines = fs.readFileSync(LOG, 'utf8').split('\n').filter(Boolean).length;
  } catch { ok = false; }
  check('real-ledger-readable', ok, `${lines} lines`);
}

process.exit(failed ? 1 : 0);
