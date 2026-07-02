// content/content.js
//
// Injected only on https://claude.ai/*. It watches for the transition into the
// "Claude is waiting for you" state and, on that edge, asks the background
// worker to notify the user. It never clicks, approves, or changes the page.
//
// All DOM knowledge lives in shared/claude-signals.js (loaded before this file
// in the same content-script world, exposed as globalThis.SumireaClaudeSignals).

(function () {
  const signals = globalThis.SumireaClaudeSignals;
  if (!signals) return; // adapter missing — fail safe.

  const { STATE, getState } = signals;

  // The last non-"waiting" observation. We fire only on the edge into WAITING,
  // and re-arm once Claude leaves the waiting state — so one waiting episode
  // produces at most one notification.
  let lastState = null;
  let enabled = true;

  // Load the master switch and keep it current.
  chrome.storage.local.get('enabled').then(({ enabled: e = true }) => {
    enabled = e;
    evaluate();
  });
  chrome.storage.onChanged.addListener((changes, area) => {
    if (area === 'local' && changes.enabled) enabled = changes.enabled.newValue !== false;
  });

  function evaluate() {
    const state = getState(document);

    // Unsupported: cannot tell — stay silent and do not change the arming edge.
    if (state === STATE.UNSUPPORTED) return;

    if (state === STATE.WAITING) {
      if (lastState !== STATE.WAITING) {
        lastState = STATE.WAITING;
        if (enabled) {
          chrome.runtime.sendMessage({ type: 'claude-waiting', url: location.href });
        }
      }
      return;
    }

    // Any known non-waiting state re-arms the edge for the next episode.
    lastState = state;
  }

  // Debounce: the SPA mutates the DOM constantly; coalesce bursts.
  let timer = null;
  function schedule() {
    if (timer !== null) return;
    timer = setTimeout(() => {
      timer = null;
      evaluate();
    }, 250);
  }

  const observer = new MutationObserver(schedule);
  observer.observe(document.documentElement, {
    subtree: true,
    childList: true,
    attributes: true,
  });

  // Initial read in case the page is already in a waiting state on load.
  evaluate();
})();
