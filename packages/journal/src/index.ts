// @sumirea/journal — an in-memory, append-only record of Runtime lifecycle events.
//
// The Journal is a pure *consumer* of the Runtime's lifecycle events. It is
// injected by callers as the Runtime's observer —
// `createInstance(definition, { onEvent: journal.observer })` — so the Runtime
// stays orchestration-only and never imports or depends on the Journal. As each
// event arrives, the Journal appends it, by reference, to an in-memory list and
// exposes that list read-only.
//
// It is deliberately minimal: it does not transform events, and it adds no
// timestamps, ids, ordering metadata, serialization, filtering, grouping,
// aggregation, or query API. The only ordering is array insertion order. Those
// capabilities (Persistence, Metrics, Timeline, Event Bus) build on top of this
// primitive; they are not part of it.

import type { LifecycleEvent, LifecycleObserver } from '@sumirea/core';

// Re-export the event contract so Journal consumers can name the types without
// reaching into @sumirea/core directly.
export type { LifecycleEvent, LifecycleObserver } from '@sumirea/core';

/**
 * An in-memory, append-only record of the lifecycle events it receives.
 *
 * `observer` is a `LifecycleObserver` to hand to the Runtime; every event it is
 * called with is appended verbatim. `entries()` returns the recorded events in
 * insertion order — a snapshot the caller cannot use to mutate the Journal's
 * internal list.
 */
export interface Journal {
  /** The observer to pass as `createInstance`'s `onEvent`. Appends each event. */
  readonly observer: LifecycleObserver;
  /** The recorded events, in insertion order, as a non-mutating snapshot. */
  entries(): readonly LifecycleEvent[];
}

/**
 * Create a fresh, empty Journal. Events are stored by reference exactly as the
 * Runtime emits them; nothing is generated, transformed, or interpreted.
 */
export function createJournal(): Journal {
  const events: LifecycleEvent[] = [];
  return {
    observer: (event) => {
      events.push(event);
    },
    // Return a shallow copy so callers cannot mutate the internal list. The
    // event objects themselves are shared by reference, unchanged.
    entries: () => events.slice(),
  };
}
