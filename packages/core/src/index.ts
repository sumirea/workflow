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

// Re-export the schema contract so Step authors and consumers reach the whole
// public surface from the engine, without importing @sumirea/schema directly.
export { pause, isStepPause } from '@sumirea/schema';
export type {
  Checkpoint,
  Step,
  StepOutcome,
  StepPause,
  WorkflowDefinition,
  WorkflowState,
} from '@sumirea/schema';

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
  /**
   * Optional, caller-provided run identifier. Opaque to the Runtime: it is
   * stored as given, carried unchanged through every lifecycle transition, and
   * never generated, inspected, or interpreted here. It is an observation seed
   * for future capabilities (Journal, Events, Persistence, Metrics) to attach
   * records to a single run — nothing more. `undefined` when no id was supplied.
   */
  readonly id?: string;
  /**
   * Optional, caller-provided lifecycle observer. Internal-first: it travels
   * with the instance so `run`/`resume`/`cancel` can emit orchestration
   * transitions synchronously, but it is not part of the SDK surface and holds
   * no run state. `undefined` when no observer was supplied. See
   * `LifecycleEvent` and `CreateInstanceOptions.onEvent`.
   */
  readonly onEvent?: LifecycleObserver;
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

/**
 * A Runtime lifecycle event: a synchronous, read-only description of a single
 * orchestration transition. Events describe *only* transitions the Runtime
 * itself performs — a run starting, a Step boundary, a pause, a terminal state.
 * They carry positional and opaque-reference data only: never Step business
 * logic, never Workflow State contents, never timestamps or ordering metadata.
 * `instanceId` is the caller-provided `WorkflowInstance.id`, passed by value as
 * an opaque correlation handle (`undefined` when none was supplied).
 *
 * This is internal-first: an observation surface for future Journal / Metrics /
 * Persistence / Event Bus work — not a Journal, a bus, or an SDK contract yet.
 */
export type LifecycleEvent =
  | { readonly type: 'run:started'; readonly instanceId?: string; readonly definitionName: string }
  | {
      readonly type: 'step:started';
      readonly instanceId?: string;
      readonly index: number;
      readonly name: string;
    }
  | {
      readonly type: 'step:settled';
      readonly instanceId?: string;
      readonly index: number;
      readonly name: string;
    }
  | {
      readonly type: 'run:paused';
      readonly instanceId?: string;
      readonly cursor: number;
      readonly checkpoint: Checkpoint;
    }
  | { readonly type: 'run:resumed'; readonly instanceId?: string; readonly fromCursor: number }
  | { readonly type: 'run:completed'; readonly instanceId?: string; readonly cursor: number }
  | {
      readonly type: 'run:failed';
      readonly instanceId?: string;
      readonly cursor: number;
      readonly failure: WorkflowFailure;
    }
  | { readonly type: 'run:cancelled'; readonly instanceId?: string; readonly cursor: number };

/**
 * A synchronous lifecycle observer. The Runtime invokes it as each transition
 * occurs. It is a single opt-in callback — not a subscription registry or event
 * bus. Its return value is ignored, and any error it throws is isolated: an
 * observer can never alter the Runtime's orchestration result.
 */
export type LifecycleObserver = (event: LifecycleEvent) => void;

/**
 * Invoke the observer for one event, isolating any error it throws. Emission is
 * a pure side effect of a transition: it never changes the instance the Runtime
 * returns, and a throwing observer must not break orchestration.
 */
function emit(observer: LifecycleObserver | undefined, event: LifecycleEvent): void {
  if (observer === undefined) return;
  try {
    observer(event);
  } catch {
    // Observer errors are deliberately swallowed: orchestration is never
    // affected by what an observer does. The Runtime does not interpret them.
  }
}

/**
 * Reject a malformed WorkflowDefinition before an instance is created. This is
 * Runtime API boundary validation: it checks only the structural shape of the
 * definition and its Steps — never Step behaviour, business meaning, or the
 * opaque contents of `initialState`. Invalid input is caller misuse, so it
 * throws; it is never turned into a `failed` instance.
 */
