// The @sumirea/journal primitive.
//
// The Journal is a pure consumer of @sumirea/core lifecycle events: injected as
// the Runtime's observer, it appends each event, by reference, to an in-memory
// list in insertion order and exposes that list read-only. These checks prove it
// records faithfully, transforms nothing, adds no metadata, cannot be mutated
// through `entries()`, and never alters the Runtime result.
//
// Runs against the compiled package output, exactly as consumers import it.

import test from 'node:test';
import assert from 'node:assert/strict';

import { createJournal } from '../dist/index.js';
import { createInstance, run, resume, pause } from '@sumirea/core';

test('1. a new Journal starts empty', () => {
  const journal = createJournal();
  assert.deepStrictEqual(journal.entries(), []);
});

test('2. calling the observer appends received events in order', () => {
  const journal = createJournal();
  const a = { type: 'run:started', instanceId: 'x', definitionName: 'd' };
  const b = { type: 'step:started', instanceId: 'x', index: 0, name: 's' };
  const c = { type: 'run:completed', instanceId: 'x', cursor: 1 };

  journal.observer(a);
  journal.observer(b);
  journal.observer(c);

  assert.deepStrictEqual(
    journal.entries().map((e) => e.type),
    ['run:started', 'step:started', 'run:completed'],
  );
});

test('3. entries() returns the events in insertion order', () => {
  const journal = createJournal();
  const events = [
    { type: 'step:started', index: 2 },
    { type: 'step:started', index: 0 },
    { type: 'step:started', index: 1 },
  ];
  for (const e of events) journal.observer(e);

  assert.deepStrictEqual(
    journal.entries().map((e) => e.index),
    [2, 0, 1],
    'insertion order, not sorted',
  );
});

test('4. events are stored by reference and not transformed', () => {
  const journal = createJournal();
  const event = { type: 'run:paused', instanceId: 'x', cursor: 1, checkpoint: { name: 'review' } };

  journal.observer(event);

  const stored = journal.entries()[0];
  assert.strictEqual(stored, event, 'the exact same object is stored, by reference');
  assert.strictEqual(stored.checkpoint, event.checkpoint, 'nested references are untouched');
  assert.deepStrictEqual(stored, event, 'the event is not wrapped or altered');
});

test('5. Journal does not add timestamp or generated id fields', () => {
  const journal = createJournal();
  const event = { type: 'run:started', instanceId: 'given-id', definitionName: 'd' };

  journal.observer(event);
  const stored = journal.entries()[0];

  assert.deepStrictEqual(
    Object.keys(stored).sort(),
    ['definitionName', 'instanceId', 'type'],
    'no extra keys were added',
  );
  assert.ok(!('timestamp' in stored) && !('time' in stored) && !('at' in stored));
  assert.ok(!('id' in stored) && !('seq' in stored) && !('order' in stored));
});

test('6. entries() does not allow external mutation of the internal list', () => {
  const journal = createJournal();
  journal.observer({ type: 'run:started', definitionName: 'd' });

  const snapshot = journal.entries();
  snapshot.push({ type: 'injected' });
  snapshot.length = 0; // try clearing it too

  assert.strictEqual(journal.entries().length, 1, 'the internal list is unaffected');
  assert.strictEqual(journal.entries()[0].type, 'run:started');
});

test('7. Journal records a successful run sequence when used as onEvent', () => {
  const journal = createJournal();
  const definition = {
    name: 'two-step',
    steps: [
      { name: 'a', run: (s) => ({ ...s, a: 1 }) },
      { name: 'b', run: (s) => ({ ...s, b: 1 }) },
    ],
  };

  const done = run(createInstance(definition, { onEvent: journal.observer }));

  assert.strictEqual(done.status, 'completed');
  assert.deepStrictEqual(
    journal.entries().map((e) => e.type),
    [
      'run:started',
      'step:started',
      'step:settled',
      'step:started',
      'step:settled',
      'run:completed',
    ],
  );
});

test('8. using the Journal as observer does not alter the Runtime result', () => {
  const definition = {
    name: 'compare',
    initialState: { n: 0 },
    steps: [
      { name: 'a', run: (s) => ({ ...s, n: s.n + 1 }) },
      { name: 'b', run: (s) => ({ ...s, n: s.n + 1 }) },
    ],
  };

  const without = run(createInstance(definition));
  const journal = createJournal();
  const withJournal = run(createInstance(definition, { onEvent: journal.observer }));

  assert.strictEqual(withJournal.status, without.status);
  assert.strictEqual(withJournal.cursor, without.cursor);
  assert.deepStrictEqual(withJournal.state, without.state);
  assert.ok(journal.entries().length > 0, 'the Journal still recorded events');
});

test('9. multiple runs routed to the same Journal append into one ordered sequence', () => {
  const journal = createJournal();
  const pausing = {
    name: 'pausing',
    steps: [
      { name: 'p', run: (s) => pause({ name: 'review' }, s) },
      { name: 'c', run: (s) => s },
    ],
  };
  const simple = { name: 'simple', steps: [{ name: 'only', run: (s) => s }] };

  const paused = run(createInstance(pausing, { onEvent: journal.observer }));
  resume(paused); // continues into the same Journal
  run(createInstance(simple, { onEvent: journal.observer }));

  const types = journal.entries().map((e) => e.type);
  assert.deepStrictEqual(types, [
    // first run: pauses at index 0
    'run:started',
    'step:started',
    'run:paused',
    // resume: runs the second step to completion
    'run:resumed',
    'step:started',
    'step:settled',
    'run:completed',
    // second, separate run
    'run:started',
    'step:started',
    'step:settled',
    'run:completed',
  ]);
});

test('10. instanceId is whatever Core emitted; the Journal does not interpret it', () => {
  const journal = createJournal();
  const definition = { name: 'idful', steps: [{ name: 'a', run: (s) => s }] };

  run(createInstance(definition, { id: 'run-77', onEvent: journal.observer }));

  const ids = new Set(journal.entries().map((e) => e.instanceId));
  assert.deepStrictEqual([...ids], ['run-77'], 'the caller-provided id is preserved verbatim');
});
