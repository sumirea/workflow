# @sumirea/sdk

The **public, stable API**.

The `sdk` composes `@sumirea/core` with a chosen set of `@sumirea/adapters` into
the single entry point that embedders and surfaces use. It is the seam between
the product and everything that consumes it.

> Surfaces (`apps/*`) depend on the `sdk` and **never reach past it** into
> `core`. When the API here is stable, the engine underneath can evolve freely.

**Depends on:** `@sumirea/schema`, `@sumirea/core`, `@sumirea/adapters` ·
**Status:** scaffold only.
