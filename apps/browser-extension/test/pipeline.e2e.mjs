// test/pipeline.e2e.mjs
//
// Real-browser integration test: loads the actual MV3 extension into Chromium,
// drives the documented test hook on a page the content script is injected into,
// and asserts the whole pipeline reacts: content script -> background service
// worker -> chrome.storage. This complements the unit tests (which cover the
// pure logic) by proving the wiring works in a real browser.
//
// Not part of `pnpm test`: it needs Playwright and a Chromium (hence the
// `.e2e.mjs` name, which the unit-test glob skips). Run it with:
//   pnpm --filter @sumirea/browser-extension test:browser
//
// Note on presence: the "only notify when you are away" gate reads real focus /
// visibility, which an automation browser keeps as "present", so it never reads
// "away" here. The gate itself is covered by the unit tests (and observably
// blocks when present). To exercise the rest of the wiring we force presence to
// "away" in a throwaway copy of the extension; the shipped code is untouched.

import { createRequire } from 'node:module';
import http from 'node:http';
import { cpSync, existsSync, mkdtempSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const { chromium } = createRequire(import.meta.url)('playwright-core');

// Resolve a full Chromium that actually exists. Prefer an explicit override,
// then Playwright's own resolution, then any pre-installed browser under
// PLAYWRIGHT_BROWSERS_PATH (versions can differ from the installed playwright).
function resolveChromium() {
  const env = process.env.SUMIREA_CHROME;
  if (env && existsSync(env)) return env;
  try {
    const p = chromium.executablePath();
    if (existsSync(p)) return p;
  } catch {
    /* fall through */
  }
  const base = process.env.PLAYWRIGHT_BROWSERS_PATH;
  if (base && existsSync(base)) {
    for (const d of readdirSync(base)) {
      if (!d.startsWith('chromium-') || d.includes('headless')) continue;
      for (const sub of ['chrome-linux/chrome', 'chrome-linux64/chrome']) {
        const p = join(base, d, sub);
        if (existsSync(p)) return p;
      }
    }
  }
  return chromium.executablePath(); // let Playwright throw a helpful error
}

const SRC = join(dirname(fileURLToPath(import.meta.url)), '..');
const PORT = 8197;
const ORIGIN = `http://localhost:${PORT}`;

// A tiny page the content script can attach to (the manifest is patched below
// to match this origin, so we do not need the real claude.ai).
const server = http.createServer((_req, res) => {
  res.writeHead(200, { 'content-type': 'text/html' });
  res.end('<!doctype html><html><head><title>ext test</title></head><body>test</body></html>');
});
await new Promise((r) => server.listen(PORT, r));

// Throwaway copy of the extension: add the test origin to the matches and force
// presence to "away" (see the note above). The real files are not modified.
const dir = mkdtempSync(join(tmpdir(), 'sumirea-ext-'));
cpSync(SRC, dir, {
  recursive: true,
  filter: (s) => !s.includes('/node_modules') && !s.endsWith('/dist'),
});
const mf = JSON.parse(readFileSync(join(dir, 'manifest.json'), 'utf8'));
mf.content_scripts[0].matches.push(`${ORIGIN}/*`);
mf.host_permissions.push(`${ORIGIN}/*`);
writeFileSync(join(dir, 'manifest.json'), JSON.stringify(mf, null, 2));
{
  const p = join(dir, 'content/content.js');
  writeFileSync(
    p,
    readFileSync(p, 'utf8').replace(
      "return document.visibilityState === 'hidden' || !document.hasFocus();",
      'return true; /* forced away for integration test */',
    ),
  );
}

const fails = [];
const ok = (name, cond) => {
  console.log((cond ? '  ok  ' : '  XX  ') + name);
  if (!cond) fails.push(name);
};

const ctx = await chromium.launchPersistentContext(join(dir, '.profile'), {
  // Extensions require the full Chromium (not the headless shell), so point at
  // the resolved full binary explicitly. Still dynamic / not hardcoded.
  executablePath: resolveChromium(),
  headless: true,
  args: [
    '--no-sandbox',
    '--disable-dev-shm-usage',
    '--headless=new',
    `--disable-extensions-except=${dir}`,
    `--load-extension=${dir}`,
  ],
});

let [sw] = ctx.serviceWorkers();
if (!sw) sw = await ctx.waitForEvent('serviceworker');
const count = () => sw.evaluate(async () => (await chrome.storage.local.get('count')).count || 0);

const page = await ctx.newPage();
await page.goto(`${ORIGIN}/`, { waitUntil: 'load' });

const setState = async (s) => {
  await page.evaluate(
    (v) => document.documentElement.setAttribute('data-sumirea-test-state', v),
    s,
  );
  await page.waitForTimeout(450); // content.js debounce (250ms) + async message
};

ok('starts at count 0', (await count()) === 0);

await setState('working');
await setState('waiting');
await page.waitForTimeout(200);
ok('working -> waiting fires once (count 1)', (await count()) === 1);

await setState('waiting');
ok('staying waiting does not re-fire (count 1)', (await count()) === 1);

await setState('working');
await setState('waiting');
await page.waitForTimeout(200);
ok('re-arms and fires again on the next episode (count 2)', (await count()) === 2);

await setState('unsupported');
ok('unsupported does not fire (count 2)', (await count()) === 2);

await ctx.close();
server.close();

console.log(
  '\n' +
    (fails.length
      ? `E2E FAIL: ${fails.length}`
      : 'E2E PASS: full pipeline works in a real browser'),
);
process.exit(fails.length ? 1 : 0);
