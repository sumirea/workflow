// Optional run id on a Workflow Instance for @sumirea/core.
//
// The observation seed adds one thing: an optional, caller-provided `id` on the
// instance. These checks prove `createInstance` stores it verbatim, defaults it
// to `undefined` when omitted, and that the Runtime carries it unchanged through
// every lifecycle transition (complete, pause, resume, fail, cancel) without
// generating, inspecting, or interpreting it — while Steps still receive only
// `state`. It is not a Journal, Event, or Persistence mechanism.
//
// Runs against the compiled package output, exactly as consumers import it.

import test from 'node:test';
import assert from 'node:assert/strict';

import {
  createInstance,
  run,
  resume,
  cancel,
  pause,
  trivialWorkflow,
  trivialFailingWorkflow,
  trivialPausingWorkflow,
} from '../dist/index.js';

test('createInstance stores a provided id', () => {
  const created = createInstance(trivialWorkflow, { id: 'run-123' });
  assert.strictEqual(created.id, 'run-123');
});

test('createInstance leaves id undefined when no options are given', () => {
  const created = createInstance(trivialWorkflow);
  assert.strictEqual(created.id, undefined);
});

test('createInstance leaves id undefined when options omit id', () => {
  const created = createInstance(trivialWorkflow, {});
  assert.strictEqual(created.id, undefined);
});

test('id remains stable after a completed workflow', () => {
  const completed = run(createInstance(trivialWorkflow, { id: 'run-complete' }));
  assert.strictEqual(completed.status, 'completed');
  assert.strictEqual(completed.id, 'run-complete');
});

test('id remains stable after a paused workflow', () => {
  const paused = run(createInstance(trivialPausingWorkflow, { id: 'run-pause' }));
  assert.strictEqual(paused.status, 'paused');
  assert.strictEqual(paused.id, 'run-pause');
});

test('id remains stable after resume', () => {
  const paused = run(createInstance(trivialPausingWorkflow, { id: 'run-resume' }));
  assert.strictEqual(paused.status, 'paused');

  const resumed = resume(paused);
  assert.strictEqual(resumed.status, 'completed');
  assert.strictEqual(resumed.id, 'run-resume');
});

test('id remains stable after a failed workflow', () => {
  const failed = run(createInstance(trivialFailingWorkflow, { id: 'run-fail' }));
  assert.strictEqual(failed.status, 'failed');
  assert.strictEqual(failed.id, 'run-fail');
});

test('id remains stable after cancel', () => {
  const paused = run(createInstance(trivialPausingWorkflow, { id: 'run-cancel' }));
  assert.strictEqual(paused.status, 'paused');

  const cancelled = cancel(paused);
  assert.strictEqual(cancelled.status, 'cancelled');
  assert.strictEqual(cancelled.id, 'run-cancel');
});

test('id is preserved unchanged across a pause-resume-pause chain', () => {
  const definition = {
    name: 'id-through-chain',
    steps: [
      { name: 'p1', run: (state) => pause({ name: 'first' }, state) },
      { name: 'p2', run: (state) => pause({ name: 'second' }, state) },
      { name: 'done', run: (state) => state },
    ],
  };

  const first = run(createInstance(definition, { id: 'run-chain' }));
  assert.strictEqual(first.id, 'run-chain');
  const second = resume(first);
  assert.strictEqual(second.id, 'run-chain');
  const done = resume(second);
  assert.strictEqual(done.status, 'completed');
  assert.strictEqual(done.id, 'run-chain');
});

test('the Runtime does not pass the id to a Step; Steps still receive only state', () => {
  // The Step records every argument it is called with. With an id set on the
  // instance, the Step must still be handed exactly one argument: the state.
  const calls = [];
  const definition = {
    name: 'step-sees-only-state',
    initialState: { seed: true },
    steps: [
      {
        name: 'inspect-args',
        run: (...args) => {
          calls.push(args);
          return args[0];
        },
      },
    ],
  };

  const completed = run(createInstance(definition, { id: 'run-args' }));

  assert.strictEqual(completed.status, 'completed');
  assert.strictEqual(calls.length, 1);
  assert.strictEqual(calls[0].length, 1, 'the Step was called with exactly one argument');
  assert.deepStrictEqual(calls[0][0], { seed: true }, 'the sole argument is the state');
});
