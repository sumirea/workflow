# @sumirea/browser-extension — Waiting for You (MVP)

A Chrome MV3 extension that does exactly one thing: **tell you when Claude Code
Web is waiting for you**, and bring you back to the tab when you click the
notification.

It embodies Sumirea's product philosophy:

- **Protect Cognitive Bandwidth** — walk away from long AI tasks; get pulled
  back only when you are needed.
- **Human in Control** — it **never** clicks, approves, or changes the page. It
  only observes and notifies.

## What it does

1. Runs a content script only on `https://claude.ai/*`.
2. Watches for the transition into the "Claude is waiting for you" state.
3. Shows **one** desktop notification per waiting episode — but only when you are
   **away** from the tab (a hidden tab, or an unfocused window). If you are
   looking at it, it stays quiet; the notification arrives the moment you walk
   away and it is still waiting.
4. Clicking the notification focuses the original Claude tab and window.
5. A popup master switch turns it on/off and shows a trivial "brought you back"
   count.

## Architecture

```
popup/            master on/off switch + status
  index.html
  popup.js
content/
  content.js      MutationObserver -> observe state -> wire the edge to chrome
shared/
  claude-signals.js   the ONLY file that knows the Claude DOM (see below)
  waiting-edge.js     pure working -> waiting rising-edge machine (no DOM/chrome)
background/
  service-worker.js   creates the notification, returns to the tab/window
test/
  waiting-edge.test.mjs    pins the edge semantics (fire once, re-arm, fail safe)
  claude-signals.test.mjs  test hook works; real detection stays fail-safe
manifest.json     MV3, minimum permissions
icons/            see icons/README.md (production icons pending)
```

The decision of _when_ to notify lives in `shared/waiting-edge.js` as a pure
state machine with no DOM or `chrome` dependency, so it is unit-tested directly.
`content/content.js` only observes the page (via `claude-signals.js`) and wires
that machine's output to `chrome.runtime`.

## Tests

```
pnpm --filter @sumirea/browser-extension test
```

Automated tests cover the two pieces of pure logic — the rising-edge machine and
the signals adapter's contract (the documented test hook works, and real
detection stays `unsupported` until verified selectors land, so it can never
invent a false "waiting"). The tests load the shipped content-script files as-is
in a VM context, so there is no build step and no source change just for
testing. The live DOM behaviour is still exercised manually (below), since that
depends on the real Claude Code Web markup.

### Real-browser integration test (optional)

```
pnpm --filter @sumirea/browser-extension test:browser
```

This loads the actual MV3 extension into Chromium (via `playwright-core`),
drives the built-in test hook on a page the content script is injected into, and
asserts the whole pipeline reacts end to end: content script -> background
service worker -> `chrome.storage`. It proves the wiring the unit tests cannot
(message passing, the service worker, the manifest), and confirms the
fire-once / re-arm / fail-safe semantics survive a real browser.

It is kept out of `pnpm test` on purpose (the `.e2e.mjs` name is outside the
unit-test glob): it needs Playwright and a Chromium binary, which are not part
of the normal test path. The "only notify when you are away" gate reads real
focus / visibility, which an automation browser keeps as "present"; the test
forces presence to "away" in a throwaway copy of the extension so it can
exercise the rest of the wiring (the shipped code is untouched, and the gate
itself is covered by the unit tests).

## Packaging

```
pnpm --filter @sumirea/browser-extension package
```

Produces `dist/sumirea-waiting-for-you-<version>.zip` (manifest at the root plus
only the files the browser loads — dev files excluded) for upload to the Chrome
Web Store. For local development, load the folder unpacked instead (below).

Permissions requested (minimum):

- `notifications` — to show the desktop notification (the core output).
- `storage` — to persist the on/off switch and the count, and to map a
  notification back to its tab/window across service-worker restarts.
- host `https://claude.ai/*` — to inject the content script and read the page.

No `tabs` permission is needed: the content script's message carries
`sender.tab.id`, and activating a known tab id does not require it.

## Known limitation — selector verification is pending

**The exact, stable DOM anchors for the "waiting" state are not yet verified.**
They must be captured from a real, authenticated Claude Code Web session and
filled into the single adapter `shared/claude-signals.js` (the `detectFromDom`
function). Until then, `detectFromDom` returns `unsupported` **on purpose**, so
the extension **fails safe and stays silent** on the live site rather than
firing false notifications.

All Claude-specific DOM knowledge is isolated to that one file. When Claude Code
Web changes its markup, that is the only file that changes.

## Manual testing

Load unpacked:

1. Open `chrome://extensions`, enable **Developer mode**.
2. **Load unpacked** → select this `apps/browser-extension/` folder.
3. Allow notifications for Chrome at the OS level if prompted.

Verify the real workflow using the built-in test hook (which drives the state
without needing verified selectors):

- **Content script scope**: open `https://claude.ai/` — the content script
  runs. Open any other site — it does not.
- **Popup switch persists**: toggle Enabled off, reopen the popup — it stays
  off. Toggle back on.
- **One notification on waiting**: on a `claude.ai` tab, in DevTools console run
  `document.documentElement.setAttribute('data-sumirea-test-state','working')`
  then `...setAttribute('data-sumirea-test-state','waiting')`. Exactly **one**
  notification appears. Setting it to `waiting` again without leaving the state
  does **not** produce a second one.
- **Return to tab**: switch to a different window, click the notification —
  focus returns to the original Claude tab and window.
- **Disabled mode suppresses**: turn the popup switch off, repeat the waiting
  transition — no notification appears.
- **Unsupported fails silent**: set
  `document.documentElement.setAttribute('data-sumirea-test-state','unsupported')`
  (or remove the attribute) — no notification, no errors. This is also the live
  default until selectors are verified.

## Not in this MVP

Other sites (Cursor, ChatGPT, GitHub, terminal/CI), a "needs-human" inbox,
per-site toggles, sound/custom notifications, and any kind of auto-action are
deliberately out of scope. See the product plan.
