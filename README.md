<div align="center">

# Sumirea

**An open-source workflow layer for AI-assisted software development.**

</div>

> [!NOTE]
> Sumirea is in its founding phase. This repository currently contains the
> **project foundation and architecture only** — directory boundaries, tooling,
> and governance. No product features are implemented yet. See
> [`ARCHITECTURE.md`](./ARCHITECTURE.md) for the design and
> [`docs/`](./docs) for decision records and RFCs.

## What Sumirea is

Sumirea is a **workflow layer**, not an application. It defines, runs, and
coordinates the repeatable steps of AI-assisted software development — planning,
context gathering, code generation, review, and verification — independently of
any single editor, model provider, or delivery surface.

A browser extension, a CLI, and a docs site are some of the *surfaces* through
which Sumirea is delivered. They are deliberately thin. The product lives in the
shared packages, so the same workflow behaves identically wherever it runs.

## Repository layout

```text
sumirea/
├─ apps/                 Delivery surfaces (thin; no business logic)
│  ├─ extension/         Browser extension shell
│  ├─ cli/               Command-line entry point
│  └─ docs/              Public documentation website
├─ packages/             The product — reusable, surface-agnostic libraries
│  ├─ schema/            Canonical workflow definition format + shared types
│  ├─ core/              Workflow engine (pure domain + orchestration)
│  ├─ adapters/          Integration ports + implementations (AI, VCS, editors)
│  ├─ sdk/               Public programmatic API for embedders
│  ├─ ui/                Shared presentational components
│  ├─ typescript-config/ Shared tsconfig presets (internal)
│  └─ eslint-config/     Shared lint presets (internal)
├─ docs/                 Project docs: architecture, ADRs, RFCs
├─ examples/             Example workflows and usage
└─ .github/              CI and contribution templates
```

The dependency direction is strict and one-way:
`apps → sdk → core → schema`, with `adapters` plugged in behind ports.
See [`ARCHITECTURE.md`](./ARCHITECTURE.md) for the full rationale.

## Tech foundation

- **Language:** TypeScript (strict)
- **Package manager:** pnpm workspaces
- **Task orchestration:** Turborepo
- **Node:** >= 20 (see [`.nvmrc`](./.nvmrc))
- **License:** [Apache-2.0](./LICENSE)

## Getting started

```bash
pnpm install      # install the workspace
pnpm build        # build all packages
pnpm test         # run tests
pnpm lint         # lint
pnpm typecheck    # type-check
```

## Contributing

Sumirea is built in the open. Start with [`CONTRIBUTING.md`](./CONTRIBUTING.md)
and our [`CODE_OF_CONDUCT.md`](./CODE_OF_CONDUCT.md). Architectural changes go
through the RFC process in [`docs/rfcs/`](./docs/rfcs).

## License

Apache License 2.0 — see [`LICENSE`](./LICENSE) and [`NOTICE`](./NOTICE).
