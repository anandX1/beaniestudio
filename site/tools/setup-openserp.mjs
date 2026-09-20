#!/usr/bin/env node
/**
 * setup-openserp.mjs — download the community-built OpenSERP binary
 * (github.com/karust/openserp, MIT) into tools/bin/ for this OS/arch.
 *
 * OpenSERP is a self-hosted SERP API that renders real Google/Bing results
 * with a local Chrome — the free engine behind our rank tracker.
 * The binary is ~10MB and stays out of git (tools/bin/ is ignored).
 *
 * Usage:
 *   node tools/setup-openserp.mjs            # latest release
 *   node tools/setup-openserp.mjs v0.8.12    # pin a version (recommended)
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';

const VERSION = process.argv[2] || 'v0.8.12';
const here = path.dirname(fileURLToPath(import.meta.url));
const binDir = path.join(here, 'bin');
fs.mkdirSync(binDir, { recursive: true });

const { platform, arch } = process;
const os = platform === 'win32' ? 'windows' : platform === 'darwin' ? 'darwin' : 'linux';
// Node calls it x64, release assets call it amd64
const cpu = arch === 'x64' ? 'amd64' : arch;
const asset = `openserp-${os}-${cpu}-${VERSION.slice(1)}.tgz`;
const url = `https://github.com/karust/openserp/releases/download/${VERSION}/${asset}`;
const tgz = path.join(binDir, asset);
const exeName = os === 'windows' ? 'openserp.exe' : 'openserp';
const exe = path.join(binDir, exeName);

if (fs.existsSync(exe)) {
  console.log(`openserp already installed at ${exe} — delete it to reinstall.`);
  process.exit(0);
}

console.log(`Downloading ${url} …`);
const res = await fetch(url, { redirect: 'follow' });
if (!res.ok) {
  console.error(`✗ download failed: HTTP ${res.status}. Check the version tag (${VERSION}) and your arch (${arch}).`);
  process.exit(1);
}
fs.writeFileSync(tgz, Buffer.from(await res.arrayBuffer()));
const mb = fs.statSync(tgz).size / 1024 / 1024;
if (mb < 1) {
  console.error(`✗ downloaded file is only ${mb.toFixed(2)}MB — download failed silently.`);
  process.exit(1);
}
console.log(`  got ${mb.toFixed(1)}MB`);

// Extract with the OS-native tar, using a RELATIVE path (GNU tar parses
// `D:\...` as a remote host otherwise) and only the binary out of the archive.
const extract = spawnSync('tar', ['-xzf', path.basename(tgz), '-C', '.', exeName], { cwd: binDir, stdio: 'inherit' });
if (extract.status !== 0) {
  console.error('✗ extraction failed — is tar available?');
  process.exit(1);
}
fs.rmSync(tgz, { force: true });

// Some releases nest the binary in a subfolder — normalize to tools/bin/openserp(.exe)
if (!fs.existsSync(exe)) {
  const nested = fs.readdirSync(binDir, { withFileTypes: true })
    .find((d) => d.isDirectory() && fs.existsSync(path.join(binDir, d.name, exeName)));
  if (nested) fs.renameSync(path.join(binDir, nested.name, exeName), exe);
}

if (!fs.existsSync(exe)) {
  console.error(`✗ extracted but no ${exeName} found in ${binDir}:`, fs.readdirSync(binDir));
  process.exit(1);
}
console.log(`✓ installed: ${exe}`);
console.log('Test it:    ' + exeName + ' version');
