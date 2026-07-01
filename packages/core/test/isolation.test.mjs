// Workflow Instance isolation checks for @sumirea/core.
//
// These prove the orchestration boundary's isolation guarantees without adding
// any new Runtime behaviour: a Workflow Definition is an immutable template, and
// every Instance created from it executes independently. Steps thread state
// purely (each returns the next state); the Runtime never mutates the Instance
// it is given nor the Definition it runs.
//
// Runs against the compiled package output, exactly as consumers import it.

import test from 'node:test';
import assert from 'node:assert/strict';

import { createInstance, run } from '../dist/index.js';

/**
 * A Definition whose Steps derive new state from the previous state, so that a
 * run is observable (a counter advances) while the Steps stay pure. Rebuilt per
 * test so one test can never leak into another.
 */
function countingWorkflow() {
  const increment = (name) => ({
    name,
    run: (state) => ({ ...state, count: state.count + 1 }),
  });
  return {
    name: 'counting',
    initialState: { count: 0 },
    steps: [increment('first'), increment('second')],
  };
}

test('multiple Instances can be created from the same Definition', () => {
  const definition = countingWorkflow();
  const a = createInstance(definition);
  const b = createInstance(definition);

  assert.notStrictEqual(a, b, 'each Instance is a distinct object');
  assert.strictEqual(a.definition, definition, 'Instance references the Definition');
  assert.strictEqual(b.definition, definition, 'both Instances share one Definition');
  assert.strictEqual(a.status, 'created');
  assert.strictEqual(b.status, 'created');
});

test('running one Instance does not affect another Instance', () => {
  const definition = countingWorkflow();
  const a = createInstance(definition);
  const b = createInstance(definition);

  const ranA = run(a);

  // The completed run advanced its own state...
  assert.strictEqual(ranA.status, 'completed');
  assert.strictEqual(ranA.state.count, 2);

  // ...while the original Instance and the untouched sibling stay at the start.
  assert.strictEqual(a.status, 'created', 'run() does not mutate its argument');
  assert.strictEqual(a.state.count, 0);
  assert.strictEqual(b.status, 'created', 'a sibling Instance is unaffected');
  assert.strictEqual(b.state.count, 0);
});

test('each Instance maintains independent Workflow State', () => {
  const definition = countingWorkflow();
  const ranA = run(createInstance(definition));
  const ranB = run(createInstance(definition));

  assert.strictEqual(ranA.state.count, 2);
  assert.strictEqual(ranB.state.count, 2);
  assert.notStrictEqual(ranA.state, ranB.state, 'results hold separate state objects');

  // Mutating one result's state cannot reach through to the other.
  ranA.state.count = 999;
  assert.strictEqual(ranB.state.count, 2);
});

test('running an Instance does not mutate the Workflow Definition', () => {
  const definition = countingWorkflow();
  const stepsRef = definition.steps;
  const initialStateRef = definition.initialState;

  run(createInstance(definition));
  run(createInstance(definition));

  assert.strictEqual(definition.name, 'counting');
  assert.strictEqual(definition.steps, stepsRef, 'steps array is unchanged');
  assert.strictEqual(definition.steps.length, 2);
  assert.strictEqual(definition.initialState, initialStateRef, 'initial state is unchanged');
  assert.strictEqual(definition.initialState.count, 0, 'initial state value is unchanged');
});

test('isolation holds on the failure path', () => {
  // A Definition whose middle Step throws: the failed run stops, and neither the
  // Definition nor a sibling Instance is disturbed.
  const definition = {
    name: 'counting-with-failure',
    initialState: { count: 0 },
    steps: [
      { name: 'first', run: (state) => ({ ...state, count: state.count + 1 }) },
      {
        name: 'boom',
        run: () => {
          throw new Error('step "boom" failed');
        },
      },
      { name: 'third', run: (state) => ({ ...state, count: state.count + 1 }) },
    ],
  };
  const initialStateRef = definition.initialState;

  const a = createInstance(definition);
  const b = createInstance(definition);
  const ranA = run(a);

  assert.strictEqual(ranA.status, 'failed');
  assert.strictEqual(ranA.failure.stepIndex, 1);
  assert.strictEqual(ranA.state.count, 1, 'last successfully produced state is preserved');

  assert.strictEqual(b.status, 'created', 'a sibling Instance is unaffected by the failure');
  assert.strictEqual(b.state.count, 0);
  assert.strictEqual(definition.initialState, initialStateRef, 'Definition is unchanged');
  assert.strictEqual(definition.initialState.count, 0);
});
