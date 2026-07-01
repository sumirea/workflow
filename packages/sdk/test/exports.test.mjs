// Public API surface for @sumirea/sdk.
//
// The sdk is the single curated entry point consumers import from. These checks
// pin that surface: the approved Runtime functions resolve at runtime, the
// contract types are re-exported in the declaration file, and Core's
// demonstration-only workflows are deliberately NOT part of the public API.
//
// Runs against the compiled package output, exactly as consumers import it.

import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

import * as sdk from '../dist/index.js';

// The value exports a consumer calls (functions), re-exported from Core.
const EXPECTED_VALUE_EXPORTS = ['createInstance', 'run', 'resume', 'cancel', 'pause', 'isStepPause'];

// The type-only exports, erased at runtime, asserted against dist/index.d.ts.
const EXPECTED_TYPE_EXPORTS = [
  'WorkflowDefinition',
  'Step',
  'StepOutcome',
  'StepPause',
  'Checkpoint',
  'WorkflowState',
  'WorkflowInstance',
  'WorkflowStatus',
  'WorkflowFailure',
];

// Core's demonstration-only workflows must never surface through the sdk.
const FORBIDDEN_EXPORTS = ['trivialWorkflow', 'trivialPausingWorkflow', 'trivialFailingWorkflow'];

test('all approved value exports resolve as callables', () => {
  for (const name of EXPECTED_VALUE_EXPORTS) {
    assert.strictEqual(typeof sdk[name], 'function', `@sumirea/sdk should export ${name}()`);
  }
});

test('the contract types are re-exported in the package declaration', () => {
  const dts = readFileSync(fileURLToPath(new URL('../dist/index.d.ts', import.meta.url)), 'utf8');
  // Only the export lines from Core, so a name mentioned elsewhere cannot mask a
  // missing re-export.
  const coreReexports = dts
    .split('\n')
    .filter((line) => line.trimStart().startsWith('export') && line.includes("from '@sumirea/core'"))
    .join('\n');

  for (const name of EXPECTED_TYPE_EXPORTS) {
    assert.match(coreReexports, new RegExp(`\\b${name}\\b`), `sdk should re-export type ${name}`);
  }
});

test('demo-only workflows are not part of the public sdk surface', () => {
  const dts = readFileSync(fileURLToPath(new URL('../dist/index.d.ts', import.meta.url)), 'utf8');
  for (const name of FORBIDDEN_EXPORTS) {
    assert.strictEqual(sdk[name], undefined, `${name} must not be a runtime export of @sumirea/sdk`);
    assert.doesNotMatch(dts, new RegExp(`\\b${name}\\b`), `${name} must not appear in the sdk types`);
  }
});

test('the sdk re-exports Core behaviour without wrapping it', () => {
  // A quick end-to-end sanity check: authoring and running a workflow through the
  // sdk surface behaves exactly as Core does.
  const definition = {
    name: 'sdk-smoke',
    steps: [{ name: 'step', run: (state) => ({ ...state, ran: true }) }],
  };
  const result = sdk.run(sdk.createInstance(definition));
  assert.strictEqual(result.status, 'completed');
  assert.deepStrictEqual(result.state, { ran: true });
});
