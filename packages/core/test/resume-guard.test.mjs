// Resume API guard for @sumirea/core.
//
// `resume()` is only valid for a `paused` instance. Calling it with any other
// status is caller misuse — not a Step or Workflow failure — so it must throw
// without running a Step, mutating the input, or marking the instance `failed`.
// The existing valid-resume behaviour (paused instances) is covered by
// resume.test.mjs; these checks pin the guard.
//
// Runs against the compiled package output, exactly as consumers import it.

import test from 'node:test';
import assert from 'node:assert/strict';

import {
  createInstance,
  run,
  resume,
  trivialWorkflow,
  trivialFailingWorkflow,
  trivialPausingWorkflow,
} from '../dist/index.js';

test('resume still succeeds for a paused instance', () => {
  const paused = run(createInstance(trivialPausingWorkflow));
  assert.strictEqual(paused.status, 'paused');

  const resumed = resume(paused);
  assert.strictEqual(resumed.status, 'completed');
});

test('resume throws for a created instance', () => {
  const created = createInstance(trivialWorkflow);
  assert.strictEqual(created.status, 'created');
  assert.throws(() => resume(created), /status "created".*expected "paused"/);
});

test('resume throws for a running instance', () => {
  // A `running` instance is transient inside the Runtime and never returned;
  // construct one by hand to exercise the guard.
  const running = { ...createInstance(trivialWorkflow), status: 'running' };
  assert.throws(() => resume(running), /status "running".*expected "paused"/);
});

test('resume throws for a completed instance', () => {
  const completed = run(createInstance(trivialWorkflow));
  assert.strictEqual(completed.status, 'completed');
  assert.throws(() => resume(completed), /status "completed".*expected "paused"/);
});

test('resume throws for a failed instance', () => {
  const failed = run(createInstance(trivialFailingWorkflow));
  assert.strictEqual(failed.status, 'failed');
  assert.throws(() => resume(failed), /status "failed".*expected "paused"/);
});

test('an invalid resume executes no Steps', () => {
  const ran = [];
  const definition = {
    name: 'guard-no-run',
    steps: [
      {
        name: 'recorder',
        run: (state) => {
          ran.push('recorder');
          return state;
        },
      },
    ],
  };
  const created = createInstance(definition);

  assert.throws(() => resume(created));
  assert.deepStrictEqual(ran, [], 'no Step ran on an invalid resume');
});

test('an invalid resume does not mutate the input or mark it failed', () => {
  const completed = run(createInstance(trivialWorkflow));
  const before = { ...completed };
  const stateRef = completed.state;

  assert.throws(() => resume(completed));

  assert.strictEqual(completed.status, 'completed', 'status is untouched, not "failed"');
  assert.notStrictEqual(completed.status, 'failed');
  assert.strictEqual(completed.cursor, before.cursor);
  assert.strictEqual(completed.state, stateRef, 'state is the same object, unmodified');
  assert.strictEqual(completed.failure, undefined);
  assert.deepStrictEqual(completed, before, 'the input instance is unchanged');
});
