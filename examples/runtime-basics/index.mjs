// A runnable tour of the @sumirea/core Runtime API.
//
// Run it with (from the repo root):
//   pnpm --filter @sumirea/example-runtime-basics start
//
// It imports only the public `@sumirea/core` surface and walks the whole
// lifecycle: run to completion, pause at a Checkpoint, resume, cancel, and a
// Step failure. The lightweight assertions double as a smoke check — the script
// exits non-zero if the Runtime ever behaves unexpectedly.

import assert from 'node:assert/strict';

import { createInstance, run, resume, cancel, pause } from '@sumirea/core';

// 1) Run a Workflow to completion. Each Step returns the next state; the Runtime
//    threads it through and terminates as `completed`.
const onboarding = {
  name: 'onboarding',
  steps: [
    { name: 'create-account', run: (state) => ({ ...state, account: true }) },
    { name: 'send-welcome', run: (state) => ({ ...state, welcomed: true }) },
  ],
};
const done = run(createInstance(onboarding));
console.log(`completed → status=${done.status} cursor=${done.cursor}`, done.state);
assert.equal(done.status, 'completed');

// 2) Pause at a Checkpoint. A Step returns `pause(checkpoint, state)`; the
//    Runtime stops at that Step and records the opaque Checkpoint.
const withReview = {
  name: 'with-review',
  steps: [
    { name: 'draft', run: (state) => ({ ...state, draft: true }) },
    { name: 'review', run: (state) => pause({ name: 'needs-approval' }, state) },
    { name: 'publish', run: (state) => ({ ...state, published: true }) },
  ],
};
const paused = run(createInstance(withReview));
console.log(`paused → status=${paused.status} cursor=${paused.cursor} checkpoint=${paused.checkpoint?.name}`);
assert.equal(paused.status, 'paused');

// 3) Resume the paused Workflow from the Step after the pause (cursor + 1).
const resumed = resume(paused);
console.log(`resumed → status=${resumed.status}`, resumed.state);
assert.equal(resumed.status, 'completed');

// 4) Or cancel the same paused Workflow instead of resuming. Cancellation keeps
//    the paused state and clears the Checkpoint; it is not a failure.
const cancelled = cancel(paused);
console.log(`cancelled → status=${cancelled.status}`, cancelled.state);
assert.equal(cancelled.status, 'cancelled');

// 5) Handle a Step failure. A Step signals failure by throwing; the Runtime
//    stops, keeps the last successful state, and records where it failed.
const risky = {
  name: 'risky',
  steps: [
    { name: 'prepare', run: (state) => ({ ...state, prepared: true }) },
    {
      name: 'commit',
      run: () => {
        throw new Error('commit failed');
      },
    },
    { name: 'notify', run: (state) => state },
  ],
};
const failed = run(createInstance(risky));
console.log(`failed → status=${failed.status} cursor=${failed.cursor} error=${failed.failure?.error?.message}`);
assert.equal(failed.status, 'failed');

console.log('\nAll @sumirea/core Runtime API examples ran as expected.');
