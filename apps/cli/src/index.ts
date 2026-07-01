#!/usr/bin/env node
// @sumirea/cli — the command-line surface.
//
// A thin entry point that translates terminal/CI invocations into @sumirea/sdk
// calls and renders the results. No workflow logic lives here: the demo Workflow
// below is authored through the public @sumirea/sdk contract types, and all
// execution is delegated to the SDK (which re-exports the @sumirea/core Runtime).
// The CLI never imports @sumirea/core directly.

import { createInstance, run } from '@sumirea/sdk';
import type { WorkflowDefinition, WorkflowInstance, WorkflowStatus } from '@sumirea/sdk';

// Minimal, type-only view of the Node `process` global the CLI uses. Declared
// here to keep the package dependency-free (no `@types/node`); it is erased at
// emit — Node provides the real `process` at runtime.
declare const process: {
  argv: string[];
  exitCode: number;
  readonly stdout: { write(text: string): void };
  readonly stderr: { write(text: string): void };
};

const USAGE_EXIT_CODE = 2;

/** Map a terminal Workflow status to the CLI's public exit-code contract. */
function exitCodeFor(status: WorkflowStatus): number {
  switch (status) {
    case 'completed':
      return 0;
    case 'failed':
      return 1;
    case 'paused':
      return 3;
    default:
      // `created`, `running`, and `cancelled` are unreachable from `run()`;
      // treat any unexpected status as a failure so the contract stays total.
      return 1;
  }
}

const USAGE = `sumirea — run Sumirea workflows

Usage:
  sumirea run-demo [--json]

Commands:
  run-demo    Run a built-in demo Workflow and report its result.

Options:
  --json      Emit the result as JSON instead of human-readable text.

Exit codes:
  0  completed    1  failed    2  invalid usage    3  paused`;

/**
 * A small demo Workflow, owned by the CLI and authored via the public SDK
 * contract types. It exists only to prove the schema → core → sdk → cli stack.
 */
const demoWorkflow: WorkflowDefinition = {
  name: 'demo',
  initialState: { greeting: 'hello' },
  steps: [
    { name: 'prepare', run: (state) => ({ ...state, prepared: true }) },
    { name: 'finish', run: (state) => ({ ...state, finished: true }) },
  ],
};

function report(instance: WorkflowInstance, asJson: boolean): void {
  if (asJson) {
    process.stdout.write(
      `${JSON.stringify({
        workflow: instance.definition.name,
        status: instance.status,
        cursor: instance.cursor,
        state: instance.state,
      })}\n`,
    );
    return;
  }
  process.stdout.write(
    `workflow "${instance.definition.name}" → ${instance.status} (cursor ${instance.cursor})\n` +
      `state: ${JSON.stringify(instance.state)}\n`,
  );
}

function runDemo(args: string[]): number {
  const asJson = args.includes('--json');
  const result = run(createInstance(demoWorkflow));
  report(result, asJson);
  return exitCodeFor(result.status);
}

function main(argv: string[]): number {
  const [command, ...rest] = argv;
  if (command === 'run-demo') {
    return runDemo(rest);
  }
  process.stderr.write(`${USAGE}\n`);
  return USAGE_EXIT_CODE;
}

// Set the exit code and let the process end naturally so stdout is flushed.
process.exitCode = main(process.argv.slice(2));
