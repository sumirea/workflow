# @sumirea/cli

The **command-line surface** for Sumirea.

A thin entry point for running workflows in terminals and CI. It translates
invocations into `@sumirea/sdk` calls and renders results — and contains **no
workflow logic** of its own. It imports only from `@sumirea/sdk`, never from
`@sumirea/core`.

## Usage

```sh
sumirea run-demo          # run a built-in demo Workflow, human-readable output
sumirea run-demo --json   # same, as deterministic JSON (for scripting / CI)
```

`run-demo` runs a small demo Workflow — authored by the CLI through the public
`@sumirea/sdk` contract types — through `createInstance` + `run`, then reports the
resulting status, cursor, and state.

### Exit codes

| Code | Meaning       |
| ---- | ------------- |
| 0    | completed     |
| 1    | failed        |
| 2    | invalid usage |
| 3    | paused        |

The demo completes, so it exits `0`. The `paused` code is part of the contract
for future commands even though `run-demo` does not pause.

## Scope

This is a single-process surface with **no persistence**. Because a paused
Workflow Instance lives only in memory during one invocation, there is nothing
for a separate process to continue — so cross-invocation `resume` and `cancel`
are **deferred** until a persistence layer exists. File-based Workflow loading is
likewise out of scope for now.

**Depends on:** `@sumirea/sdk`.
