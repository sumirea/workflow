// @sumirea/core — the workflow engine (orchestration only).
//
// The Runtime's single responsibility is orchestration: create an instance,
// thread state through Steps in order, and terminate. It holds no business
// logic and never interprets what a Step does — every Step is a black box
// behind the @sumirea/schema `Step` contract. AI, review, Git, context
// assembly and the rest live inside Steps, never here.

import type { Step, WorkflowDefinition, WorkflowState } from '@sumirea/schema';

/** Lifecycle of a workflow run. */
export type WorkflowStatus = 'created' | 'running' | 'completed';

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
 * Run an instance to completion: execute each Step in order, threading the
 * state each returns into the next. The Runtime treats every Step identically —
 * it calls `run`, takes the result, and continues. It does not know or care
 * what any Step does.
 */
export function run(instance: WorkflowInstance): WorkflowInstance {
  let state = instance.state;
  for (const step of instance.definition.steps) {
    state = step.run(state);
  }
  return {
    ...instance,
    status: 'completed',
    state,
    cursor: instance.definition.steps.length,
  };
}

// --- A trivial built-in workflow, used only to prove orchestration runs. ---

/** A trivial no-op Step: returns the state unchanged. */
function noopStep(name: string): Step {
  return { name, run: (state) => state };
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
