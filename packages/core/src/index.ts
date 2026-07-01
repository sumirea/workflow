// @sumirea/core — the workflow engine (orchestration only).
//
// The Runtime's single responsibility is orchestration: create an instance,
// thread state through Steps in order, and terminate — whether the run
// completes or a Step fails. It holds no business logic and never interprets
// what a Step does or why it failed. Every Step is a black box behind the
// @sumirea/schema `Step` contract; AI, review, Git and the rest live inside
// Steps, never here.

import type { Step, WorkflowDefinition, WorkflowState } from '@sumirea/schema';

/** Lifecycle of a workflow run. */
export type WorkflowStatus = 'created' | 'running' | 'completed' | 'failed';

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
 * Run an instance to termination. The instance transitions into `running`
 * immediately before the first Step executes; from there the run is in flight
 * until it terminates. Execute each Step in order, threading the state each
 * returns into the next. If a Step throws, the Runtime stops immediately, marks
 * the instance `failed`, and preserves the last state that was successfully
 * produced. It treats every Step identically — it calls `run`, takes the result
 * (or catches the failure), and does not know or care what any Step does or why
 * it failed.
 */
export function run(instance: WorkflowInstance): WorkflowInstance {
  // Enter `running` before any Step executes. The terminal `completed` /
  // `failed` transitions below carry forward from this in-flight instance.
  const running: WorkflowInstance = { ...instance, status: 'running' };
  let state = running.state;
  for (const [index, step] of running.definition.steps.entries()) {
    try {
      state = step.run(state);
    } catch (error) {
      return {
        ...running,
        status: 'failed',
        state,
        cursor: index,
        failure: { stepIndex: index, error },
      };
    }
  }
  return {
    ...running,
    status: 'completed',
    state,
    cursor: running.definition.steps.length,
  };
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
