# @sumirea/cli

The **command-line surface** for Sumirea.

A thin entry point for running workflows in terminals and CI. It translates
invocations into `@sumirea/sdk` calls and renders results — and contains **no
workflow logic** of its own. It imports only from `@sumirea/sdk`, never from
`@sumirea/core`.

## Usage

```sh
sumirea run-demo             # run a built-in demo Workflow, human-readable output
sumirea run-demo --json      # same, as deterministic JSON (for scripting / CI)

sumirea run <file>           # run a Workflow from a local module
sumirea run <file> --json    # same, as JSON
```

`run-demo` runs a small built-in demo Workflow — authored by the CLI through the
public `@sumirea/sdk` contract types.

`run <file>` loads a Workflow from a local module and runs it. Both commands go
through `createInstance` + `run` and report the resulting status, cursor, and
state.

### Workflow file contract

A workflow file is a **local ES module** that **`export default`s a
`WorkflowDefinition`** (authored with the `@sumirea/sdk` contract types):

```js
// my-workflow.mjs
export default {
  name: 'my-workflow',
  steps: [{ name: 'greet', run: (state) => ({ ...state, greeted: true }) }],
};
```

- `.mjs` is the recommended, reliable extension (always an ES module).
- Only the **default export** is used — named exports are ignored.
- JSON and TypeScript source are **not** supported, and remote URLs are not
  loaded (local paths only). A definition contains Step `run` functions, so it
  must be executable code, not data.

### Exit codes

| Code | Meaning                                                                                                 |
| ---- | ------------------------------------------------------------------------------------------------------- |
| 0    | completed                                                                                               |
| 1    | failed                                                                                                  |
| 2    | invalid usage — missing file, unloadable module, no default export, or a malformed `WorkflowDefinition` |
| 3    | paused                                                                                                  |

### Trust model

`sumirea run <file>` **executes local, user-provided code**. The module's
top-level code runs when it is imported, and its Step `run` functions run while
the Workflow executes. The CLI does **not** sandbox the module — treat it exactly
like running a local Node script, and only run files you trust.

## Scope

This is a single-process surface with **no persistence**. Because a paused
Workflow Instance lives only in memory during one invocation, there is nothing
for a separate process to continue — so cross-invocation `resume` and `cancel`
are **deferred** until a persistence layer exists.

**Depends on:** `@sumirea/sdk`.
