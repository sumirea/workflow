// @sumirea/sdk — the curated public API.
//
// The sdk is the single seam that apps, surfaces, and embedders import from.
// They depend on the sdk and never reach past it into @sumirea/core. This first
// slice is a thin, deliberate facade: it re-exports the developer-facing Runtime
// surface unchanged — no wrapping, no new behaviour — and withholds Core's
// internal and demonstration-only exports (the `trivial*` workflows). Runtime
// semantics live entirely in @sumirea/core; the sdk only curates what is public.

// Runtime lifecycle functions and the Step-outcome helpers, re-exported as-is.
export { createInstance, run, resume, cancel, pause, isStepPause } from '@sumirea/core';

// Public contract types.
export type {
  WorkflowDefinition,
  Step,
  StepOutcome,
  StepPause,
  Checkpoint,
  WorkflowState,
  WorkflowInstance,
  WorkflowStatus,
  WorkflowFailure,
} from '@sumirea/core';
