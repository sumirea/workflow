// Runtime behaviour regression checks for @sumirea/core.
//
// These pin the already-accepted orchestration behaviour of the three merged
// Runtime slices (happy path, failure path, execution lifecycle) so it cannot
// regress silently. They add no new Runtime behaviour — they only exercise the
// public surface (`createInstance`, `run`) and the built-in demonstration
// workflows, and assert what those already do.
//
// Runs against the compiled package output, exactly as consumers import it.

import test from 'node:test';
import assert from 'node:assert/strict';

import { createInstance, run, trivialWorkflow, trivialFailingWorkflow } from '../dist/index.js';

// --- Happy path ------------------------------------------------------------

test('happy path: a workflow runs to completion', () => {
  const result = run(createInstance(trivialWorkflow));

  assert.strictEqual(result.status, 'completed');
  assert.strictEqual(result.cursor, trivialWorkflow.steps.length);
  assert.strictEqual(result.failure, undefined, 'no failure on the happy path');
});

test('happy path: Steps run sequentially and thread Workflow State', () => {
  // Each Step appends its own marker to an ordered trail carried in the state.
  // The resulting order proves both sequential execution and that the state
  // produced by one Step is the input to the next.
  const append = (marker) => ({
    name: marker,
    run: (state) => ({ ...state, trail: [...state.trail, marker] }),
  });
  const definition = {
    name: 'threading',
    initialState: { trail: [] },
    steps: [append('a'), append('b'), append('c')],
  };

  const result = run(createInstance(definition));

  assert.strictEqual(result.status, 'completed');
  assert.deepStrictEqual(
    result.state.trail,
    ['a', 'b', 'c'],
    'Steps executed in order, each seeing the previous Step’s output',
  );
});

test('happy path: replacing a Step needs no Runtime change', () => {
  // Two definitions that differ ONLY in the implementation of their single
  // Step. The same `run` drives both; the result is dictated entirely by the
  // Step, which confirms the Runtime treats Steps as black boxes.
  const withStep = (fn) => ({
    name: 'replaceable',
    initialState: { value: 'seed' },
    steps: [{ name: 'only', run: fn }],
  });

  const upper = run(
    createInstance(withStep((state) => ({ ...state, value: state.value.toUpperCase() }))),
  );
  const doubled = run(
    createInstance(withStep((state) => ({ ...state, value: state.value + state.value }))),
  );

  assert.strictEqual(upper.state.value, 'SEED');
  assert.strictEqual(doubled.state.value, 'seedseed');
  assert.strictEqual(upper.status, 'completed');
  assert.strictEqual(doubled.status, 'completed');
});

// --- Failure path ----------------------------------------------------------

test('failure path: a throwing Step terminates the run as failed', () => {
  const result = run(createInstance(trivialFailingWorkflow));

  assert.strictEqual(result.status, 'failed');
  // trivialFailingWorkflow is [noop, failing, noop]: it stops at index 1.
  assert.strictEqual(result.cursor, 1);
  assert.strictEqual(result.failure.stepIndex, 1);
});

test('failure path: execution stops after the failing Step', () => {
  // A shared recorder proves the Step after the failing one never runs.
  const reached = [];
  const record = (marker) => ({
    name: marker,
    run: (state) => {
      reached.push(marker);
      return state;
    },
  });
  const definition = {
    name: 'stops-after-failure',
    steps: [
      record('before'),
      {
        name: 'boom',
        run: () => {
          throw new Error('boom');
        },
      },
      record('after'),
    ],
  };

  const result = run(createInstance(definition));

  assert.strictEqual(result.status, 'failed');
  assert.strictEqual(result.failure.stepIndex, 1);
  assert.deepStrictEqual(reached, ['before'], 'the Step after the failing one never ran');
});

test('failure path: the last successfully produced state is preserved', () => {
  const definition = {
    name: 'preserve-state',
    initialState: { value: 'initial' },
    steps: [
      { name: 'advance', run: (state) => ({ ...state, value: 'after-first' }) },
      {
        name: 'boom',
        run: () => {
          throw new Error('boom');
        },
      },
    ],
  };

  const result = run(createInstance(definition));

  assert.strictEqual(result.status, 'failed');
  assert.deepStrictEqual(
    result.state,
    { value: 'after-first' },
    'state from the last successful Step is kept, not the initial state',
  );
});

test('failure path: failure metadata stays minimal and opaque', () => {
  // The Runtime must not interpret or wrap what a Step throws. Throw a plain
  // non-Error sentinel and assert it is carried through by reference, and that
  // the failure record holds nothing beyond the failing index and that value.
  const sentinel = { reason: 'anything at all' };
  const definition = {
    name: 'opaque-failure',
    steps: [
      {
        name: 'boom',
        run: () => {
          throw sentinel;
        },
      },
    ],
  };

  const result = run(createInstance(definition));

  assert.strictEqual(result.status, 'failed');
  assert.strictEqual(result.failure.error, sentinel, 'the thrown value is kept, unwrapped');
  assert.strictEqual(result.failure.stepIndex, 0);
  assert.deepStrictEqual(
    Object.keys(result.failure).sort(),
    ['error', 'stepIndex'],
    'failure metadata carries nothing beyond the index and the opaque value',
  );
});

// --- Lifecycle -------------------------------------------------------------

test('lifecycle: a fresh instance begins in `created`', () => {
  const instance = createInstance(trivialWorkflow);

  assert.strictEqual(instance.status, 'created');
  assert.strictEqual(instance.cursor, 0);
  assert.strictEqual(instance.failure, undefined);
});

test('lifecycle: `run` drives `created` to a terminal status', () => {
  // The `running` phase is the internal window during which Steps execute: an
  // instance enters it immediately before the first Step and leaves it only on
  // termination. It is transient by design (a Step receives state, never the
  // instance), so it is verified indirectly here — a run always leaves
  // `created` and lands on exactly one terminal status, never staying in
  // `created` or `running`.
  const completed = run(createInstance(trivialWorkflow));
  const failed = run(createInstance(trivialFailingWorkflow));

  assert.strictEqual(completed.status, 'completed', 'success terminates as `completed`');
  assert.strictEqual(failed.status, 'failed', 'failure terminates as `failed`');
  for (const status of [completed.status, failed.status]) {
    assert.notStrictEqual(status, 'created', 'a run never ends in `created`');
    assert.notStrictEqual(status, 'running', 'a run never ends in `running`');
  }
});
