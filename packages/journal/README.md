# @sumirea/journal

An **in-memory, append-only record** of Runtime lifecycle events.

The Journal is a pure **consumer** of the events `@sumirea/core` emits. You
inject it as the Runtime's observer; the Runtime never imports or depends on the
Journal, so it stays **orchestration-only**.

```ts
import { createInstance, run } from '@sumirea/core';
import { createJournal } from '@sumirea/journal';

const journal = createJournal();
const done = run(createInstance(definition, { onEvent: journal.observer }));

journal.entries(); // the lifecycle events, in insertion order
```

## What it is today

- **In-memory only.** Events live in the Journal object for its lifetime.
- **Append-only.** Each event the observer receives is pushed onto the list.
- **Verbatim.** Events are stored **by reference**, exactly as the Runtime
  emitted them — no transformation, no wrapping.
- **Ordered by insertion only.** `entries()` returns the events in the order
  they arrived.
- **Read-only access.** `entries()` returns a snapshot; mutating the returned
  array does not change the Journal.

### API

| Export              | Description                                                          |
| ------------------- | -------------------------------------------------------------------- |
| `createJournal()`   | Create a fresh, empty `Journal`.                                     |
| `journal.observer`  | A `LifecycleObserver` to pass as `createInstance`'s `onEvent`.       |
| `journal.entries()` | The recorded events, in insertion order, as a non-mutating snapshot. |

The `LifecycleEvent` and `LifecycleObserver` types are re-exported from
[`@sumirea/core`](../core/README.md).

## What it is not (yet)

The Journal is a primitive. It deliberately does **not** add timestamps,
generated ids, ordering metadata, serialization, filtering, grouping,
aggregation, or a query API. Persistence, Metrics, Timeline, and Event Bus build
on top of this primitive — they are not part of it.

**Depends on:** `@sumirea/core` (types only).
