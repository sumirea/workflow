# Feature Map

> **Status:** Skeleton (structure only — full content intentionally deferred).
> Part of the Sumirea Product Blueprint (`docs/product/`).

## Purpose

Enumerate the concrete, user-perceivable **features** and map each back to the
capability it realizes — answering "**what does the user actually get?**"

## Scope

- In: features a user can directly perceive, use, configure, or trigger, grouped
  under their parent capability.
- Out: the abstract abilities themselves (→ `capability-map.md`); delivery
  channels (→ `surface-map.md`); sequencing (→ `roadmap.md`).

> **Definition (ratified):** a **feature** is a concrete thing a user perceives,
> uses, configures, or triggers — the tangible counterpart of a capability.

## Canonical status

**Not canonical** (evolving). Features change frequently; the capability they
serve (in `capability-map.md`) is the stable anchor.

## Relationship to other documents

- Child of `capability-map.md` (every feature names its parent capability).
- Sequenced by `roadmap.md`.
- Exposed through one or more surfaces in `surface-map.md`.

## Outline

- How to read the map (feature · parent capability · persona · status)
- Features by capability (illustrative, **not yet ratified**):
  - **Workflow Engine** → create workflow, validate workflow, import/export
    workflow, run workflow
  - **Rule Engine** → condition matching, auto trigger, retry, delay
  - **AI Routing** → BYOK provider setup, capability-based model routing, local
    model routing
- Feature → surface exposure (traceability hint into `surface-map.md`)
