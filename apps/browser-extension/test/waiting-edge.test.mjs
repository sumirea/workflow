// test/waiting-edge.test.mjs
//
// The rising-edge state machine is the heart of the MVP: it decides when a
// notification fires. These tests pin its exact semantics so a false or
// duplicate fire can never regress in.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { loadWaitingEdge, loadSignals } from './_load.mjs';

const { createWaitingEdge } = loadWaitingEdge();
const { STATE } = loadSignals();

// Feed a sequence of states through a fresh machine; collect the fire decisions.
function run(seq) {
  const edge = createWaitingEdge({ states: STATE });
  return seq.map((s) => edge.next(s));
}

test('fires once on the rising edge from working into waiting', () => {
  assert.deepEqual(run([STATE.WORKING, STATE.WAITING]), [false, true]);
});

test('the very first observation being waiting fires (armed from the start)', () => {
  assert.deepEqual(run([STATE.WAITING]), [true]);
});

test('does not re-fire while it stays waiting', () => {
  assert.deepEqual(run([STATE.WAITING, STATE.WAITING, STATE.WAITING]), [true, false, false]);
});

test('re-arms after leaving waiting, then fires again on the next edge', () => {
  assert.deepEqual(run([STATE.WAITING, STATE.WORKING, STATE.WAITING]), [true, false, true]);
});

test('unsupported never fires', () => {
  assert.deepEqual(run([STATE.UNSUPPORTED, STATE.UNSUPPORTED]), [false, false]);
});

test('unsupported does not consume a pending edge (working, then unsure, then waiting -> fires)', () => {
  assert.deepEqual(run([STATE.WORKING, STATE.UNSUPPORTED, STATE.WAITING]), [false, false, true]);
});

test('unsupported does not re-arm (waiting, unsure, waiting -> only the first fires)', () => {
  assert.deepEqual(run([STATE.WAITING, STATE.UNSUPPORTED, STATE.WAITING]), [true, false, false]);
});

test('reset re-arms the machine', () => {
  const edge = createWaitingEdge({ states: STATE });
  assert.equal(edge.next(STATE.WAITING), true);
  assert.equal(edge.next(STATE.WAITING), false);
  edge.reset();
  assert.equal(edge.next(STATE.WAITING), true);
});

// --- presence gating: only notify once you are away ---

test('does not fire while you are present, even though Claude is waiting', () => {
  const edge = createWaitingEdge({ states: STATE });
  assert.equal(edge.next(STATE.WAITING, false), false);
  assert.equal(edge.next(STATE.WAITING, false), false);
});

test('fires the moment you walk away from a tab that is already waiting', () => {
  const edge = createWaitingEdge({ states: STATE });
  assert.equal(edge.next(STATE.WAITING, false), false); // present: quiet
  assert.equal(edge.next(STATE.WAITING, true), true); // walked away: fire
  assert.equal(edge.next(STATE.WAITING, true), false); // still waiting: quiet
});

test('fires on the edge if you were already away', () => {
  const edge = createWaitingEdge({ states: STATE });
  assert.equal(edge.next(STATE.WORKING, true), false);
  assert.equal(edge.next(STATE.WAITING, true), true);
});

test('coming back before it fired, then a new episode, still fires once when away', () => {
  const edge = createWaitingEdge({ states: STATE });
  assert.equal(edge.next(STATE.WAITING, false), false); // present, waiting
  assert.equal(edge.next(STATE.WORKING, false), false); // episode ends
  assert.equal(edge.next(STATE.WAITING, true), true); // new episode, away
});
