# 1. Record architecture decisions

- Status: Accepted
- Date: 2026-06-30

## Context

Sumirea is a long-term open-source project with many future contributors. Design
decisions made early (repository structure, dependency direction, toolchain) are
costly to reverse and easy to forget the reasoning behind. We need a lightweight,
durable way to capture *why* a decision was made, not just *what* the code does.

## Decision

We will keep Architecture Decision Records (ADRs) in `docs/adr/`. Each ADR is a
short Markdown file, numbered sequentially, capturing the context, the decision,
and its consequences. ADRs are immutable once accepted: to change a decision, we
add a new ADR that supersedes the old one rather than editing history.

Larger proposals that need discussion before a decision exists go through the
RFC process in `docs/rfcs/` first; the resulting decision is then recorded as an
ADR.

## Consequences

- New contributors can read the decision history to understand the project.
- Reviewers have a reference for whether a change respects prior decisions.
- The overhead is one small file per significant decision.
