// Runtime status transition invariants for @sumirea/core.
//
// The per-feature suites exercise each behaviour in depth; this file pins the
// accepted STATE MACHINE as a whole — every status transition and the cursor
// value at each status — so a future slice cannot drift the lifecycle without a
// test turning red. It uses only the public @sumirea/core API.
//
// Runs against the compiled package output, exactly as consumers import it.

import test from 'node:test';
import assert from 'node:assert/strict';

import { createInstance, run, resume, cancel, pause } from '../dist/index.js';

// --- Step builders -----------------------------------------------------------
const noop = (name) => ({ name, run: (state) => state });
const boom = (name) => ({
  name,
  run: () => {
    throw new Error(`${name} failed`);
  },
});
const pausing = (name) => ({ name, run: (state) => pause({ name: `${name}-cp` }, state) });

const def = (name, steps) => ({ name, steps });

// --- Status transitions ------------------------------------------------------

test('createInstance() produces `created`', () => {
  assert.strictEqual(createInstance(def('d', [noop('a')])).status, 'created');
});

test('run(created) can terminate as `completed`', () => {
  assert.strictEqual(run(createInstance(def('d', [noop('a'), noop('b')]))).status, 'completed');
});

test('run(created) can terminate as `failed`', () => {
  assert.strictEqual(run(createInstance(def('d', [noop('a'), boom('b')]))).status, 'failed');
});

test('run(created) can terminate as `paused`', () => {
  assert.strictEqual(run(createInstance(def('d', [noop('a'), pausing('b')]))).status, 'paused');
});

test('resume(paused) can terminate as `completed`', () => {
  const paused = run(createInstance(def('d', [pausing('a'), noop('b')])));
  assert.strictEqual(paused.status, 'paused');
  assert.strictEqual(resume(paused).status, 'completed');
});

test('resume(paused) can terminate as `failed`', () => {
  const paused = run(createInstance(def('d', [pausing('a'), boom('b')])));
  assert.strictEqual(resume(paused).status, 'failed');
});

test('resume(paused) can terminate as `paused` again', () => {
  const paused = run(createInstance(def('d', [pausing('a'), pausing('b'), noop('c')])));
  assert.strictEqual(resume(paused).status, 'paused');
});

test('cancel(paused) terminates as `cancelled`', () => {
  const paused = run(createInstance(def('d', [pausing('a'), noop('b')])));
  assert.strictEqual(cancel(paused).status, 'cancelled');
});

test('resume/cancel throw for non-paused instances without changing status', () => {
  // Every status the public API can produce, plus a hand-built `running`
  // (transient inside the Runtime, never returned).
  const created = createInstance(def('d', [noop('a')]));
  const running = { ...created, status: 'running' };
  const completed = run(createInstance(def('d', [noop('a')])));
  const failed = run(createInstance(def('d', [boom('a')])));
  const cancelled = cancel(run(createInstance(def('d', [pausing('a')]))));

  for (const instance of [created, running, completed, failed, cancelled]) {
    const before = instance.status;
    assert.throws(() => resume(instance), /expected "paused"/);
    assert.throws(() => cancel(instance), /expected "paused"/);
    assert.strictEqual(instance.status, before, `${before} must be unchanged after misuse`);
  }
});

test('an invalid definition throws before any instance exists', () => {
  let instance;
  assert.throws(() => {
    instance = createInstance(def('d', []));
  });
  assert.strictEqual(instance, undefined);
});

// --- Cursor semantics --------------------------------------------------------

test('cursor is 0 for a `created` instance', () => {
  assert.strictEqual(createInstance(def('d', [noop('a'), noop('b'), noop('c')])).cursor, 0);
});

test('cursor is the number of Steps when `completed`', () => {
  const steps = [noop('a'), noop('b'), noop('c')];
  assert.strictEqual(run(createInstance(def('d', steps))).cursor, steps.length);
});

test('cursor is the failing Step index when `failed`', () => {
  const failed = run(createInstance(def('d', [noop('a'), boom('b'), noop('c')])));
  assert.strictEqual(failed.cursor, 1);
});

test('cursor is the pausing Step index when `paused`', () => {
  const paused = run(createInstance(def('d', [noop('a'), pausing('b'), noop('c')])));
  assert.strictEqual(paused.cursor, 1);
});

test('cursor is unchanged from the paused instance when `cancelled`', () => {
  const paused = run(createInstance(def('d', [noop('a'), pausing('b'), noop('c')])));
  const cancelled = cancel(paused);
  assert.strictEqual(cancelled.cursor, paused.cursor);
  assert.strictEqual(cancelled.cursor, 1);
});

test('resume(paused) continues from cursor + 1', () => {
  // A pre-pause Step increments a counter; if resume restarted at the pause (or
  // earlier) the counter would advance again. It must not.
  let preCount = 0;
  const definition = def('d', [
    { name: 'pre', run: (state) => ({ ...state, pre: (preCount += 1) }) },
    pausing('gate'),
    noop('after'),
  ]);
  const paused = run(createInstance(definition));
  assert.strictEqual(paused.cursor, 1);
  assert.strictEqual(preCount, 1);

  const resumed = resume(paused);
  assert.strictEqual(resumed.status, 'completed');
  assert.strictEqual(resumed.cursor, definition.steps.length);
  assert.strictEqual(preCount, 1, 'the pre-pause Step was not re-run; resume began at cursor + 1');
});
