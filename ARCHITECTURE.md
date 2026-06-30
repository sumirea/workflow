# Architecture

This document describes the structure of the Sumirea monorepo and the
principles that govern it. It is the canonical reference for _where code
belongs_ and _why_. It deliberately describes boundaries, not features — no
features exist yet.

## North star

> Sumirea is an open-source **workflow layer** for AI-assisted software
> development.

Two consequences follow from that single sentence, and they shape every
decision below:

1. **Surfaces are not the product.** A browser extension, a CLI, and a hosted
   web app are interchangeable ways to reach the same workflow engine. None of
   them may contain workflow logic. If a feature only works in one surface, it
   is in the wrong place.
2. **The provider is not the product.** Model vendors, version-control hosts,
   and editors are dependencies behind interfaces, not assumptions baked into
   the core. Swapping one must not ripple outward.

## Layered structure

```text
            ┌─────────────────────────────────────────────┐
  apps/     │  extension      cli       docs (website)     │   surfaces
            └───────────────────┬─────────────────────────┘
                                │ depends on
            ┌───────────────────▼─────────────────────────┐
  sdk/      │  public, stable programmatic API             │   embedding
            └───────────────────┬─────────────────────────┘
                                │
            ┌───────────────────▼─────────────────────────┐
  core/     │  workflow engine: domain model + orchestration│  the product
            └───────────────────┬─────────────────────────┘
                    depends on  │  defines ports
            ┌───────────────────▼─────────────────────────┐
  schema/   │  workflow definition format + shared types   │   contracts
            └─────────────────────────────────────────────┘

  adapters/  implement core's ports for concrete providers (AI, VCS, editors)
             and are injected at the edges — core never imports them directly.
```

### The one rule

**Dependencies point inward and downward only:**

```
apps → sdk → core → schema
adapters → (schema, core's port types)   // injected, never imported by core
```

- `schema` depends on nothing internal.
- `core` depends only on `schema`. It is pure: no network, no filesystem, no
  global clock or randomness reached for directly — those arrive through ports.
- `adapters` implement the ports `core`/`schema` define. `core` never imports an
  adapter; concrete adapters are wired in at the surface or via the `sdk`.
- `sdk` composes `core` with selected `adapters` into a stable public API.
- `apps` are thin: they translate user interaction into `sdk` calls and render
  results. No orchestration logic lives here.

A violation of this rule (e.g. `core` importing `adapters`, or an app reaching
past the `sdk` into `core`) is an architectural bug, not a style preference.

## Packages

| Package                      | Responsibility                                                                | May depend on                |
| ---------------------------- | ----------------------------------------------------------------------------- | ---------------------------- |
| `packages/schema`            | Canonical workflow definition format, shared types, runtime validation.       | (nothing internal)           |
| `packages/core`              | Workflow engine — domain model, step execution, orchestration. Pure.          | `schema`                     |
| `packages/adapters`          | Port interfaces + concrete integrations: AI providers, VCS, editors, storage. | `schema`, `core` (types)     |
| `packages/sdk`               | Stable public API that composes `core` + `adapters` for embedders.            | `schema`, `core`, `adapters` |
| `packages/ui`                | Shared, surface-agnostic presentational components.                           | `schema` (types only)        |
| `packages/typescript-config` | Internal shared `tsconfig` presets.                                           | —                            |
| `packages/eslint-config`     | Internal shared lint presets.                                                 | —                            |

> [!NOTE]
> **Planned vs. established boundaries.** This table describes the _intended_
> shape. As of Day 0, only `schema` and `core` carry intent to be built first.
> `adapters`, `sdk`, and `ui` are **planned boundaries**: their packages exist
> to reserve the seam and document the dependency direction, not to signal
> delivered capability. They are empty scaffolding and may be deferred, merged,
> or reshaped via ADR/RFC before they hold real code — see each package's README
> ("scaffold only").

## Apps (surfaces)

| App              | Responsibility                                 |
| ---------------- | ---------------------------------------------- |
| `apps/extension` | Browser-extension shell that drives the `sdk`. |
| `apps/cli`       | Terminal/CI entry point that drives the `sdk`. |
| `apps/docs`      | Public documentation **website** for users.    |

> Note the two "docs": `apps/docs` is the user-facing _website_; the top-level
> [`docs/`](./docs) directory holds _project_ documentation — this file, ADRs,
> and RFCs.

## Ports and adapters (why `adapters` is its own package)

The workflow engine must not know whether it is talking to one model provider or
another, GitHub or GitLab, VS Code or a browser. `core` defines **ports** —
narrow interfaces such as "a thing that can complete a prompt" or "a thing that
can read a repository." `adapters` provides **implementations** of those ports.
Surfaces (or the `sdk`) choose which adapters to wire in.

This keeps the engine testable in isolation (swap in fakes), keeps provider
churn at the edges, and lets the community add integrations without touching
the core.

## Conventions

- **Language:** TypeScript, `strict` mode, ESM-only. Shared compiler options
  live in [`tsconfig.base.json`](./tsconfig.base.json) and
  `packages/typescript-config`.
- **Boundaries:** each package exposes a single public entry point; deep imports
  across package internals are disallowed.
- **No feature code without a contract:** new workflow capabilities define their
  shape in `schema` first.
- **Decisions are recorded:** significant choices become ADRs in
  [`docs/adr/`](./docs/adr); larger proposals go through
  [`docs/rfcs/`](./docs/rfcs).

## What is intentionally undecided

This foundation deliberately leaves room for later, RFC-driven decisions,
including: the concrete workflow definition format, the execution/runtime model
(local vs. hosted, sync vs. event-driven), the first model and VCS adapters, and
the persistence strategy. The structure above is designed so those decisions can
be made _inside_ a package without reshaping the repository.
