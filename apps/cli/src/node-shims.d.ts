// Minimal, type-only declarations for the Node built-ins the CLI imports. These
// keep the package dependency-free (no `@types/node`) and are declaration-only
// (nothing is emitted); Node provides the real implementations at runtime. Only
// the members the CLI actually uses are declared.

declare module 'node:path' {
  export function resolve(...segments: string[]): string;
}

declare module 'node:url' {
  export function pathToFileURL(path: string): { readonly href: string };
}
