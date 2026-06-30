# Contributing to Sumirea

Thanks for your interest in building the open-source workflow layer for
AI-assisted software development. Sumirea is in its founding phase, so the most
valuable contributions right now are to the **architecture and foundation** —
discussion, RFCs, and tooling — rather than features.

## Ground rules

- Be respectful. All participation is governed by our
  [Code of Conduct](./CODE_OF_CONDUCT.md).
- Discuss significant changes before building them. Open an issue or an RFC
  (see below) so the direction is agreed upon first.
- Keep the architecture honest. Read [`ARCHITECTURE.md`](./ARCHITECTURE.md);
  changes that cross package boundaries must respect the dependency rule
  (`apps → sdk → core → schema`, adapters injected behind ports).

## Development setup

Prerequisites: Node.js >= 20 (see [`.nvmrc`](./.nvmrc)) and
[pnpm](https://pnpm.io) >= 9.

```bash
pnpm install
pnpm build
pnpm test
pnpm lint
pnpm typecheck
```

This is a [pnpm](https://pnpm.io) workspace orchestrated by
[Turborepo](https://turbo.build). Run tasks from the repo root and let Turbo
handle ordering and caching.

## Where things go

| If you are changing…                | Work in…                       |
| ----------------------------------- | ------------------------------ |
| The workflow definition / types     | `packages/schema`              |
| Engine / orchestration behavior     | `packages/core`                |
| A provider integration              | `packages/adapters`            |
| The public API                      | `packages/sdk`                 |
| A surface (extension/CLI/docs site) | `apps/*`                       |
| Project decisions / proposals       | `docs/adr`, `docs/rfcs`        |

## Proposing larger changes (RFCs)

Anything that affects architecture, public APIs, or cross-cutting behavior goes
through a lightweight RFC in [`docs/rfcs/`](./docs/rfcs). Copy the template,
open a pull request, and let discussion happen on the PR. Smaller but notable
implementation decisions are captured as ADRs in [`docs/adr/`](./docs/adr).

## Pull requests

- Branch from the default branch; keep PRs focused.
- Make sure `pnpm lint`, `pnpm typecheck`, and `pnpm test` pass.
- Describe the *why*, not just the *what*. Link the issue or RFC.
- By submitting a contribution you agree it is licensed under the project's
  [Apache-2.0 License](./LICENSE).

## Commit style

Conventional, imperative commit subjects are encouraged
(e.g. `feat(core): …`, `docs: …`, `chore(repo): …`). Keep the subject under ~72
characters and explain context in the body when useful.
