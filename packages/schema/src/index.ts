// @sumirea/schema — the contract layer.
//
// Defines the smallest contracts the workflow engine speaks: the opaque state
// carried through a run, the black-box Step boundary, and the workflow
// definition format. Behaviour lives in `core`; only shapes live here.

/**
 * Opaque state threaded through a workflow run.
 *
 * The Runtime carries this value from one Step to the next but never inspects
 * or interprets its contents — that is a Step's concern, not orchestration's.
 */
export type WorkflowState = Readonly<Record<string, unknown>>;

/**
 * A Checkpoint: an opaque pause marker a Step attaches when it asks the Runtime
 * to stop. The Runtime records it so a run could be resumed later, but never
 * inspects why the Checkpoint exists or what it is for.
 */
export interface Checkpoint {
  /** Optional human-readable label. Not interpreted by the Runtime. */
  readonly name?: string;
}

/**
 * Brand marking a value as a pause outcome. It is a unique symbol so a pause can
 * never be confused with a bare WorkflowState, whose contents are opaque and may
 * hold anything. Steps produce a pause via `pause()`, never by hand.
 */
export const STEP_PAUSE: unique symbol = Symbol('sumirea.step.pause');

/**
 * A Step's request to pause the run at a Checkpoint, carrying the state to hold.
 */
export interface StepPause {
  readonly [STEP_PAUSE]: true;
  /** The state to preserve at the Checkpoint (the last successfully produced). */
  readonly state: WorkflowState;
  /** The opaque pause marker. Recorded by the Runtime, never interpreted. */
  readonly checkpoint: Checkpoint;
}

/**
 * What a Step returns to the Runtime: either the next WorkflowState — the
 * Runtime continues — or a pause outcome — the Runtime stops at a Checkpoint.
 * These are the only two orchestration outcomes the Runtime understands; it
 * reads the shape, never the meaning.
 */
export type StepOutcome = WorkflowState | StepPause;

/**
 * The smallest Step contract.
 *
 * A Step is a black box: given the current state, it returns an outcome — the
 * next state to continue with, or a pause at a Checkpoint. The Runtime knows
 * only how to run a Step and act on that generic outcome; it never learns what
 * the Step does (AI, Git, review, …) or why it paused. All such behaviour lives
 * behind this boundary, never inside the Runtime.
 */
export interface Step {
  /** Human-readable identifier. Not interpreted by the Runtime. */
  readonly name: string;
  /** Execute against the current state and return the next outcome. */
  run(state: WorkflowState): StepOutcome;
}

/** Build a pause outcome: the state to hold, and the Checkpoint to stop at. */
export function pause(checkpoint: Checkpoint, state: WorkflowState): StepPause {
  return { [STEP_PAUSE]: true, state, checkpoint };
}

/** True when a Step outcome is a request to pause, rather than a next state. */
export function isStepPause(outcome: StepOutcome): outcome is StepPause {
  return typeof outcome === 'object' && outcome !== null && STEP_PAUSE in outcome;
}

/**
 * A workflow definition: an ordered list of Steps and an optional starting
 * state. This is the format the Runtime instantiates and executes.
 */
export interface WorkflowDefinition {
  readonly name: string;
  readonly steps: readonly Step[];
  readonly initialState?: WorkflowState;
}
