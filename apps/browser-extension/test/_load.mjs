// test/_load.mjs
//
// The extension's shared/*.js files are classic content-script modules: each is
// an IIFE that attaches its API to globalThis. They are not ES modules, so we
// cannot `import` them. Instead we execute each in a fresh VM context whose
// global object we then read back. This tests the exact files that ship, with
// no build step and no source changes for testability.

import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import vm from 'node:vm';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');

function runInFreshContext(relPath) {
  const sandbox = {};
  vm.createContext(sandbox); // `globalThis` inside the context === sandbox
  vm.runInContext(readFileSync(join(root, relPath), 'utf8'), sandbox);
  return sandbox;
}

export function loadSignals() {
  return runInFreshContext('shared/claude-signals.js').SumireaClaudeSignals;
}

export function loadWaitingEdge() {
  return runInFreshContext('shared/waiting-edge.js').SumireaWaitingEdge;
}
