// @sumirea/adapters — the integration boundary.
//
// Concrete implementations of the ports that @sumirea/core defines: AI
// providers, version-control hosts, editors, and storage backends. Adapters are
// wired in at the edges (by the sdk or a surface) and injected into core — core
// never imports this package.
//
// Keeping integrations here means provider churn stays at the edge, and the
// community can add new integrations without touching the engine.
//
// Placeholder: no adapters implemented yet. See ARCHITECTURE.md.
export {};
