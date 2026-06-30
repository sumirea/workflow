# @sumirea/schema

The **contract layer** of Sumirea.

This package owns the canonical **workflow definition format**, the shared types
every other package speaks, and the runtime validation that guards them. It is
the root of the dependency graph: it depends on nothing else internal, and
everything else ultimately depends on it.

> New workflow capabilities are defined here *first* — their shape is a contract
> before any engine code runs.

**Depends on:** (nothing internal) · **Status:** scaffold only, no types defined yet.
