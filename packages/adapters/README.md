# @sumirea/adapters

The **integration boundary**.

`adapters` provides concrete implementations of the **ports** that
`@sumirea/core` defines — the seams where Sumirea touches the outside world:

- **AI providers** — anything that can complete a prompt / run a model.
- **Version control** — read/write a repository (e.g. git, GitHub, GitLab).
- **Editors** — surfaces that host an editing session.
- **Storage** — where workflow state and artifacts live.

Adapters are **injected** at the edges (by the `sdk` or a surface), never
imported by `core`. This is what keeps provider churn at the boundary and lets
contributors add integrations without reshaping the engine.

**Depends on:** `@sumirea/schema`, `@sumirea/core` (port types) · **Status:**
scaffold only.
