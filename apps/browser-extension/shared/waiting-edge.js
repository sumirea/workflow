// shared/waiting-edge.js
//
// Pure rising-edge detector for the working -> waiting transition. No DOM and
// no chrome APIs live here, so it is fully unit-testable and shared by the
// content script.
//
// Contract: feed it the current state on each observation. next(state) returns
// true exactly once per "waiting episode" — the first observation of WAITING
// after a known non-waiting state (or as the very first observation). A known
// non-waiting state (e.g. WORKING) re-arms it. UNSUPPORTED is inert: it never
// fires and never changes the arming, so a momentary "can't tell" can neither
// consume nor trigger an edge. This is what keeps one waiting episode to at
// most one notification, and prevents false fires.

(function (global) {
  function createWaitingEdge({ states }) {
    const { WAITING, UNSUPPORTED } = states;

    // The last known non-UNSUPPORTED state. null means "armed from the start".
    let last = null;

    return {
      // Returns true iff this observation is the rising edge into WAITING.
      next(state) {
        if (state === UNSUPPORTED) return false;
        if (state === WAITING) {
          if (last !== WAITING) {
            last = WAITING;
            return true;
          }
          return false;
        }
        // Any known non-waiting state re-arms the edge for the next episode.
        last = state;
        return false;
      },

      // Re-arm as if freshly constructed.
      reset() {
        last = null;
      },

      get last() {
        return last;
      },
    };
  }

  global.SumireaWaitingEdge = { createWaitingEdge };
})(globalThis);
