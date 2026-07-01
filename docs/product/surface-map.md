# Surface Map

> **Status:** Skeleton (structure only — full content intentionally deferred).
> Part of the Sumirea Product Blueprint (`docs/product/`).

## Purpose

Catalogue the **surfaces** through which users reach Sumirea, and record which
capabilities/features each surface exposes — the product view of delivery
channels.

## Scope

- In: each surface, its audience, and the capabilities/features it surfaces.
- Out: capability/feature definitions (→ `capability-map.md`,
  `feature-map.md`); how a surface is implemented or delivered.

> **Definition (ratified):** a **surface** is a delivery channel through which a
> user touches Sumirea — e.g. browser extension, CLI, docs site, future IDE
> extension, MCP server. "client" is not a formal term for this.

## Canonical status

**Not canonical** (evolving). The set of surfaces will grow; `capability-map.md`
remains the stable anchor each surface draws from.

## Relationship to other documents

- Consumes `capability-map.md` / `feature-map.md` (surfaces expose them).
- Describes surfaces purely as product delivery channels; it says nothing about
  how or where they are built.
- Audience per surface ties back to `personas.md`.

## Outline

- Surface inventory (surface · audience · status)
  - Browser extension
  - CLI
  - Docs site
  - Future IDE extension
  - MCP server
- Capability/feature exposure matrix (surface × capability)
- Surface-specific considerations (constraints, reach, who it's for)
