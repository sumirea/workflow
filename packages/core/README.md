# @sumirea/core

The **workflow engine** — this is the product.

`core` holds the domain model, step execution, and orchestration that define
what a Sumirea workflow _is_ and how it runs. It is deliberately **pure** and
**surface-agnostic**: no network, no filesystem, no direct clock or randomness.
Anything external (a model call, a repository read) arrives through a **port** —
a narrow interface that `core` defines and an adapter implements.

This is what makes the same workflow behave identically in the extension, the
CLI, and any future surface.

**Depends on:** `@sumirea/schema` · **Must not import:** `@sumirea/adapters`
(adapters are injected, never referenced).

---

## Runtime API

The Runtime **orchestrates only**. It creates an instance, runs its Steps in
order, threads state from one to the next, and terminates — or pauses, resumes,
and cancels at a Checkpoint. It never inspects what a Step does or what a
Checkpoint means.

Everything below is implemented today. Import it from `@sumirea/core`
(`pause` and the contract types are re-exported from `@sumirea/schema`):

```ts
import {
  createInstance,
  run,
  resume,
  cancel,
  pause,
  type WorkflowDefinition,
  type WorkflowInstance,
  type WorkflowStatus,
  type Step,
  type StepOutcome,
  type Checkpoint,
} from '@sumirea/core';
```

### Functions

| Function                     | Returns            | Description                                                                                      |
| ---------------------------- | ------------------ | ------------------------------------------------------------------------------------------------ |
| `createInstance(definition)` | `WorkflowInstance` | A fresh instance with status `created`, `cursor` `0`, and state `definition.initialState ?? {}`. |
| `run(instance)`              | `WorkflowInstance` | Run from the first Step until the run completes, fails, or pauses.                               |
| `resume(instance)`           | `WorkflowInstance` | Continue a `paused` instance from the Step after the pause (`cursor + 1`).                       |
| `cancel(instance)`           | `WorkflowInstance` | Terminate a `paused` instance as `cancelled` without running any further Step.                   |
| `pause(checkpoint, state)`   | `StepOutcome`      | Built by a Step to request a pause: the state to hold and the Checkpoint to stop at.             |

`createInstance(definition)` throws if the definition is malformed — a missing or
empty `name`, `steps` that is not a non-empty array, a Step missing a callable
`run` or a non-empty string `name`, or a non-object `initialState`. This is
caller misuse (a plain `Error`), not a Workflow failure; no instance is created.
It validates structure only — Step behaviour and `initialState` contents stay
opaque, and duplicate Step names are allowed.

`run(instance)` accepts **only** a `created` instance; `resume(instance)` and
`cancel(instance)` accept **only** a `paused` instance. Called with any other
status they throw — this is caller misuse, not a Step or Workflow failure, and
the input instance is left untouched. (Use `resume` to continue a paused run,
not `run`.)

### Types

**`WorkflowDefinition`** — the workflow to run.

```ts
interface WorkflowDefinition {
  readonly name: string;
  readonly steps: readonly Step[];
  readonly initialState?: WorkflowState; // defaults to {}
}
```

**`Step`** — a black box. Given the current state, it returns a `StepOutcome`.

```ts
interface Step {
  readonly name: string; // human-readable; not interpreted by the Runtime
  run(state: WorkflowState): StepOutcome;
}
```

**`StepOutcome`** — the two outcomes the Runtime understands:

```ts
type StepOutcome = WorkflowState | StepPause;
```

- Return the **next `WorkflowState`** → the Runtime continues to the next Step.
- Return **`pause(checkpoint, state)`** → the Runtime stops at the Checkpoint.

`WorkflowState` is `Readonly<Record<string, unknown>>` — opaque data the Runtime
threads through but never inspects.

**`Checkpoint`** — an opaque pause marker; the Runtime records it but never reads
its meaning.

```ts
interface Checkpoint {
  readonly name?: string; // optional label; not interpreted by the Runtime
}
```

**`WorkflowInstance`** — one execution of a definition.

