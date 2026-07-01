// Checkpoint resume behaviour for @sumirea/core.
//
// The resume slice lets a paused instance continue from the Step after the one
// that paused. These checks prove resume starts at `cursor + 1`, reuses the
// paused state, consumes the active Checkpoint, never re-runs the pausing Step,
// and can go on to complete, fail, or pause again — all without the Runtime
// interpreting why a Checkpoint was requested.
//
// Runs against the compiled package output, exactly as consumers import it.

import test from 'node:test';
import assert from 'node:assert/strict';

import { createInstance, run, resume, pause, trivialPausingWorkflow } from '../dist/index.js';

test('a paused instance resumes and completes', () => {
  // trivial-pausing is [noop, pausing, noop]: it pauses at index 1.
  const paused = run(createInstance(trivialPausingWorkflow));
  assert.strictEqual(paused.status, 'paused');
  assert.strictEqual(paused.cursor, 1);

  const resumed = resume(paused);

  assert.strictEqual(resumed.status, 'completed');
  assert.strictEqual(resumed.cursor, trivialPausingWorkflow.steps.length);
  assert.strictEqual(resumed.checkpoint, undefined, 'the active Checkpoint is consumed');
});

test('resume starts at cursor + 1 and does not re-run the pausing Step', () => {
  // Each Step records that it ran. The pausing Step must appear exactly once —
  // during the first run, never again on resume.
  const ran = [];
  const record = (marker, fn) => ({
    name: marker,
    run: (state) => {
      ran.push(marker);
      return fn(state);
    },
  });
  const definition = {
    name: 'no-rerun',
    steps: [
      record('a', (s) => s),
      record('pause', (s) => pause({ name: 'review' }, s)),
      record('c', (s) => s),
    ],
  };

  const paused = run(createInstance(definition));
  assert.strictEqual(paused.status, 'paused');
  assert.deepStrictEqual(ran, ['a', 'pause'], 'first run reached the pausing Step');

  const resumed = resume(paused);

  assert.strictEqual(resumed.status, 'completed');
  assert.deepStrictEqual(
    ran,
    ['a', 'pause', 'c'],
    'resume ran only the Step after the pause; the pausing Step was not re-run',
  );
});

test('resume uses the paused Workflow State as its starting state', () => {
  const definition = {
    name: 'state-through-resume',
    initialState: { trail: [] },
    steps: [
      { name: 'a', run: (s) => ({ ...s, trail: [...s.trail, 'a'] }) },
      { name: 'pause', run: (s) => pause({ name: 'review' }, { ...s, trail: [...s.trail, 'p'] }) },
      { name: 'c', run: (s) => ({ ...s, trail: [...s.trail, 'c'] }) },
    ],
  };

  const paused = run(createInstance(definition));
  assert.deepStrictEqual(paused.state.trail, ['a', 'p'], 'state held at the pause');

  const resumed = resume(paused);

  assert.strictEqual(resumed.status, 'completed');
  assert.deepStrictEqual(
    resumed.state.trail,
    ['a', 'p', 'c'],
    'resumed Step built on the paused state, not the initial one',
  );
});

test('a resumed Step that throws fails the run', () => {
  const definition = {
    name: 'resume-then-fail',
    steps: [
      { name: 'pause', run: (s) => pause({ name: 'review' }, s) },
      {
        name: 'boom',
        run: () => {
          throw new Error('boom');
        },
      },
    ],
  };

  const paused = run(createInstance(definition));
  assert.strictEqual(paused.status, 'paused');
  assert.strictEqual(paused.cursor, 0);

  const resumed = resume(paused);

  assert.strictEqual(resumed.status, 'failed');
  assert.strictEqual(resumed.failure.stepIndex, 1);
  assert.strictEqual(resumed.checkpoint, undefined, 'the prior Checkpoint is cleared on failure');
});

test('a resumed run can pause again at a later Checkpoint', () => {
  const definition = {
    name: 'pause-twice',
    steps: [
      { name: 'pause-1', run: (s) => pause({ name: 'first' }, s) },
      { name: 'pause-2', run: (s) => pause({ name: 'second' }, s) },
      { name: 'done', run: (s) => s },
    ],
  };

  const firstPause = run(createInstance(definition));
  assert.strictEqual(firstPause.status, 'paused');
  assert.strictEqual(firstPause.cursor, 0);
  assert.strictEqual(firstPause.checkpoint.name, 'first');

  const secondPause = resume(firstPause);
  assert.strictEqual(secondPause.status, 'paused');
  assert.strictEqual(secondPause.cursor, 1, 'paused at the next Checkpoint');
  assert.strictEqual(secondPause.checkpoint.name, 'second', 'Checkpoint replaced, not merged');

  const done = resume(secondPause);
  assert.strictEqual(done.status, 'completed');
  assert.strictEqual(done.cursor, definition.steps.length);
});

test('the Runtime does not interpret why a resumed pause was requested', () => {
  // Two different Checkpoint payloads resume identically; the Runtime only
  // stops and records whatever it is handed.
  const make = (reason) => ({
    name: `reason-${reason}`,
    steps: [
      { name: 'p1', run: (s) => pause({ name: `p1-${reason}` }, s) },
      { name: 'p2', run: (s) => pause({ name: `p2-${reason}` }, s) },
    ],
  });

  const a = resume(run(createInstance(make('a'))));
  const b = resume(run(createInstance(make('b'))));

  assert.strictEqual(a.status, 'paused');
  assert.strictEqual(b.status, 'paused');
  assert.strictEqual(a.checkpoint.name, 'p2-a');
  assert.strictEqual(b.checkpoint.name, 'p2-b');
});

test('replacing the resumed Step needs no Runtime change', () => {
  // The same `resume` drives a workflow whose post-pause Step is swapped for a
  // completely different implementation; the Runtime is unchanged.
  const withSecondStep = (fn) => ({
    name: 'replaceable-resume',
    initialState: { value: 'seed' },
    steps: [
      { name: 'pause', run: (s) => pause({ name: 'review' }, s) },
      { name: 'second', run: fn },
    ],
  });

  const upper = resume(
    run(createInstance(withSecondStep((s) => ({ ...s, value: s.value.toUpperCase() })))),
  );
  const paused = resume(run(createInstance(withSecondStep((s) => pause({ name: 'again' }, s)))));

  assert.strictEqual(upper.status, 'completed');
  assert.strictEqual(upper.state.value, 'SEED');
  assert.strictEqual(paused.status, 'paused');
  assert.strictEqual(paused.checkpoint.name, 'again');
});
