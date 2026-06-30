# Terminology

> **Status:** Skeleton (structure only — full content intentionally deferred).
> Part of the Sumirea Product Blueprint (`docs/product/`).

## Purpose

Define the **ubiquitous language** of Sumirea — one agreed meaning per term —
so product docs, RFCs, ADRs, and code all use words the same way.

## Scope

- In: canonical definitions of core nouns (workflow, step, surface, capability,
  feature, persona, port, adapter, etc.), including which words are _not_ formal
  terms.
- Out: deep design of any concept (definitions point to the doc that owns each
  concept's detail).

## Canonical status

**Canonical (highest precedence).** The single dictionary for the whole project.
Where `ARCHITECTURE.md` and the product docs use the same word, this file
governs its meaning. No other document may redefine a term defined here.

## Relationship to other documents

- Referenced by every other product document and by `ARCHITECTURE.md`.
- Resolves cross-document term clashes (see "Decisions captured" below).

## Outline

- How to read this glossary (term · definition · owning doc · status)
- Core terms: workflow, step, run; capability vs feature (per ratified
  definitions); surface; persona; port; adapter; SDK
- **Decisions captured:**
  - **`surface`** is the only formal term for a delivery channel (browser
    extension, CLI, docs site, future IDE extension, MCP server). **`client`**
    is _not_ a formal Sumirea term — only plain English.
  - **capability** = long-term, abstract, cross-surface platform ability
    ("what Sumirea can do"); **feature** = concrete thing a user perceives,
    uses, configures, or triggers ("what the user actually gets").
- Deprecated / forbidden terms (and their canonical replacements)
