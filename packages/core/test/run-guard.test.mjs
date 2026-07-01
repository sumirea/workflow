// Run API guard for @sumirea/core.
//
// `run()` is only valid for a `created` instance — the entry point of the
// lifecycle. Calling it with any already-started, terminated, paused, or
// cancelled instance is caller misuse (use `resume`/`cancel` for a paused run),
// so it throws without running a Step, mutating the input, or producing a
// `failed` instance. Valid `run(created)` behaviour is covered elsewhere; these
// checks pin the guard.
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

// --- Valid run(created) still reaches each terminal/paused status ------------

test('run(created) can still complete', () => {
  assert.strictEqual(run(createInstance(trivialWorkflow)).status, 'completed');
});

test('run(created) can still fail', () => {
  assert.strictEqual(run(createInstance(trivialFailingWorkflow)).status, 'failed');
});

test('run(created) can still pause', () => {
  assert.strictEqual(run(createInstance(trivialPausingWorkflow)).status, 'paused');
});

// --- run() rejects every non-created status ---------------------------------

test('run throws for a running instance', () => {
  // A `running` instance is transient inside the Runtime and never returned;
  // construct one by hand to exercise the guard.
  const running = { ...createInstance(trivialWorkflow), status: 'running' };
  assert.throws(() => run(running), /status "running".*expected "created"/);
});

test('run throws for a completed instance', () => {
  const completed = run(createInstance(trivialWorkflow));
  assert.throws(() => run(completed), /status "completed".*expected "created"/);
});

test('run throws for a failed instance', () => {
  const failed = run(createInstance(trivialFailingWorkflow));
  assert.throws(() => run(failed), /status "failed".*expected "created"/);
});

test('run throws for a paused instance', () => {
  const paused = run(createInstance(trivialPausingWorkflow));
  assert.throws(() => run(paused), /status "paused".*expected "created"/);
});

test('run throws for a cancelled instance', () => {
  const cancelled = cancel(run(createInstance(trivialPausingWorkflow)));
  assert.throws(() => run(cancelled), /status "cancelled".*expected "created"/);
});

// --- Misuse leaves the input untouched and is not a Workflow failure --------

test('an invalid run does not mutate the input or mark it failed', () => {
  const completed = run(createInstance(trivialWorkflow));
  const before = { ...completed };

  assert.throws(() => run(completed));

  assert.strictEqual(completed.status, 'completed', 'status is untouched, not "failed"');
  assert.deepStrictEqual(completed, before, 'the input instance is unchanged');
});

test('an invalid run throws rather than returning a failed instance', () => {
  const paused = run(createInstance(trivialPausingWorkflow));
  let result;
  assert.throws(() => {
    result = run(paused);
  });
  assert.strictEqual(result, undefined, 'no instance is returned for an invalid run');
});

// --- resume()/cancel() remain usable on the paused instance run() rejects ----

test('run rejects a paused instance but resume/cancel still accept it', () => {
  const paused = run(createInstance(trivialPausingWorkflow));
  assert.throws(() => run(paused));
  // The guard does not disturb the paused instance: it can still be resumed...
  assert.strictEqual(resume(paused).status, 'completed');
  // ...or cancelled.
  assert.strictEqual(cancel(paused).status, 'cancelled');
});
