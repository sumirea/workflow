#!/usr/bin/env node
// @sumirea/cli — the command-line surface.
//
// A thin entry point that translates terminal/CI invocations into @sumirea/sdk
// calls and renders the results. No workflow logic lives here: workflows are
// authored through the public @sumirea/sdk contract types (either the built-in
// demo below or a user-provided module), and all execution is delegated to the
// SDK (which re-exports the @sumirea/core Runtime). The CLI never imports
// @sumirea/core directly.

import { createInstance, run } from '@sumirea/sdk';
import type { WorkflowDefinition, WorkflowInstance, WorkflowStatus } from '@sumirea/sdk';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

// Minimal, type-only view of the Node `process` global the CLI uses (the
// `node:path` / `node:url` shims live in node-shims.d.ts). Declared to keep the
// package dependency-free (no `@types/node`); erased at emit — Node provides the
// real `process` at runtime.
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
  sumirea run <file> [--json]

Commands:
  run-demo       Run a built-in demo Workflow and report its result.
  run <file>     Run a Workflow from a local ES module that default-exports a
                 WorkflowDefinition (\`.mjs\` recommended).

Options:
  --json         Emit the result as JSON instead of human-readable text.

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

function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

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

/** Execute a WorkflowDefinition through the SDK and report it. */
function execute(definition: WorkflowDefinition, asJson: boolean): number {
  const result = run(createInstance(definition));
  report(result, asJson);
  return exitCodeFor(result.status);
}

function runDemo(args: string[]): number {
  return execute(demoWorkflow, args.includes('--json'));
}

/**
 * `run <file>` — load a local ES module that default-exports a
 * WorkflowDefinition and execute it. The module is imported and its Step `run`
 * functions execute as ordinary local code; the CLI does not sandbox it (treat
 * it like running a local Node script). Only local paths are supported.
 */
async function runFile(args: string[]): Promise<number> {
  const asJson = args.includes('--json');
  const file = args.find((arg) => !arg.startsWith('--'));
  if (file === undefined) {
    process.stderr.write(`error: \`run\` requires a workflow file.\n\n${USAGE}\n`);
    return USAGE_EXIT_CODE;
  }

  let definition: WorkflowDefinition;
  try {
    const mod = await import(pathToFileURL(resolve(file)).href);
    if (mod.default === undefined) {
      process.stderr.write(
        `error: "${file}" has no default export (expected a WorkflowDefinition).\n`,
      );
      return USAGE_EXIT_CODE;
    }
    definition = mod.default;
  } catch (error) {
    process.stderr.write(`error: could not load "${file}": ${errorMessage(error)}\n`);
    return USAGE_EXIT_CODE;
  }

  try {
    // createInstance validates the definition shape and throws on malformed
    // input (caller misuse) — surface that as invalid input, not a run failure.
    return execute(definition, asJson);
  } catch (error) {
    process.stderr.write(`error: invalid workflow in "${file}": ${errorMessage(error)}\n`);
    return USAGE_EXIT_CODE;
  }
}

async function main(argv: string[]): Promise<number> {
  const [command, ...rest] = argv;
  if (command === 'run-demo') {
    return runDemo(rest);
  }
  if (command === 'run') {
    return runFile(rest);
  }
  process.stderr.write(`${USAGE}\n`);
  return USAGE_EXIT_CODE;
}

// Set the exit code and let the process end naturally so stdout is flushed.
process.exitCode = await main(process.argv.slice(2));
