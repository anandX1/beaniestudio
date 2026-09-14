#!/usr/bin/env node
/**
 * copy-fonts.mjs — sync the self-hosted font files from node_modules to
 * public/fonts with STABLE filenames (no content hashes, so <link rel=preload>
 * URLs never rot). Run after bumping @fontsource packages. Cheap + idempotent.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const out = path.join(root, 'public', 'fonts');
fs.mkdirSync(out, { recursive: true });

const files = [
  ['@fontsource/chakra-petch/files/chakra-petch-latin-500-normal.woff2', 'chakra-petch-latin-500-normal.woff2'],
  ['@fontsource/chakra-petch/files/chakra-petch-latin-700-normal.woff2', 'chakra-petch-latin-700-normal.woff2'],
  ['@fontsource-variable/public-sans/files/public-sans-latin-wght-normal.woff2', 'public-sans-latin-wght-normal.woff2'],
  ['@fontsource-variable/jetbrains-mono/files/jetbrains-mono-latin-wght-normal.woff2', 'jetbrains-mono-latin-wght-normal.woff2'],
];

for (const [src, name] of files) {
  const from = path.join(root, 'node_modules', src);
  fs.copyFileSync(from, path.join(out, name));
  console.log(`✓ fonts/${name}  ${Math.round(fs.statSync(path.join(out, name)).size / 1024)}KB`);
}
console.log('fonts synced.');
