# Examples

Runnable examples that show how to use Sumirea. Each example is a small,
private workspace package — not part of the published packages; they exist to
teach and to double as living documentation.

## `runtime-basics`

A tour of the public [`@sumirea/core`](../packages/core) Runtime API: running a
Workflow to completion, pausing at a Checkpoint, resuming, cancelling, and
handling a Step failure.

Run it from the repo root (build the workspace once so `@sumirea/core` is
available):

```sh
pnpm build
pnpm --filter @sumirea/example-runtime-basics start
```

## `sdk-basics`

The same lifecycle tour, but through the curated
[`@sumirea/sdk`](../packages/sdk) facade — a consumer imports only from
`@sumirea/sdk` and never reaches into `@sumirea/core`.

```sh
pnpm build
pnpm --filter @sumirea/example-sdk-basics start
```
