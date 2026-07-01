// `sumirea run <file>` surface checks for @sumirea/cli.
//
// The CLI is run as a subprocess against local workflow-file fixtures, and its
// exit code and output are asserted. This pins the `run <file>` contract: an ES
// module that default-exports a WorkflowDefinition is loaded and executed, and
// completed/failed/paused map to exit 0/1/3 while any load/validation problem is
// invalid input (exit 2).
//
// Runs against the compiled binary, exactly as consumers execute it.

import test from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const CLI = fileURLToPath(new URL('../dist/index.js', import.meta.url));
const fixture = (name) => fileURLToPath(new URL(`./fixtures/${name}`, import.meta.url));

function runCli(args) {
  return spawnSync(process.execPath, [CLI, ...args], { encoding: 'utf8' });
}

test('run <completing file> exits 0 and reports completed', () => {
  const result = runCli(['run', fixture('completing.mjs')]);
  assert.strictEqual(result.status, 0);
  assert.match(result.stdout, /completed/);
});

test('run <completing file> --json emits valid JSON with the expected status and state', () => {
  const result = runCli(['run', fixture('completing.mjs'), '--json']);
  assert.strictEqual(result.status, 0);

  const parsed = JSON.parse(result.stdout);
  assert.strictEqual(parsed.workflow, 'file-demo');
  assert.strictEqual(parsed.status, 'completed');
  assert.deepStrictEqual(parsed.state, { count: 0, one: true, two: true });
});

test('run <failing file> exits 1', () => {
  const result = runCli(['run', fixture('failing.mjs')]);
  assert.strictEqual(result.status, 1);
  assert.match(result.stdout, /failed/);
});

test('run <pausing file> exits 3', () => {
  const result = runCli(['run', fixture('pausing.mjs')]);
  assert.strictEqual(result.status, 3);
  assert.match(result.stdout, /paused/);
});

test('run with no file exits 2 and prints usage', () => {
  const result = runCli(['run']);
  assert.strictEqual(result.status, 2);
  assert.match(result.stderr, /requires a workflow file/);
});

test('run <missing file> exits 2', () => {
  const result = runCli(['run', fixture('does-not-exist.mjs')]);
  assert.strictEqual(result.status, 2);
  assert.match(result.stderr, /could not load/);
});

test('run <module without a default export> exits 2', () => {
  const result = runCli(['run', fixture('no-default.mjs')]);
  assert.strictEqual(result.status, 2);
  assert.match(result.stderr, /no default export/);
});

test('run <invalid WorkflowDefinition> exits 2', () => {
  const result = runCli(['run', fixture('invalid-definition.mjs')]);
  assert.strictEqual(result.status, 2);
  assert.match(result.stderr, /invalid workflow/);
});
