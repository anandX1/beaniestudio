#!/usr/bin/env node
/**
 * One-command deploy: build → sync to the GitHub repo → push → ping IndexNow.
 * Used by Content Studio's publish button and by humans (`npm run deploy`).
 *
 * Repo layout (established earlier in this project):
 *   D:\roblox game 4\beaniestudio-site   ← the git repo Cloudflare serves
 *     ├─ site/            Astro source (mirror of this folder, minus ignores)
 *     └─ (root)           the built site (direct-upload deploy model)
 *
 * Env overrides: DEPLOY_REPO (default the path above), DEPLOY_BRANCH (main).
 * --no-ping skips the IndexNow ping; --dry-run shows what would run.
 */
import { execSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const SITE_ROOT = path.resolve(here, '..');
const REPO = process.env.DEPLOY_REPO || 'D:\\roblox game 4\\beaniestudio-site';
const BRANCH = process.env.DEPLOY_BRANCH || 'main';
const PING = !process.argv.includes('--no-ping');
const DRY = process.argv.includes('--dry-run');

const log = (...m) => console.log('[deploy]', ...m);
const sh = (cmd, cwd) => {
  log('$', cmd, cwd ? `(in ${path.relative(SITE_ROOT, cwd) || cwd})` : '');
  if (!DRY) execSync(cmd, { cwd, stdio: 'inherit' });
};

// 1. Build the site (env from site/.env is loaded by Astro automatically for
//    PUBLIC_* vars; content-engine handles its own loading).
sh('npm run build', SITE_ROOT);

// 2. Sync source → repo/site (excluding heavy/local dirs). Skipped on --dry-run.
const IGNORE = ['node_modules', 'dist', '.astro', '.state', 'reports', 'content'];
if (DRY) {
  log('dry run: would sync source → repo/site, build → repo root, commit, push, ping');
} else {
const destSite = path.join(REPO, 'site');
fs.mkdirSync(destSite, { recursive: true });
for (const entry of fs.readdirSync(destSite)) {
  if (!IGNORE.includes(entry)) fs.rmSync(path.join(destSite, entry), { recursive: true, force: true });
}
for (const entry of fs.readdirSync(SITE_ROOT, { withFileTypes: true })) {
  if (IGNORE.includes(entry.name)) continue;
  fs.cpSync(path.join(SITE_ROOT, entry.name), path.join(destSite, entry.name), {
    recursive: true,
    filter: (src) => !src.includes('node_modules') && !src.includes(`${path.sep}.env`) && path.basename(src) !== 'preview.html',
  });
}
// Keep the keyword harvest in the repo (content/ is otherwise ignored).
const kwSrc = path.join(SITE_ROOT, 'content', 'keywords.json');
if (fs.existsSync(kwSrc)) {
  fs.mkdirSync(path.join(destSite, 'content'), { recursive: true });
  fs.copyFileSync(kwSrc, path.join(destSite, 'content', 'keywords.json'));
}

// Keep the broadcast ledger in the repo too. CI broadcasts with the real
// secrets and commits content/social-state.json back; before every local
// deploy we UNION-merge the repo's copy into ours (CI may have delivered
// posts since our last sync), then ship the merged ledger up. A memory
// shared by both writers — neither can clobber the other.
const ledgerSrc = path.join(SITE_ROOT, 'content', 'social-state.json');
const ledgerDst = path.join(destSite, 'content', 'social-state.json');
if (fs.existsSync(ledgerSrc)) {
  fs.mkdirSync(path.dirname(ledgerDst), { recursive: true });
  if (fs.existsSync(ledgerDst)) {
    try {
      const local = JSON.parse(fs.readFileSync(ledgerSrc, 'utf8'));
      const repoLedger = JSON.parse(fs.readFileSync(ledgerDst, 'utf8'));
      let merged = 0;
      for (const [k, v] of Object.entries(repoLedger.posted || {})) {
        if (!local.posted[k]) { local.posted[k] = v; merged++; }
      }
      if (merged) {
        fs.writeFileSync(ledgerSrc, JSON.stringify(local, null, 2) + '\n');
        log(`ledger: absorbed ${merged} entr(y/ies) broadcast by CI`);
      }
    } catch { log('ledger: repo copy unreadable — local version wins'); }
  }
  fs.copyFileSync(ledgerSrc, ledgerDst);
}

// 3. Sync build → repo root (Cloudflare direct-upload model).
const dist = path.join(SITE_ROOT, 'dist');
if (!fs.existsSync(dist)) { console.error('[deploy] ✗ dist missing — build failed'); process.exit(1); }
for (const entry of fs.readdirSync(REPO, { withFileTypes: true })) {
  if (['.git', 'site', 'README.md', '.gitignore', '.assetsignore', '.github'].includes(entry.name)) continue;
  fs.rmSync(path.join(REPO, entry.name), { recursive: true, force: true });
}
fs.cpSync(dist, REPO, { recursive: true });
}

// 4. Commit + push (only if there's something to commit).
const git = (cmd) => sh(`git ${cmd}`, REPO);
const status = DRY ? '' : execSync('git status --short', { cwd: REPO, encoding: 'utf8' }).trim();
if (!status) {
  log('nothing changed — repo already in sync');
} else {
  log('changed files:\n' + status.split('\n').map((l) => '  ' + l).join('\n'));
  git('add -A');
  git(`-c core.safecrlf=false commit -m "Deploy: content update ${new Date().toISOString().slice(0, 16)}"`);
  // The broadcast ledger gets committed back by CI after each delivery; absorb
  // that history instead of racing it (rebase may be a no-op — both fine).
  try { git(`pull --rebase origin ${BRANCH}`); } catch {
    try { git('rebase --abort'); } catch { /* nothing to abort */ }
    log('pull --rebase failed — pushing anyway (will retry on next deploy if rejected)');
  }
  git(`push origin ${BRANCH}`);
}

// 5. IndexNow ping (Bing/Seznam/Yandex crawl within minutes).
if (PING && !DRY) {
  try {
    sh('npm run ping:indexnow', SITE_ROOT);
  } catch {
    log('IndexNow ping failed (non-fatal — sitemap still updated)');
  }
}
log(DRY ? 'dry run complete — nothing written' : 'deploy complete');
