# Sumirea Product Blueprint

> **Status:** Skeleton (structure only — full content intentionally deferred).
> **Canonical:** Navigational index (not itself a source of truth).

> **What this establishes:** the product documentation _structure_ (the Product
> Blueprint) and the currently approved product decisions (e.g. `surface` as the
> canonical term; the capability vs feature distinction). It does **not** yet
> establish the complete product language — the detailed terminology and the
> full contents of each document will be developed in future PRs. The product
> language is part of the Product Blueprint, not a replacement for it.

This directory holds the **product language** of Sumirea — what it is, why it
exists, who it serves, and what it will (and will not) do. It is distinct from
[`../../ARCHITECTURE.md`](../../ARCHITECTURE.md) (how it is _built_) and from
[`../adr/`](../adr) / [`../rfcs/`](../rfcs) (decisions and design proposals).

## Start here

New to Sumirea? Read these three, in order — the fastest way to understand what
Sumirea is:

1. [identity.md](./identity.md) — what Sumirea is
2. [vision.md](./vision.md) — why it exists and where it's going
3. [capability-map.md](./capability-map.md) — what it can actually do

Everything else builds on these. The full canonical reading order (all 11
documents) is in the [Outline](#outline) below; `terminology.md` is a reference
to dip into at any time, not only at its numbered position.

## Purpose

Give every contributor a single, shared product vocabulary and frame of
reference, so design discussions, RFCs, and roadmaps all speak the same language.

## Scope

The conceptual product model only: identity, vision, principles, non-goals,
terminology, personas, capabilities, features, surfaces, roadmap, and metrics.
No engineering/architecture content; no implementation.

## Canonical status

This index is **not** canonical. The canonical documents are marked below.

Changing a canonical product document is an architectural matter, not a routine
edit: such a change should normally be discussed and introduced through an RFC
(`../rfcs/`) or ADR (`../adr/`) before it becomes canonical.

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

## Reserved future documents

These documents are **anticipated but intentionally not created yet**. They are
reserved here so the blueprint has a home for them when the need is real. Do not
create them until a milestone requires them.

- `use-cases.md` / `scenarios.md` — end-to-end user journeys (the "how it's
  used" narrative that personas + capabilities do not by themselves capture).
- `offerings.md` / `editions.md` — product packaging, segmentation, and
  deployment models (the home for areas like Enterprise and Cloud, which are
  offerings/segments rather than capabilities).
- `ecosystem.md` / `marketplace.md` — the ecosystem and distribution strategy
  (e.g. third-party workflows, discovery, trust) beyond the marketplace
  _capability_ itself.

## Future evolution

The product model documents start as single files and stay that way for now:

- `capability-map.md` and `feature-map.md` are **single files today**.
- If their content grows, each map may become an **index**, with per-item
  detail sinking into a `capabilities/` or `features/` **subfolder**
  (one file per capability / feature).
- **Do not create those subfolders yet** — introduce them only when the volume
  of content genuinely warrants it.
