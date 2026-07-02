// Runtime lifecycle events for @sumirea/core.
//
// The lifecycle-events slice adds a single optional, synchronous observer
// (`createInstance(definition, { onEvent })`) that the Runtime calls at each
// orchestration transition: run/step start, pause, resume, completion, failure,
// cancellation. These checks prove the event sequences, that payloads carry only
// positional/opaque data (never Workflow State contents), that the observer is
// opt-in and never alters orchestration, and that illegal guard failures emit
// nothing — while the Step contract is unchanged.
//
// Runs against the compiled package output, exactly as consumers import it.

import test from 'node:test';
import assert from 'node:assert/strict';

import { createInstance, run, resume, cancel, pause } from '../dist/index.js';

// A small helper: collect emitted events into an array, returning both.
const recorder = () => {
  const events = [];
  return { events, onEvent: (event) => events.push(event) };
};
const types = (events) => events.map((e) => e.type);

test('1. a successful run emits started, per-step boundaries, and completed in order', () => {
  const { events, onEvent } = recorder();
  const definition = {
    name: 'two-step',
    steps: [
      { name: 'a', run: (s) => ({ ...s, a: 1 }) },
      { name: 'b', run: (s) => ({ ...s, b: 1 }) },
    ],
  };

  const done = run(createInstance(definition, { onEvent }));

  assert.strictEqual(done.status, 'completed');
  assert.deepStrictEqual(types(events), [
    'run:started',
    'step:started',
    'step:settled',
    'step:started',
    'step:settled',
    'run:completed',
  ]);
  assert.deepStrictEqual(
    events.filter((e) => e.type.startsWith('step:')).map((e) => [e.type, e.index, e.name]),
    [
      ['step:started', 0, 'a'],
      ['step:settled', 0, 'a'],
      ['step:started', 1, 'b'],
      ['step:settled', 1, 'b'],
    ],
  );
  assert.strictEqual(events.at(0).definitionName, 'two-step');
  assert.strictEqual(events.at(-1).cursor, 2);
});

test('2. a checkpoint pause emits run:paused and no settled/started past the pause', () => {
  const { events, onEvent } = recorder();
  const definition = {
    name: 'pausing',
    steps: [
      { name: 'a', run: (s) => s },
      { name: 'p', run: (s) => pause({ name: 'review' }, s) },
      { name: 'c', run: (s) => s },
    ],
  };

  const paused = run(createInstance(definition, { onEvent }));

  assert.strictEqual(paused.status, 'paused');
  assert.deepStrictEqual(types(events), [
    'run:started',
    'step:started', // a
    'step:settled', // a
    'step:started', // p
    'run:paused',
  ]);
  const pausedEvent = events.at(-1);
  assert.strictEqual(pausedEvent.cursor, 1);
  assert.strictEqual(pausedEvent.checkpoint.name, 'review', 'checkpoint carried by reference');
});

test('3. resuming a paused run emits run:resumed and continues to completion', () => {
  const { events, onEvent } = recorder();
  const definition = {
    name: 'resume-me',
    steps: [
      { name: 'p', run: (s) => pause({ name: 'review' }, s) },
      { name: 'c', run: (s) => ({ ...s, c: 1 }) },
    ],
  };

  const paused = run(createInstance(definition, { onEvent }));
  events.length = 0; // focus on the resume phase only

  const resumed = resume(paused);

  assert.strictEqual(resumed.status, 'completed');
  assert.deepStrictEqual(types(events), [
    'run:resumed',
    'step:started', // c
    'step:settled', // c
    'run:completed',
  ]);
  assert.strictEqual(events.at(0).fromCursor, 1, 'resume begins at cursor + 1');
});

test('4. cancelling a paused run emits run:cancelled', () => {
  const { events, onEvent } = recorder();
  const definition = {
    name: 'cancel-me',
    steps: [{ name: 'p', run: (s) => pause({ name: 'review' }, s) }],
  };

  const paused = run(createInstance(definition, { onEvent }));
  events.length = 0;

  const cancelled = cancel(paused);

  assert.strictEqual(cancelled.status, 'cancelled');
  assert.deepStrictEqual(types(events), ['run:cancelled']);
  assert.strictEqual(events.at(0).cursor, 0);
});

test('5. a throwing Step emits run:failed with the failure by reference', () => {
  const { events, onEvent } = recorder();
  const boom = new Error('boom');
  const definition = {
    name: 'failing',
    steps: [
      { name: 'a', run: (s) => s },
      {
        name: 'b',
        run: () => {
          throw boom;
        },
      },
    ],
  };

  const failed = run(createInstance(definition, { onEvent }));

  assert.strictEqual(failed.status, 'failed');
  assert.deepStrictEqual(types(events), [
    'run:started',
    'step:started', // a
    'step:settled', // a
    'step:started', // b
    'run:failed',
  ]);
  const failedEvent = events.at(-1);
  assert.strictEqual(failedEvent.cursor, 1);
  assert.strictEqual(failedEvent.failure.stepIndex, 1);
  assert.strictEqual(failedEvent.failure.error, boom, 'the raw error is carried by reference');
});

