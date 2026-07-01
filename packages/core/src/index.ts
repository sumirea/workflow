// @sumirea/core — the workflow engine (orchestration only).
//
// The Runtime's single responsibility is orchestration: create an instance,
// thread state through Steps in order, and terminate — whether the run
// completes or a Step fails. It holds no business logic and never interprets
// what a Step does or why it failed. Every Step is a black box behind the
// @sumirea/schema `Step` contract; AI, review, Git and the rest live inside
// Steps, never here.

import { isStepPause, pause } from '@sumirea/schema';
import type { Checkpoint, Step, WorkflowDefinition, WorkflowState } from '@sumirea/schema';

// Re-export the Step-outcome contract so Step authors and consumers reach it
// from the engine's public surface.
export { pause } from '@sumirea/schema';
export type { Checkpoint, StepOutcome, StepPause } from '@sumirea/schema';

/** Lifecycle of a workflow run. */
export type WorkflowStatus =
  'created' | 'running' | 'paused' | 'completed' | 'failed' | 'cancelled';

/**
 * Minimal record of a failed run. The Runtime captures where the run stopped
 * and the raw value the Step raised — it never inspects or interprets that
 * value.
 */
export interface WorkflowFailure {
  /** Zero-based index of the Step that failed. Positional only. */
  readonly stepIndex: number;
  /** The raw value the Step threw. Opaque to the Runtime — never inspected. */
  readonly error: unknown;
}

/**
 * A single execution of a WorkflowDefinition. It carries the run's current
 * state and how far execution has progressed. The Runtime owns this; Steps
 * never see it.
 */
export interface WorkflowInstance {
  readonly definition: WorkflowDefinition;
  readonly status: WorkflowStatus;
  readonly state: WorkflowState;
  /** Number of Steps completed. Equals `definition.steps.length` when done. */
  readonly cursor: number;
  /** Present only when `status` is `failed`. */
  readonly failure?: WorkflowFailure;
  /** Present only when `status` is `paused`. The Step's opaque pause marker. */
  readonly checkpoint?: Checkpoint;
}

/** Create a fresh instance, ready to run from its first Step. */
export function createInstance(definition: WorkflowDefinition): WorkflowInstance {
  return {
    definition,
    status: 'created',
    state: definition.initialState ?? {},
    cursor: 0,
  };
}

/**
 * Execute an instance's Steps from `fromIndex`, threading `startState` through
 * each. Shared by `run` (from the first Step) and `resume` (from the Step after
 * a pause). The instance transitions into `running` and any active Checkpoint is
 * consumed as execution begins.
 *
 * Take each Step's outcome: a next state to continue with, or a pause at a
 * Checkpoint. If a Step throws, stop immediately, mark the instance `failed`,
 * and preserve the last state that was successfully produced. If a Step asks to
 * pause, stop, mark the instance `paused`, preserve the state the Step held, and
 * record the Step's opaque Checkpoint. Every Step is treated identically — the
 * Runtime calls `run`, reads the generic outcome, and does not know or care what
 * any Step does, why it failed, or why it paused.
 */
function execute(
  base: WorkflowInstance,
  fromIndex: number,
  startState: WorkflowState,
): WorkflowInstance {
  // Enter `running` and consume any active Checkpoint. The terminal `completed`
  // / `failed` transitions carry this cleared instance forward; a fresh pause
  // below records its own Checkpoint.
  const running: WorkflowInstance = { ...base, status: 'running', checkpoint: undefined };
  let state = startState;
  for (const [index, step] of running.definition.steps.entries()) {
    if (index < fromIndex) continue;
    let outcome;
    try {
      outcome = step.run(state);
    } catch (error) {
      return {
        ...running,
        status: 'failed',
        state,
        cursor: index,
        failure: { stepIndex: index, error },
      };
    }
    if (isStepPause(outcome)) {
      return {
        ...running,
        status: 'paused',
        state: outcome.state,
        cursor: index,
        checkpoint: outcome.checkpoint,
      };
    }
    state = outcome;
  }
  return {
    ...running,
    status: 'completed',
    state,
    cursor: running.definition.steps.length,
  };
}

/**
 * Run an instance from its first Step until it terminates or pauses. See
 * `execute` for the outcome handling.
 */
export function run(instance: WorkflowInstance): WorkflowInstance {
  return execute(instance, 0, instance.state);
}

/**
 * Resume a paused instance from the Step after the one that paused. Execution
 * continues at `cursor + 1` (the pausing Step is never re-run) using the paused
 * Workflow State as the starting state; the active Checkpoint is consumed. The
 * resumed run may complete, fail, or pause again at a later Checkpoint.
 *
 * Only a `paused` instance may be resumed. Calling `resume` with any other
 * status is caller misuse — not a Step or Workflow failure — so it throws
 * without touching the instance or running any Step.
 */
export function resume(instance: WorkflowInstance): WorkflowInstance {
  if (instance.status !== 'paused') {
    throw new Error(`cannot resume a workflow with status "${instance.status}"; expected "paused"`);
  }
  return execute(instance, instance.cursor + 1, instance.state);
}

/**
 * Cancel a paused instance, terminating it as `cancelled` without resuming.
 * The paused Workflow State is preserved and the active Checkpoint is cleared;
 * no Step runs. Cancellation is a caller decision, not a Step or Workflow
 * failure, and the Runtime never inspects why the Checkpoint was cancelled.
 *
 * Only a `paused` instance may be cancelled. Calling `cancel` with any other
 * status is caller misuse, so it throws without touching the instance.
 */
export function cancel(instance: WorkflowInstance): WorkflowInstance {
  if (instance.status !== 'paused') {
    throw new Error(`cannot cancel a workflow with status "${instance.status}"; expected "paused"`);
  }
  return { ...instance, status: 'cancelled', checkpoint: undefined };
}

// --- Trivial built-in workflows, used only to prove orchestration behaviour. ---

/** A trivial no-op Step: returns the state unchanged. */
function noopStep(name: string): Step {
  return { name, run: (state) => state };
}

/** A trivial Step that always fails by throwing. */
function failingStep(name: string): Step {
  return {
    name,
    run: () => {
      throw new Error(`step "${name}" failed`);
    },
  };
}

/** A trivial Step that pauses the run at a Checkpoint, holding state unchanged. */
function pausingStep(name: string): Step {
  return {
    name,
    run: (state) => pause({ name: `${name}-checkpoint` }, state),
  };
}

/**
 * The smallest possible built-in workflow: a few no-op Steps in sequence. It
 * exists solely to demonstrate that an instance can be created and run from
 * start to finish. It carries no business meaning.
 */
export const trivialWorkflow: WorkflowDefinition = {
  name: 'trivial',
  steps: [noopStep('first'), noopStep('second'), noopStep('third')],
};

/**
 * A built-in workflow whose middle Step fails. It exists solely to demonstrate
 * that the Runtime stops at the failing Step and terminates as `failed`. The
 * final Step must never run.
 */
export const trivialFailingWorkflow: WorkflowDefinition = {
  name: 'trivial-failing',
  steps: [noopStep('first'), failingStep('second'), noopStep('third')],
};

/**
 * A built-in workflow whose middle Step pauses at a Checkpoint. It exists solely
 * to demonstrate that the Runtime stops at the pausing Step and marks the
 * instance `paused`. The final Step must never run.
 */
export const trivialPausingWorkflow: WorkflowDefinition = {
  name: 'trivial-pausing',
  steps: [noopStep('first'), pausingStep('second'), noopStep('third')],
};
