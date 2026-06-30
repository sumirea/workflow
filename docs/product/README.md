# Sumirea Product Blueprint

> **Status:** Skeleton (structure only — full content intentionally deferred).
> **Canonical:** Navigational index (not itself a source of truth).

This directory holds the **product language** of Sumirea — what it is, why it
exists, who it serves, and what it will (and will not) do. It is distinct from
[`../../ARCHITECTURE.md`](../../ARCHITECTURE.md) (how it is _built_) and from
[`../adr/`](../adr) / [`../rfcs/`](../rfcs) (decisions and design proposals).

## Purpose

Give every contributor a single, shared product vocabulary and frame of
reference, so design discussions, RFCs, and roadmaps all speak the same language.

## Scope

The conceptual product model only: identity, vision, principles, non-goals,
terminology, personas, capabilities, features, surfaces, roadmap, and metrics.
No engineering/architecture content; no implementation.

## Canonical status

This index is **not** canonical. The canonical documents are marked below.

## Relationship to other documents

- Feeds `../rfcs/` (problem space → design proposals) and `../adr/` (decisions).
- Complements `../../ARCHITECTURE.md`; the two must not redefine each other's
  terms — `terminology.md` is the shared dictionary for both.

## Outline

Reading order and canonical map (✅ = canonical source of truth):

| #   | Document                                 | Layer         | Canonical |
| --- | ---------------------------------------- | ------------- | --------- |
| 1   | [identity.md](./identity.md)             | Positioning   | ✅        |
| 2   | [vision.md](./vision.md)                 | Positioning   | —         |
| 3   | [principles.md](./principles.md)         | Guardrail     | ✅        |
| 4   | [non-goals.md](./non-goals.md)           | Guardrail     | ✅        |
| 5   | [terminology.md](./terminology.md)       | Language      | ✅        |
| 6   | [personas.md](./personas.md)             | Audience      | —         |
| 7   | [capability-map.md](./capability-map.md) | Product model | ✅        |
| 8   | [feature-map.md](./feature-map.md)       | Product model | —         |
| 9   | [surface-map.md](./surface-map.md)       | Product model | —         |
| 10  | [roadmap.md](./roadmap.md)               | Execution     | —         |
| 11  | [metrics.md](./metrics.md)               | Execution     | —         |
