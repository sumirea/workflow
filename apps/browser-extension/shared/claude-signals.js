// shared/claude-signals.js
//
// The ONE place that knows anything about the Claude Code Web DOM. Every other
// file depends only on the abstract state this returns, never on selectors.
// When Claude Code Web changes its markup, this is the only file that changes.
//
// Design rules (see README):
//   1. Conservative fail-safe. If the anchors we rely on are not present, we
//      return 'unsupported' and the extension stays silent. We NEVER guess
//      broadly, because a false "waiting" would fire a wrong notification and
//      destroy trust.
//   2. Real anchors are NOT verified yet. The exact, stable selectors for the
//      "Claude is waiting for you" state must be captured from an authenticated
//      Claude Code Web session (milestone M1) and filled into `detectFromDom`.
//      Until then `detectFromDom` returns 'unsupported' on purpose.
//   3. A documented test hook lets us prove the whole pipeline end-to-end today
//      without those selectors: set `data-sumirea-test-state` on <html> to
//      "waiting" | "working" | "unsupported".
//
// States:
//   'waiting'     : Claude needs the human (finished, or asking / prompting).
//   'working'     : Claude is busy; nothing for the human to do.
//   'unsupported' : we cannot tell; fail safe, do nothing.

(function attachClaudeSignals(global) {
  const STATE = Object.freeze({
    WAITING: 'waiting',
    WORKING: 'working',
    UNSUPPORTED: 'unsupported',
  });

  const TEST_ATTR = 'data-sumirea-test-state';

  // Detect the state from the live DOM.
  //
  // TODO(M1: verify against authenticated Claude Code Web): replace the body
  // below with high-confidence, verified anchors. It must only return WAITING
  // on a genuine human-required signal (e.g. an approval dialog is present, or
  // generation has ended and the composer is idle awaiting input). Anything
  // uncertain must return UNSUPPORTED. Do not add broad guesses here.
  function detectFromDom(_doc) {
    return STATE.UNSUPPORTED;
  }

  // The public entry point. Applies the documented test hook first, then falls
  // back to (currently fail-safe) real detection.
  function getState(doc) {
    const root = doc && doc.documentElement;
    if (!root) return STATE.UNSUPPORTED;

    const forced = root.getAttribute(TEST_ATTR);
    if (forced === STATE.WAITING || forced === STATE.WORKING || forced === STATE.UNSUPPORTED) {
      return forced;
    }

    return detectFromDom(doc);
  }

  global.SumireaClaudeSignals = { STATE, TEST_ATTR, getState };
})(globalThis);
