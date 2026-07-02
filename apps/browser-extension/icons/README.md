# Icons

Production icons are pending. This MVP intentionally ships without packaged
icon assets:

- The **notification** uses a tiny inline transparent PNG (see
  `background/service-worker.js`), so no binary asset is required to function.
- The **toolbar action** and **extension listing** fall back to Chrome's default
  icon; `manifest.json` does not reference icon files, so loading unpacked
  produces no missing-asset errors.

When branding is ready, add `icon16.png`, `icon48.png`, and `icon128.png` here,
reference them from `manifest.json` (`action.default_icon` and top-level
`icons`), and use `icon128.png` for the notification `iconUrl`.
