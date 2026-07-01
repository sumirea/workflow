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
 * The smallest Step contract.
 *
 * A Step is a black box: given the current state, it returns the next state.
 * The Runtime knows only how to run a Step and take its result; it never learns
 * what the Step does (AI, Git, review, …). All such behaviour lives behind this
 * boundary, never inside the Runtime.
 */
export interface Step {
  /** Human-readable identifier. Not interpreted by the Runtime. */
  readonly name: string;
  /** Execute against the current state and return the next state. */
  run(state: WorkflowState): WorkflowState;
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