```ts
interface WorkflowInstance {
  readonly definition: WorkflowDefinition;
  readonly status: WorkflowStatus;
  readonly state: WorkflowState;
  readonly cursor: number;
  readonly failure?: WorkflowFailure; // present only when status is `failed`
  readonly checkpoint?: Checkpoint; // present only when status is `paused`
}

interface WorkflowFailure {
  readonly stepIndex: number; // which Step threw
  readonly error: unknown; // the raw thrown value, kept opaque
}
```

**`WorkflowStatus`** — the lifecycle:

```ts
type WorkflowStatus = 'created' | 'running' | 'paused' | 'completed' | 'failed' | 'cancelled';
```

`created` → `running` while Steps execute → then one of `completed`, `failed`,
or `paused`. A `paused` instance can `resume` (back to `running`) or `cancel`
(to `cancelled`).

---

## Examples

### Define a Workflow

```ts
const onboarding: WorkflowDefinition = {
  name: 'onboarding',
  initialState: {},
  steps: [
    { name: 'create-account', run: (state) => ({ ...state, account: true }) },
    { name: 'send-welcome', run: (state) => ({ ...state, welcomed: true }) },
  ],
};
```

### Run to completion

```ts
const done = run(createInstance(onboarding));

done.status; // 'completed'
done.cursor; // 2  (number of Steps)
done.state; // { account: true, welcomed: true }
```

### Pause at a Checkpoint

A Step requests a pause by returning `pause(checkpoint, state)`:

```ts
const withReview: WorkflowDefinition = {
  name: 'with-review',
  steps: [
    { name: 'draft', run: (state) => ({ ...state, draft: true }) },
    { name: 'review', run: (state) => pause({ name: 'needs-approval' }, state) },
    { name: 'publish', run: (state) => ({ ...state, published: true }) },
  ],
};

const paused = run(createInstance(withReview));

paused.status; // 'paused'
paused.cursor; // 1  (the pausing Step's index)
paused.checkpoint; // { name: 'needs-approval' }
// 'publish' has not run.
```

### Resume a paused Workflow

```ts
const resumed = resume(paused); // continues at cursor + 1 ('publish')

resumed.status; // 'completed'
resumed.checkpoint; // undefined  (the Checkpoint is consumed)
resumed.state; // { draft: true, published: true }
```

The pausing Step (`review`) is **not** re-run. A resumed run may complete, fail,
or pause again at a later Checkpoint.

### Cancel a paused Workflow

```ts
const cancelled = cancel(paused);

cancelled.status; // 'cancelled'
cancelled.state; // { draft: true }  (the paused state is preserved)
cancelled.checkpoint; // undefined  (the Checkpoint is cleared)
// No Step runs; this is not a failure.
```

### Handle a Step failure

A Step signals failure by throwing. The Runtime stops, keeps the last successful
state, and records where it failed — without interpreting the error.

```ts
const risky: WorkflowDefinition = {
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

failed.status; // 'failed'
failed.cursor; // 1  (the failing Step's index)
failed.failure; // { stepIndex: 1, error: Error('commit failed') }
failed.state; // { prepared: true }  (last successful state)
// 'notify' has not run.
```

Calling `resume` or `cancel` on this `failed` instance throws — they accept only
`paused` instances.

---

## Cursor semantics

`cursor` records position, by status:

| Status      | `cursor`                                                      |
| ----------- | ------------------------------------------------------------- |
| `created`   | `0`                                                           |
| `completed` | the number of Steps                                           |
| `failed`    | the failing Step's index                                      |
| `paused`    | the pausing Step's index                                      |
| `cancelled` | the pausing Step's index (unchanged from the paused instance) |

`resume` continues at `cursor + 1`, so the pausing Step is never re-run.

---

## Runtime boundary

- The Runtime **orchestrates only** — it runs Steps in order and threads state.
- **Steps are black boxes.** The Runtime calls `run`, reads the generic outcome
  (next state or pause), and nothing more.
- It does **not** inspect business logic, what a Step means, why it failed, or
  why a Checkpoint was requested. `WorkflowState`, the thrown `error`, and the
  `Checkpoint` are all opaque to it.
- `resume()` and `cancel()` enforce their own API contract: they accept only
  `paused` instances and throw for any other status.
