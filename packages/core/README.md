# @sumirea/core

The **workflow engine** — this is the product.

`core` holds the domain model, step execution, and orchestration that define
what a Sumirea workflow _is_ and how it runs. It is deliberately **pure** and
**surface-agnostic**: no network, no filesystem, no direct clock or randomness.
Anything external (a model call, a repository read) arrives through a **port** —
a narrow interface that `core` defines and an adapter implements.

This is what makes the same workflow behave identically in the extension, the
CLI, and any future surface.

**Depends on:** `@sumirea/schema` · **Must not import:** `@sumirea/adapters`
(adapters are injected, never referenced) · **Status:** scaffold only.
