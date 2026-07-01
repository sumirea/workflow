# Product Principles

> **Status:** Skeleton (structure only — full content intentionally deferred).
> Part of the Sumirea Product Blueprint (`docs/product/`).

**Product principles guide product decisions. Engineering rules belong in
ARCHITECTURE.md.**

## Purpose

Capture the **product** principles and values that guide trade-offs — the
durable "how we decide" rules a reviewer can cite when two good options
conflict.

## Scope

- In: product/design principles and the trade-offs they imply (e.g. how we
  weigh openness, surface-agnosticism, user control, simplicity).
- Out: **engineering** rules such as the dependency direction — those live in
  [`../../ARCHITECTURE.md`](../../ARCHITECTURE.md) and must not be duplicated
  here. One-time decisions belong in `../adr/`.

## Canonical status

**Canonical.** The authoritative set of product principles. RFC and product
reviews may cite these directly to justify or reject a direction.

## Relationship to other documents

- Operationalizes `vision.md` into decision rules.
- Paired with `non-goals.md` (principles say _how_ we choose; non-goals say
  _what_ we refuse).
- Complements but never restates `ARCHITECTURE.md`'s engineering rules.

## Outline

- Principle list (each: statement → rationale → what it rules in/out)
- Trade-off priorities (what wins when principles collide)
- How to apply principles in reviews/RFCs
- Explicitly: relationship to (not duplication of) engineering rules
