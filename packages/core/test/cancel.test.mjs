// Checkpoint cancellation for @sumirea/core.
//
// `cancel()` terminates a paused instance as `cancelled` without resuming: it
// preserves the paused Workflow State, clears the active Checkpoint, runs no
// Step, and never marks the Workflow `failed`. Like `resume`, it only applies to
// a `paused` instance; any other status is caller misuse and throws.
//
// Runs against the compiled package output, exactly as consumers import it.

import test from 'node:test';
import assert from 'node:assert/strict';

import {
  createInstance,
  run,
  cancel,
  pause,
  trivialWorkflow,
  trivialFailingWorkflow,
  trivialPausingWorkflow,
} from '../dist/index.js';

test('a paused instance can be cancelled', () => {
  const paused = run(createInstance(trivialPausingWorkflow));
  assert.strictEqual(paused.status, 'paused');

  const cancelled = cancel(paused);

  assert.strictEqual(cancelled.status, 'cancelled');
  assert.notStrictEqual(cancelled.status, 'failed', 'cancellation is not a failure');
  assert.strictEqual(cancelled.failure, undefined);
});

test('cancellation preserves the paused Workflow State', () => {
  const definition = {
    name: 'cancel-preserves-state',
    initialState: { trail: [] },
    steps: [
      { name: 'a', run: (s) => ({ ...s, trail: [...s.trail, 'a'] }) },
      { name: 'pause', run: (s) => pause({ name: 'review' }, { ...s, trail: [...s.trail, 'p'] }) },
      { name: 'c', run: (s) => ({ ...s, trail: [...s.trail, 'c'] }) },
    ],
  };
  const paused = run(createInstance(definition));
  assert.deepStrictEqual(paused.state.trail, ['a', 'p']);

  const cancelled = cancel(paused);

  assert.strictEqual(cancelled.status, 'cancelled');
  assert.strictEqual(cancelled.state, paused.state, 'the paused state is carried through');
  assert.deepStrictEqual(cancelled.state.trail, ['a', 'p']);
});

test('cancellation clears the active Checkpoint metadata', () => {
  const paused = run(createInstance(trivialPausingWorkflow));
  assert.notStrictEqual(paused.checkpoint, undefined, 'a Checkpoint is present while paused');

  const cancelled = cancel(paused);

  assert.strictEqual(cancelled.checkpoint, undefined, 'the Checkpoint is cleared on cancel');
});

test('cancellation executes no Steps', () => {
  const ran = [];
  const record = (marker, fn) => ({
    name: marker,
    run: (state) => {
      ran.push(marker);
      return fn(state);
    },
  });
  const definition = {
    name: 'cancel-no-run',
    steps: [record('pause', (s) => pause({ name: 'review' }, s)), record('after', (s) => s)],
  };
  const paused = run(createInstance(definition));
  assert.deepStrictEqual(ran, ['pause'], 'only the pausing Step ran during the first run');

  cancel(paused);

  assert.deepStrictEqual(ran, ['pause'], 'cancel ran no further Steps');
});

test('cancel throws for a created instance', () => {
  const created = createInstance(trivialWorkflow);
  assert.throws(() => cancel(created), /status "created".*expected "paused"/);
});

test('cancel throws for a running instance', () => {
  // A `running` instance is transient and never returned; construct one by hand.
  const running = { ...createInstance(trivialWorkflow), status: 'running' };
  assert.throws(() => cancel(running), /status "running".*expected "paused"/);
});

test('cancel throws for a completed instance', () => {
  const completed = run(createInstance(trivialWorkflow));
  assert.throws(() => cancel(completed), /status "completed".*expected "paused"/);
});

test('cancel throws for a failed instance', () => {
  const failed = run(createInstance(trivialFailingWorkflow));
  assert.throws(() => cancel(failed), /status "failed".*expected "paused"/);
});

test('cancel throws for an already-cancelled instance', () => {
  const cancelled = cancel(run(createInstance(trivialPausingWorkflow)));
  assert.strictEqual(cancelled.status, 'cancelled');
  assert.throws(() => cancel(cancelled), /status "cancelled".*expected "paused"/);
});

test('an invalid cancel does not mutate the input instance', () => {
  const completed = run(createInstance(trivialWorkflow));
  const before = { ...completed };
  const stateRef = completed.state;

  assert.throws(() => cancel(completed));

  assert.strictEqual(completed.status, 'completed', 'status is untouched, not "cancelled"');
  assert.strictEqual(completed.state, stateRef, 'state is the same object, unmodified');
  assert.deepStrictEqual(completed, before, 'the input instance is unchanged');
});
