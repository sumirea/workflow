// Checkpoint pause behaviour for @sumirea/core.
//
// The Checkpoint pause slice adds one generic orchestration outcome: a Step may
// ask the Runtime to pause at a Checkpoint instead of returning a next state.
// These checks prove the Runtime stops at that Step, marks the instance
// `paused`, preserves the held state, records the opaque Checkpoint, and never
// interprets why the pause was requested — while the existing continue/fail
// paths are untouched (covered by runtime.test.mjs).
//
// Runs against the compiled package output, exactly as consumers import it.

import test from 'node:test';
import assert from 'node:assert/strict';

import { createInstance, run, pause, trivialPausingWorkflow } from '../dist/index.js';

test('a Step can pause the run at a Checkpoint', () => {
  const result = run(createInstance(trivialPausingWorkflow));

  assert.strictEqual(result.status, 'paused');
  assert.notStrictEqual(result.checkpoint, undefined, 'a Checkpoint is recorded');
});

test('execution stops after the pausing Step', () => {
  // A shared recorder proves the Step after the pausing one never runs.
  const reached = [];
  const record = (marker) => ({
    name: marker,
    run: (state) => {
      reached.push(marker);
      return state;
    },
  });
  const definition = {
    name: 'stops-at-checkpoint',
    steps: [
      record('before'),
      { name: 'pause-here', run: (state) => pause({ name: 'review' }, state) },
      record('after'),
    ],
  };

  const result = run(createInstance(definition));

  assert.strictEqual(result.status, 'paused');
  assert.strictEqual(result.cursor, 1, 'stopped at the pausing Step');
  assert.deepStrictEqual(reached, ['before'], 'the Step after the pause never ran');
});

test('the last successfully produced state is preserved at the pause', () => {
  const definition = {
    name: 'preserve-at-pause',
    initialState: { value: 'initial' },
    steps: [
      { name: 'advance', run: (state) => ({ ...state, value: 'after-first' }) },
      { name: 'pause-here', run: (state) => pause({ name: 'review' }, state) },
      { name: 'never', run: (state) => ({ ...state, value: 'unreached' }) },
    ],
  };

  const result = run(createInstance(definition));

  assert.strictEqual(result.status, 'paused');
  assert.deepStrictEqual(
    result.state,
    { value: 'after-first' },
    'the state the pausing Step held is preserved, not a later or initial one',
  );
});

test('minimal Checkpoint metadata is available, and carried opaquely', () => {
  // The Runtime records the Step's Checkpoint by reference and does not add to,
  // wrap, or interpret it.
  const checkpoint = { name: 'needs-human-review' };
  const definition = {
    name: 'opaque-checkpoint',
    steps: [{ name: 'pause-here', run: (state) => pause(checkpoint, state) }],
  };

  const result = run(createInstance(definition));

  assert.strictEqual(result.status, 'paused');
  assert.strictEqual(result.cursor, 0);
  assert.strictEqual(result.checkpoint, checkpoint, 'the Checkpoint is kept as given');
  assert.strictEqual(result.failure, undefined, 'a pause is not a failure');
});

test('the Runtime does not inspect why the Checkpoint was requested', () => {
  // Two Steps pause with entirely different Checkpoint payloads; the Runtime
  // treats both identically — it stops and records whatever it was handed.
  const first = run(
    createInstance({
      name: 'reason-a',
      steps: [{ name: 'p', run: (state) => pause({ name: 'reason-a' }, state) }],
    }),
  );
  const second = run(
    createInstance({
      name: 'reason-b',
      steps: [{ name: 'p', run: (state) => pause({ name: 'reason-b' }, state) }],
    }),
  );

  assert.strictEqual(first.status, 'paused');
  assert.strictEqual(second.status, 'paused');
  assert.strictEqual(first.checkpoint.name, 'reason-a');
  assert.strictEqual(second.checkpoint.name, 'reason-b');
});

test('replacing the Checkpoint-producing Step needs no Runtime change', () => {
  // The same `run` drives a workflow whose pausing Step is swapped for a
  // completely different implementation; the Runtime is unchanged and still
  // pauses, because it acts only on the generic outcome.
  const withPausingStep = (fn) => ({
    name: 'replaceable-pause',
    initialState: { value: 'seed' },
    steps: [{ name: 'only', run: fn }],
  });

  const bare = run(createInstance(withPausingStep((state) => pause({ name: 'bare' }, state))));
  const advanced = run(
    createInstance(
      withPausingStep((state) => pause({ name: 'advanced' }, { ...state, value: 'changed' })),
    ),
  );

  assert.strictEqual(bare.status, 'paused');
  assert.deepStrictEqual(bare.state, { value: 'seed' });
  assert.strictEqual(advanced.status, 'paused');
  assert.deepStrictEqual(advanced.state, { value: 'changed' });
});

test('a bare returned state is never mistaken for a pause', () => {
  // Opaque state may contain anything, including a `state` field; it must still
  // be treated as a normal continue, not a pause.
  const definition = {
    name: 'statey-state',
    initialState: { state: 'not-a-pause', checkpoint: 'also-not' },
    steps: [{ name: 'passthrough', run: (state) => state }],
  };

  const result = run(createInstance(definition));

  assert.strictEqual(result.status, 'completed', 'a plain state continues to completion');
  assert.strictEqual(result.checkpoint, undefined);
});
