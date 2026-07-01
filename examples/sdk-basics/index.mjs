// A runnable tour of the Runtime lifecycle through the @sumirea/sdk facade.
//
// Run it with (from the repo root):
//   pnpm --filter @sumirea/example-sdk-basics start
//
// It imports ONLY from `@sumirea/sdk` — a consumer never reaches past the facade
// into `@sumirea/core`. Otherwise it mirrors the runtime-basics tour: run to
// completion, pause at a Checkpoint, resume, cancel, and a Step failure. The
// lightweight assertions double as a smoke check.

import assert from 'node:assert/strict';

import { createInstance, run, resume, cancel, pause } from '@sumirea/sdk';

// 1) Run a Workflow to completion.
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

// 2) Pause at a Checkpoint.
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

// 3) Resume the paused Workflow from the Step after the pause.
const resumed = resume(paused);
console.log(`resumed → status=${resumed.status}`, resumed.state);
assert.equal(resumed.status, 'completed');

// 4) Or cancel the same paused Workflow instead of resuming.
const cancelled = cancel(paused);
console.log(`cancelled → status=${cancelled.status}`, cancelled.state);
assert.equal(cancelled.status, 'cancelled');

// 5) Handle a Step failure.
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

console.log('\nAll @sumirea/sdk Runtime lifecycle examples ran as expected.');
