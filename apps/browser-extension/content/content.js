// content/content.js
//
// Injected only on https://claude.ai/*. It watches for the transition into the
// "Claude is waiting for you" state and, on that edge, asks the background
// worker to notify the user. It never clicks, approves, or changes the page.
//
// All DOM knowledge lives in shared/claude-signals.js and the edge logic in
// shared/waiting-edge.js (both loaded before this file in the same content-
// script world, exposed on globalThis). This file only wires them to chrome.

(function () {
  const signals = globalThis.SumireaClaudeSignals;
  const edgeApi = globalThis.SumireaWaitingEdge;
  if (!signals || !edgeApi) return; // adapter or edge missing, fail safe.

  const { STATE, getState } = signals;

  // Fires only on the edge into WAITING and re-arms once Claude leaves it, so
  // one waiting episode produces at most one notification.
  const edge = edgeApi.createWaitingEdge({ states: STATE });
  let enabled = true;

  // Load the master switch and keep it current.
  chrome.storage.local.get('enabled').then(({ enabled: e = true }) => {
    enabled = e !== false;
    evaluate();
  });
  chrome.storage.onChanged.addListener((changes, area) => {
    if (area === 'local' && changes.enabled) enabled = changes.enabled.newValue !== false;
  });

  // Are we away from this tab right now? A hidden tab, or a visible tab in an
  // unfocused window, both count as away. If you are looking at the tab, there
  // is nothing to bring you back to, so we stay quiet.
  function isAway() {
    return document.visibilityState === 'hidden' || !document.hasFocus();
  }

  function evaluate() {
    // The edge machine advances regardless of `enabled` so that toggling the
    // switch never causes a stale re-fire; `enabled` only gates the send.
    if (edge.next(getState(document), isAway()) && enabled) {
      chrome.runtime.sendMessage({ type: 'claude-waiting', url: location.href });
    }
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

  // Re-evaluate when you leave or return, so a notification can fire the moment
  // you walk away from a tab that is already waiting.
  document.addEventListener('visibilitychange', schedule);
  window.addEventListener('blur', schedule);
  window.addEventListener('focus', schedule);

  // Initial read in case the page is already in a waiting state on load.
  evaluate();
})();