function assertValidDefinition(definition: WorkflowDefinition): void {
  if (typeof definition !== 'object' || definition === null) {
    throw new Error('invalid workflow definition: expected an object');
  }
  if (typeof definition.name !== 'string' || definition.name.length === 0) {
    throw new Error('invalid workflow definition: `name` must be a non-empty string');
  }
  if (!Array.isArray(definition.steps)) {
    throw new Error('invalid workflow definition: `steps` must be an array');
  }
  if (definition.steps.length === 0) {
    throw new Error('invalid workflow definition: `steps` must not be empty');
  }
  definition.steps.forEach((step, index) => {
    if (typeof step !== 'object' || step === null) {
      throw new Error(`invalid workflow definition: step ${index} must be an object`);
    }
    if (typeof step.run !== 'function') {
      throw new Error(`invalid workflow definition: step ${index} must have a callable \`run\``);
    }
    if (typeof step.name !== 'string' || step.name.length === 0) {
      throw new Error(
        `invalid workflow definition: step ${index} must have a non-empty string \`name\``,
      );
    }
  });
  if (definition.initialState !== undefined) {
    if (typeof definition.initialState !== 'object' || definition.initialState === null) {
      throw new Error('invalid workflow definition: `initialState`, if present, must be an object');
    }
  }
}

/**
 * Options for creating an instance. All fields are optional.
 */
export interface CreateInstanceOptions {
  /**
   * Opaque run identifier. Stored as given and carried unchanged through every
   * lifecycle transition. The Runtime never generates it (no clock, random, or
   * UUID) and never inspects it. Omit it to leave `instance.id` `undefined`.
   */
  readonly id?: string;
  /**
   * Optional synchronous lifecycle observer. When provided, the Runtime emits a
   * `LifecycleEvent` at each orchestration transition (run/step start, pause,
   * resume, completion, failure, cancellation). Opt-in: when omitted, no events
   * are emitted and behaviour is exactly as before. A throwing observer never
   * affects the run. See `LifecycleEvent`.
   */
  readonly onEvent?: LifecycleObserver;
}

/**
 * Create a fresh instance, ready to run from its first Step. Throws if the
 * definition is malformed — see `assertValidDefinition`.
 *
 * An optional, caller-provided `id` is stored on the instance verbatim. The
 * Runtime never generates one: if `options.id` is omitted, `instance.id` is
 * `undefined`.
 */
export function createInstance(
  definition: WorkflowDefinition,
  options?: CreateInstanceOptions,
): WorkflowInstance {
  assertValidDefinition(definition);
  return {
    id: options?.id,
    onEvent: options?.onEvent,
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
  const observer = base.onEvent;
  const instanceId = base.id;
  let state = startState;
  for (const [index, step] of running.definition.steps.entries()) {
    if (index < fromIndex) continue;
    emit(observer, { type: 'step:started', instanceId, index, name: step.name });
    let outcome;
    try {
      outcome = step.run(state);
    } catch (error) {
      const failure = { stepIndex: index, error };
      emit(observer, { type: 'run:failed', instanceId, cursor: index, failure });
      return {
        ...running,
        status: 'failed',
        state,
        cursor: index,
        failure,
      };
    }
    if (isStepPause(outcome)) {
      emit(observer, {
        type: 'run:paused',
        instanceId,
        cursor: index,
        checkpoint: outcome.checkpoint,
      });
      return {
        ...running,
        status: 'paused',
        state: outcome.state,
        cursor: index,
        checkpoint: outcome.checkpoint,
      };
    }
    emit(observer, { type: 'step:settled', instanceId, index, name: step.name });
    state = outcome;
  }
  emit(observer, {
    type: 'run:completed',
    instanceId,
    cursor: running.definition.steps.length,
  });
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
 *
 * Only a `created` instance may be run. Calling `run` with any other status is
 * caller misuse — not a Step or Workflow failure — so it throws without touching
 * the instance or running any Step. Use `resume` to continue a paused run.
 */
export function run(instance: WorkflowInstance): WorkflowInstance {
  if (instance.status !== 'created') {
    throw new Error(`cannot run a workflow with status "${instance.status}"; expected "created"`);
  }
  emit(instance.onEvent, {
    type: 'run:started',
    instanceId: instance.id,
    definitionName: instance.definition.name,
  });
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
  const fromCursor = instance.cursor + 1;
  emit(instance.onEvent, { type: 'run:resumed', instanceId: instance.id, fromCursor });
  return execute(instance, fromCursor, instance.state);
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
  emit(instance.onEvent, {
    type: 'run:cancelled',
    instanceId: instance.id,
    cursor: instance.cursor,
  });
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
