# 2. Monorepo foundation: layout, toolchain, and license

- Status: Proposed
- Date: 2026-06-30

## Context

Sumirea's goal is an open-source **workflow layer** for AI-assisted software
development — not any single application. The first surface discussed is a
browser extension, but the workflow layer must be independent of any surface or
provider. We need a foundation that makes that independence structural rather
than aspirational, and that suits a long-lived community project.

## Decision

1. **Monorepo with a strict layering.** Reusable libraries live in `packages/`
   and _are_ the product; deployable surfaces live in `apps/` and stay thin.
   Dependencies point one way: `apps → sdk → core → schema`, with `adapters`
   injected behind ports. See [`ARCHITECTURE.md`](../../ARCHITECTURE.md).
2. **Toolchain: pnpm workspaces + Turborepo**, TypeScript in strict mode, ESM,
   Node >= 20. Chosen for fast, disk-efficient installs and cached task
   orchestration — the modern default for TypeScript OSS monorepos.
3. **License: Apache-2.0.** Permissive enough for broad adoption while adding an
   explicit patent grant and trademark protection appropriate for developer
   infrastructure.
4. **Initial surfaces scaffolded:** browser extension, CLI, and a documentation
   website. A hosted web app is deferred.

## Consequences

- The same workflow behaves identically across every surface, because surfaces
  hold no logic.
- Provider/integration churn is isolated in `adapters` and cannot ripple into
  the engine.
- Several concrete choices remain open by design (workflow format, runtime
  model, first adapters, persistence) and will be decided via RFCs _inside_
  packages without reshaping the repository.
