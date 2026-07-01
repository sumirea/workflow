# Capability Map

> **Status:** Skeleton (structure only — full content intentionally deferred).
> Part of the Sumirea Product Blueprint (`docs/product/`).

## Purpose

Enumerate the long-term **platform capabilities** Sumirea must have — the
abstract, stable, cross-surface abilities that answer "**what can Sumirea
do?**" — independent of any specific feature, surface, or implementation.

## Scope

- In: capabilities as durable ability-classes (per the ratified definition:
  abstract, stable, reusable across surfaces).
- Out: concrete user-facing units (→ `feature-map.md`); which surface exposes
  them (→ `surface-map.md`); how a capability is implemented or delivered.

> **Definition (ratified):** a **capability** is a long-term platform ability,
> usually abstract and reusable across surfaces. It is _not_ a feature, and it
> is defined independently of how the product is built.

## Canonical status

**Canonical.** The backbone of the product model. `feature-map.md`,
`surface-map.md`, and `roadmap.md` all hang off the capabilities defined here.

## Relationship to other documents

- Parent of `feature-map.md` (each feature realizes a capability).
- Demanded by `personas.md` (capabilities exist to serve persona needs).
- Bounded by `non-goals.md` (absent abilities are intentional).
- Measured by `metrics.md` (capability health).

## Outline

- How to read the map (capability · description · serves persona · status)
- Capability catalogue (illustrative, **not yet ratified**):
  - **Workflow Engine** — define, validate, and run workflows
  - **Rule Engine** — conditional/automated behavior
  - **AI Routing** — route work to the right model/provider
  - _(others TBD)_
- Capability relationships / dependencies
- Note: capabilities are product concepts only. This map describes what the
  product can do, never how it is built.
