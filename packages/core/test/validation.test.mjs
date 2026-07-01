// Workflow Definition validation for @sumirea/core.
//
// createInstance() rejects a malformed WorkflowDefinition before any instance
// exists. This is Runtime API boundary validation — structural shape only. It is
// caller misuse, so it throws (a plain Error); it never produces a `failed`
// instance and never validates Step behaviour or opaque `initialState` contents.
//
// Runs against the compiled package output, exactly as consumers import it.

import test from 'node:test';
import assert from 'node:assert/strict';

import { createInstance } from '../dist/index.js';

const validStep = { name: 'noop', run: (state) => state };
const validDefinition = { name: 'valid', steps: [validStep] };

test('a valid definition creates a `created` instance', () => {
  const instance = createInstance(validDefinition);
  assert.strictEqual(instance.status, 'created');
  assert.strictEqual(instance.cursor, 0);
});

test('throws when `name` is missing, empty, or not a string', () => {
  assert.throws(() => createInstance({ steps: [validStep] }), /`name`/);
  assert.throws(() => createInstance({ name: '', steps: [validStep] }), /`name`/);
  assert.throws(() => createInstance({ name: 42, steps: [validStep] }), /`name`/);
});

test('throws when `steps` is not an array', () => {
  assert.throws(() => createInstance({ name: 'x', steps: 'nope' }), /`steps` must be an array/);
  assert.throws(() => createInstance({ name: 'x' }), /`steps` must be an array/);
});

test('throws when `steps` is empty', () => {
  assert.throws(() => createInstance({ name: 'x', steps: [] }), /`steps` must not be empty/);
});

test('throws when a Step is not an object', () => {
  assert.throws(() => createInstance({ name: 'x', steps: [null] }), /step 0 must be an object/);
  assert.throws(() => createInstance({ name: 'x', steps: ['nope'] }), /step 0 must be an object/);
});

test('throws when a Step has no callable `run`', () => {
  assert.throws(() => createInstance({ name: 'x', steps: [{ name: 'a' }] }), /step 0.*`run`/);
  assert.throws(
    () => createInstance({ name: 'x', steps: [{ name: 'a', run: 5 }] }),
    /step 0.*`run`/,
  );
});

test('throws when a Step has no non-empty string `name`', () => {
  assert.throws(() => createInstance({ name: 'x', steps: [{ run: () => {} }] }), /step 0.*`name`/);
  assert.throws(
    () => createInstance({ name: 'x', steps: [{ name: '', run: () => {} }] }),
    /step 0.*`name`/,
  );
});

test('Step-level errors report the offending index', () => {
  assert.throws(
    () => createInstance({ name: 'x', steps: [validStep, { name: 'bad', run: 5 }] }),
    /step 1.*`run`/,
  );
});

test('throws when `initialState` is present but not an object', () => {
  assert.throws(
    () => createInstance({ name: 'x', steps: [validStep], initialState: 5 }),
    /`initialState`/,
  );
});

test('duplicate Step names are accepted', () => {
  const definition = {
    name: 'dupes',
    steps: [
      { name: 'same', run: (state) => state },
      { name: 'same', run: (state) => state },
    ],
  };
  const instance = createInstance(definition);
  assert.strictEqual(instance.status, 'created');
});

test('opaque `initialState` contents are accepted', () => {
  const initialState = { nested: { a: [1, 2, 3] }, label: 'anything', count: 0 };
  const instance = createInstance({ name: 'x', steps: [validStep], initialState });
  assert.strictEqual(instance.status, 'created');
  assert.deepStrictEqual(instance.state, initialState);
});

test('an invalid definition is misuse: it throws and creates no instance', () => {
  let instance;
  assert.throws(() => {
    instance = createInstance({ name: 'x', steps: [] });
  });
  assert.strictEqual(instance, undefined, 'no instance is created for an invalid definition');
});
