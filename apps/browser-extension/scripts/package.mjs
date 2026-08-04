// scripts/package.mjs
//
// Produces a Chrome-Web-Store-ready zip of the extension: manifest at the root
// plus only the files the browser actually loads. Dev-only files (tests,
// scripts, package.json, README, dist) are excluded. Run with `pnpm package`.

import { execFileSync } from 'node:child_process';
import { mkdirSync, rmSync, readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const manifest = JSON.parse(readFileSync(join(root, 'manifest.json'), 'utf8'));

const distDir = join(root, 'dist');
mkdirSync(distDir, { recursive: true });

const zipPath = join(distDir, `sumirea-waiting-for-you-${manifest.version}.zip`);
rmSync(zipPath, { force: true });

// Only what the manifest references. Keep this in sync with manifest.json.
const include = ['manifest.json', 'background', 'content', 'shared', 'popup'];

execFileSync('zip', ['-r', '-X', zipPath, ...include], { cwd: root, stdio: 'inherit' });

console.log(`\nPackaged ${manifest.name} v${manifest.version} -> ${zipPath}`);
