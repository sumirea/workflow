# @sumirea/sdk

The **public, stable API** — the single entry point apps, surfaces, and
embedders import from.

Surfaces (`apps/*`) depend on the `sdk` and **never reach past it** into
`@sumirea/core`. When the API here is stable, the engine underneath can evolve
freely.

## What it is today

A thin, curated **facade** over `@sumirea/core`. It re-exports the
developer-facing Runtime surface **unchanged** — it does not wrap the lifecycle
functions, add behaviour, or change any Runtime semantics. It withholds Core's
internal and demonstration-only exports (the `trivial*` workflows), so the public
surface is exactly what a consumer needs and nothing more.

### Exported surface

Runtime functions (re-exported from `@sumirea/core`):

- `createInstance` · `run` · `resume` · `cancel` · `pause` · `isStepPause`

Contract types:

- `WorkflowDefinition` · `Step` · `StepOutcome` · `StepPause` · `Checkpoint` ·
  `WorkflowState` · `WorkflowInstance` · `WorkflowStatus` · `WorkflowFailure`

Behaviour and documentation for these live in
[`@sumirea/core`](../core/README.md); the `sdk` only decides what is public.

```ts
import { createInstance, run, pause } from '@sumirea/sdk';
```

**Depends on:** `@sumirea/schema`, `@sumirea/core`, `@sumirea/adapters`
(adapters composition is not part of this facade yet).