test('6. payloads include the caller-provided instanceId when supplied', () => {
  const { events, onEvent } = recorder();
  const definition = {
    name: 'with-id',
    steps: [{ name: 'a', run: (s) => s }],
  };

  run(createInstance(definition, { id: 'run-42', onEvent }));

  assert.ok(events.length > 0);
  for (const event of events) {
    assert.strictEqual(event.instanceId, 'run-42', `${event.type} carries the instanceId`);
  }
});

test('6b. instanceId is undefined in payloads when no id was provided', () => {
  const { events, onEvent } = recorder();
  const definition = { name: 'no-id', steps: [{ name: 'a', run: (s) => s }] };

  run(createInstance(definition, { onEvent }));

  for (const event of events) {
    assert.strictEqual(event.instanceId, undefined);
  }
});

test('7. event payloads never expose Workflow State contents', () => {
  const { events, onEvent } = recorder();
  const SECRET = 'do-not-leak-9d3f';
  const definition = {
    name: 'statey',
    initialState: { secret: SECRET },
    steps: [
      { name: 'a', run: (s) => ({ ...s, more: SECRET }) },
      { name: 'p', run: (s) => pause({ name: 'review' }, s) },
    ],
  };

  const paused = run(createInstance(definition, { onEvent }));
  resume(paused); // also exercise the resumed phase

  // No event object carries a `state` field...
  for (const event of events) {
    assert.ok(!('state' in event), `${event.type} must not include state`);
  }
  // ...and the secret value never appears anywhere in the serialized events.
  const serialized = JSON.stringify(events);
  assert.ok(!serialized.includes(SECRET), 'no state contents leak into events');
});

test('8. Step.run still receives exactly one argument (the state)', () => {
  const calls = [];
  const definition = {
    name: 'one-arg',
    initialState: { seed: true },
    steps: [
      {
        name: 'inspect',
        run: (...args) => {
          calls.push(args);
          return args[0];
        },
      },
    ],
  };

  run(createInstance(definition, { id: 'x', onEvent: () => {} }));

  assert.strictEqual(calls.length, 1);
  assert.strictEqual(calls[0].length, 1, 'the Step was called with exactly one argument');
  assert.deepStrictEqual(calls[0][0], { seed: true });
});

test('9. with no observer, behaviour is unchanged and nothing is emitted', () => {
  const definition = {
    name: 'no-observer',
    initialState: { n: 0 },
    steps: [
      { name: 'a', run: (s) => ({ ...s, n: s.n + 1 }) },
      { name: 'b', run: (s) => ({ ...s, n: s.n + 1 }) },
    ],
  };

  // No throw, correct terminal state — identical to pre-events behaviour.
  const done = run(createInstance(definition));
  assert.strictEqual(done.status, 'completed');
  assert.deepStrictEqual(done.state, { n: 2 });
  assert.strictEqual(done.cursor, 2);
  assert.strictEqual(done.onEvent, undefined);
});

test('10. illegal guard failures emit no events', () => {
  const definition = { name: 'guarded', steps: [{ name: 'a', run: (s) => s }] };

  // resume / cancel require a paused instance; a created one is caller misuse.
  const createdA = createInstance(definition, { onEvent: () => assert.fail('emitted on guard') });
  assert.throws(() => resume(createdA), /expected "paused"/);

  const createdB = createInstance(definition, { onEvent: () => assert.fail('emitted on guard') });
  assert.throws(() => cancel(createdB), /expected "paused"/);

  // run requires a `created` instance; a completed one is caller misuse.
  const completed = run(createInstance(definition));
  const completedWithObserver = { ...completed, onEvent: () => assert.fail('emitted on guard') };
  assert.throws(() => run(completedWithObserver), /expected "created"/);
});

test('11. a throwing observer does not change the Runtime outcome', () => {
  const definition = {
    name: 'observer-throws',
    initialState: { n: 0 },
    steps: [
      { name: 'a', run: (s) => ({ ...s, n: s.n + 1 }) },
      { name: 'b', run: (s) => ({ ...s, n: s.n + 1 }) },
    ],
  };

  const done = run(
    createInstance(definition, {
      onEvent: () => {
        throw new Error('observer blew up');
      },
    }),
  );

  // Orchestration completes exactly as if the observer had not thrown.
  assert.strictEqual(done.status, 'completed');
  assert.deepStrictEqual(done.state, { n: 2 });
  assert.strictEqual(done.cursor, 2);
});
