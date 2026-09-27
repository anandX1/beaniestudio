#!/usr/bin/env node
/**
 * test-publish-core.mjs — offline checks for the hardened publish pipeline.
 * Run: node scripts/test-publish-core.mjs   (exit 0 = all pass)
 *
 * Covers the 2026-09-27 autopilot post-mortem: a wedged or vanished pipeline
 * step must RESOLVE (code 124 / spawnError) instead of hanging the tick
 * forever, and a failed step must still hand back its output for the ledger.
 */
import { runStep } from './publish-core.mjs';

let failed = 0;
const check = (name, pass, detail) => {
  console.log(`${pass ? 'PASS' : 'FAIL'} ${name}`, detail ?? '');
  if (!pass) failed++;
};

// 1. Timeout: a step that blocks ~8s (ping sleeps without needing console
//    stdin — `timeout.exe` refuses to run redirected, so don't use it) must
//    be killed at ~1.2s and resolve { code: 124, timedOut: true }.
{
  const t0 = Date.now();
  const r = await runStep('ping -n 9 127.0.0.1 >nul', { timeoutMs: 1200 });
  const ms = Date.now() - t0;
  check('timeout-kill', r.code === 124 && r.timedOut === true && ms >= 1100 && ms < 4000,
    JSON.stringify({ code: r.code, timedOut: !!r.timedOut, ms }));
}

// 2. Spawn error: a command that cannot spawn must resolve (never hang).
{
  const r = await runStep('definitely-not-a-real-command-xyz-42', { timeoutMs: 8000 });
  check('spawn-error-resolves', r.code !== 0 && !r.timedOut, JSON.stringify({ code: r.code }));
}

// 3. Success path unchanged.
{
  const r = await runStep('exit /b 0');
  check('success-path', r.code === 0, JSON.stringify({ code: r.code }));
}

// 4. Failure path: exit code AND captured output come back for the ledger.
{
  const r = await runStep('echo boom & exit /b 3');
  check('fail-captures-output', r.code === 3 && /boom/.test(r.out),
    JSON.stringify({ code: r.code, out: r.out.trim().slice(0, 12) }));
}

process.exit(failed ? 1 : 0);
