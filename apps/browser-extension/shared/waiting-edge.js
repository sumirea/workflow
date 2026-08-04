// shared/waiting-edge.js
//
// Pure decision machine for the Waiting for You MVP. No DOM and no chrome APIs
// live here, so it is fully unit-testable and shared by the content script.
//
// It answers one question on each observation: should we notify *now*? It fires
// at most once per "waiting episode", at the first moment the human is BOTH
// needed (state === WAITING) and away from the tab. That means:
//   - if Claude starts waiting while you are watching the tab, nothing fires;
//     the notification arrives the moment you walk away (and it is still
//     waiting), not before, and not twice;
//   - a known non-waiting state (e.g. WORKING) ends the episode and re-arms;
//   - UNSUPPORTED is inert: it never fires and never changes the episode, so a
//     momentary "can't tell" can neither trigger nor consume an episode.

(function (global) {
  function createWaitingEdge({ states }) {
    const { WAITING, UNSUPPORTED } = states;

    let inEpisode = false; // currently observing a waiting episode
    let notified = false; // already fired for the current episode

    return {
      // state: the current observed state.
      // away:  is the human away from the tab right now? Defaults to true so a
      //        caller that does not care about presence keeps the plain
      //        "fire on the rising edge into waiting" behaviour.
      // Returns true iff we should notify now.
      next(state, away = true) {
        if (state === UNSUPPORTED) return false;
        if (state === WAITING) {
          inEpisode = true;
          if (!notified && away) {
            notified = true;
            return true;
          }
          return false;
        }
        // Any known non-waiting state ends the episode and re-arms.
        inEpisode = false;
        notified = false;
        return false;
      },

      reset() {
        inEpisode = false;
        notified = false;
      },

      get waiting() {
        return inEpisode;
      },
      get notified() {
        return notified;
      },
    };
  }

  global.SumireaWaitingEdge = { createWaitingEdge };
})(globalThis);
