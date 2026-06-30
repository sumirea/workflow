# @sumirea/typescript-config

Internal, shared TypeScript compiler presets for the Sumirea monorepo. Not
published.

- `base.json` — strict defaults inherited from the repo-root `tsconfig.base.json`.
- `library.json` — adds `outDir`/`rootDir` conventions for buildable packages.

Consume from a package's `tsconfig.json`:

```json
{ "extends": "@sumirea/typescript-config/library.json" }
```
