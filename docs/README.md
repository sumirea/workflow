# Project documentation

This directory holds **project** documentation — how Sumirea is designed and
how decisions are made. (The user-facing documentation _website_ is a separate
app at [`apps/docs`](../apps/docs).)

- [`../ARCHITECTURE.md`](../ARCHITECTURE.md) — the canonical structure and rules.
- [`CANONICAL_PRODUCT_LANGUAGE.md`](./CANONICAL_PRODUCT_LANGUAGE.md) — the
  official product language specification that all documentation, RFCs, ADRs,
  issues, and implementation work must reference.
- [`adr/`](./adr) — Architecture Decision Records: short, immutable notes
  capturing a decision and its context.
- [`rfcs/`](./rfcs) — Requests for Comments: proposals for larger or
  cross-cutting changes, discussed before implementation.

## When to use which

| Situation                                            | Use                               |
| ---------------------------------------------------- | --------------------------------- |
| A decision was made; record what and why             | ADR                               |
| A change needs design and discussion before building | RFC                               |
| The decision reshapes architecture or public API     | RFC → then an ADR for the outcome |
