// Public API export surface for @sumirea/core.
//
// The package README documents a single import surface — everything a consumer
// needs comes from `@sumirea/core`, without importing `@sumirea/schema`
// directly. These checks pin that surface so it cannot silently drift from the
// README again: value exports are verified at runtime, and the type re-exports
// are verified against the generated declaration file (types are erased at
// runtime, so they can only be checked there).
//
// Runs against the compiled package output, exactly as consumers import it.

import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

import * as core from '../dist/index.js';

// The value exports a consumer calls (functions), as shown in the README.
const EXPECTED_VALUE_EXPORTS = [
  'createInstance',
  'run',
  'resume',
  'cancel',
  'pause',
  'isStepPause',
];

// Type-only exports are erased at runtime, so they are asserted against
// dist/index.d.ts. The contract types come from @sumirea/schema and MUST be
// re-exported (this was the README drift); the run-state types are declared in
// core itself. They are checked separately so a re-export removal cannot be
// masked by the same name appearing elsewhere (e.g. in a function signature).
const SCHEMA_REEXPORTED_TYPES = [
  'Checkpoint',
  'Step',
  'StepOutcome',
  'StepPause',
  'WorkflowDefinition',
  'WorkflowState',
];
const CORE_DECLARED_TYPES = [
  ['WorkflowStatus', /export type WorkflowStatus\b/],
  ['WorkflowInstance', /export interface WorkflowInstance\b/],
  ['WorkflowFailure', /export interface WorkflowFailure\b/],
];

test('all documented value exports resolve as callables', () => {
  for (const name of EXPECTED_VALUE_EXPORTS) {
    assert.strictEqual(typeof core[name], 'function', `@sumirea/core should export ${name}()`);
  }
});

test('the schema contract types are re-exported from @sumirea/core', () => {
  const dts = readFileSync(fileURLToPath(new URL('../dist/index.d.ts', import.meta.url)), 'utf8');
  // Only lines that actually re-export from the schema package, so a name used
  // in a signature elsewhere cannot satisfy the check.
  const schemaReexports = dts
    .split('\n')
    .filter(
      (line) => line.trimStart().startsWith('export') && line.includes("from '@sumirea/schema'"),
    )
    .join('\n');

  for (const name of SCHEMA_REEXPORTED_TYPES) {
    assert.match(schemaReexports, new RegExp(`\\b${name}\\b`), `should re-export type ${name}`);
  }
});

test('the run-state types are declared and exported by @sumirea/core', () => {
  const dts = readFileSync(fileURLToPath(new URL('../dist/index.d.ts', import.meta.url)), 'utf8');
  for (const [name, pattern] of CORE_DECLARED_TYPES) {
    assert.match(dts, pattern, `@sumirea/core should export type ${name}`);
  }
});

test('the README-style import surface is fully available from @sumirea/core', () => {
  // Mirrors the README import block: a single import from the engine covers the
  // whole public surface. If any of these were missing, the earlier checks fail.
  assert.ok(EXPECTED_VALUE_EXPORTS.every((name) => name in core));
});
