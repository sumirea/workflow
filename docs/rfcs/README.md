# RFCs

The RFC ("Request for Comments") process is how Sumirea makes larger or
cross-cutting decisions in the open, *before* they are built.

## When an RFC is needed

Open an RFC when a change:

- alters the architecture or a package boundary,
- adds or changes a public API (`@sumirea/sdk`, the `@sumirea/schema` format),
- introduces a major dependency or a new surface, or
- otherwise affects contributors broadly.

Small, local changes do not need an RFC — just a pull request.

## Process

1. Copy [`0000-template.md`](./0000-template.md) to
   `NNNN-short-title.md` (use the next free number).
2. Fill it in and open a pull request. Discussion happens on the PR.
3. When consensus is reached, the RFC is merged as **Accepted** (or closed).
4. The resulting decision is recorded as an ADR in [`../adr/`](../adr).
