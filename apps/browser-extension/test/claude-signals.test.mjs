// test/claude-signals.test.mjs
//
// The signals adapter is the only place that reads the page. Two things must
// hold no matter what: the documented test hook works (so the pipeline is
// provable end-to-end today), and real detection stays fail-safe (UNSUPPORTED)
// until verified selectors land in M1; it must never invent a WAITING.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { loadSignals } from './_load.mjs';

const { STATE, TEST_ATTR, getState } = loadSignals();

// Minimal fake document: only what getState touches.
function fakeDoc(forcedAttr) {
  return {
    documentElement: {
      getAttribute: (name) => (name === TEST_ATTR ? forcedAttr : null),
    },
  };
}

test('exposes the three canonical states', () => {
  assert.deepEqual(
    { ...STATE },
    { WAITING: 'waiting', WORKING: 'working', UNSUPPORTED: 'unsupported' },
  );
});

test('missing documentElement is unsupported (fail safe)', () => {
  assert.equal(getState({}), STATE.UNSUPPORTED);
  assert.equal(getState(null), STATE.UNSUPPORTED);
  assert.equal(getState(undefined), STATE.UNSUPPORTED);
});

test('the test hook forces each state', () => {
  assert.equal(getState(fakeDoc('waiting')), STATE.WAITING);
  assert.equal(getState(fakeDoc('working')), STATE.WORKING);
  assert.equal(getState(fakeDoc('unsupported')), STATE.UNSUPPORTED);
});

test('an unrecognised forced value is ignored, not trusted', () => {
  assert.equal(getState(fakeDoc('definitely-not-a-state')), STATE.UNSUPPORTED);
});

test('with no test hook, real detection is fail-safe until M1 (never a false waiting)', () => {
  assert.equal(getState(fakeDoc(null)), STATE.UNSUPPORTED);
});
