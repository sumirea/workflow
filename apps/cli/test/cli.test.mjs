// CLI surface checks for @sumirea/cli.
//
// The CLI is run as a subprocess (exactly as a user or CI would invoke it) and
// its exit code and output are asserted. This pins the command contract:
// `run-demo` completes (exit 0), `--json` emits deterministic structured output,
// and unknown/missing commands are a usage error (exit 2).
//
// Runs against the compiled binary, exactly as consumers execute it.

import test from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const CLI = fileURLToPath(new URL('../dist/index.js', import.meta.url));

function runCli(args) {
  return spawnSync(process.execPath, [CLI, ...args], { encoding: 'utf8' });
}

test('run-demo exits 0 and reports a completed workflow', () => {
  const result = runCli(['run-demo']);
  assert.strictEqual(result.status, 0);
  assert.match(result.stdout, /completed/);
});

test('run-demo --json emits valid JSON with the expected status and state', () => {
  const result = runCli(['run-demo', '--json']);
  assert.strictEqual(result.status, 0);

  const parsed = JSON.parse(result.stdout);
  assert.strictEqual(parsed.workflow, 'demo');
  assert.strictEqual(parsed.status, 'completed');
  assert.strictEqual(parsed.cursor, 2);
  assert.deepStrictEqual(parsed.state, { greeting: 'hello', prepared: true, finished: true });
});

test('an unknown command exits with code 2 and prints usage', () => {
  const result = runCli(['bogus']);
  assert.strictEqual(result.status, 2);
  assert.match(result.stderr, /Usage:/);
});

test('no command exits with code 2 and prints usage', () => {
  const result = runCli([]);
  assert.strictEqual(result.status, 2);
  assert.match(result.stderr, /Usage:/);
});
