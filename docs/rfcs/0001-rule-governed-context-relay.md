# RFC 0001: Rule-governed Context Relay

- Status: Draft <!-- Draft | Proposed | Accepted | Rejected | Superseded -->
- Author(s): Sumirea
- Date: 2026-08-13
- Tracking PR: https://github.com/sumirea/workflow/pull/28

## Summary

A capability that lets two AI tools (for example Codex and Claude Code, open
side by side) collaborate on a task while the developer keeps control. Sumirea
observes both conversations, prepares the context that should move from one to
the other, and relays it. Routine, low-stakes relays flow automatically only
within Rules the developer has authored; anything outside those Rules, or
anything consequential, pauses at a Checkpoint and pings the developer to
decide. Sumirea never sends a consequential message on its own authority.

## Motivation

Developers increasingly drive a task across two AI tools at once: one to think,
one to build. All day they copy the last answer from one, read it, and paste it
into the other. That shuttling is a stream of Micro Decisions ("does this reply
warrant moving over? which part?") that drains Cognitive Bandwidth without
needing creativity.

The tempting solution is full automation: let the two tools talk to each other
and turn the human into a spectator, pinged only for "decisions". Sumirea
deliberately rejects that. A spectator loop drifts, makes consequential calls
the human should own, and loses the human's context and trust. Sumirea's bet is
the opposite: automate the shuttling, keep the human holding the wheel, and only
interrupt when a human decision is genuinely required. This is Workflow
Coordination in the human-in-control form, and it is what distinguishes Sumirea
from full-auto tools.

## Guide-level explanation

Sumirea watches both tools through per-tool Adapters (the only code that knows
each tool's page), exposing an abstract per-side state and the latest turn. From
that it does two things:

1. **Prepare.** It drafts the relay: which part of side A's latest turn should
   move to side B, trimmed to the minimal Context. Nothing is sent yet.
2. **Decide who sends.** A Policy (a named set of the developer's Rules) is
   evaluated against the prepared relay:
   - If a Rule explicitly permits it, Automation sends it. This is the fast
     path, and it only ever covers cases the developer opted in to.
   - Otherwise the relay stops at a Checkpoint: a quiet "ding" and a one-click
     "send / edit / skip". This is a Handoff back to the human.

The default is safe: with no Rules authored, nothing sends automatically. Every
relay is a Checkpoint. Rules only ever make more of what the developer already
chose become automatic; they never widen Sumirea's authority beyond what the
developer set, and they are always inspectable and reversible.

Example Rules a developer might author:

- Auto-relay when side A's turn is only a clarifying question and contains no
  code changes.
- Auto-relay when Confidence is high and the diff touches no files.
- Never auto-relay anything containing a shell command, `rm`, a file deletion,
  a credential, or a deploy. (Shipped as a default hard guard, editable.)
- Always Checkpoint anything that would start a build, open a PR, or spend
  money.

Over time, Automation Trust adjusts: if the developer keeps overriding a Rule's
suggestions, Sumirea tightens rather than pushes harder. Two other properties
fall out of the human Checkpoint for free: it is the brake that prevents the two
tools from looping endlessly, and the point where a wrong or mispasted relay is
caught before it lands.

## Reference-level explanation

The relay is a Capability realised as a Feature on the browser-extension
Surface. Following `ARCHITECTURE.md`, the Surface stays thin and all logic lives
in shared packages:

- **Adapters** (per tool): the only place that reads a tool's DOM, isolated like
  `apps/browser-extension/shared/claude-signals.js`. Each exposes `{ state,
  latestTurn }` and, later, a guarded `send(text)`. A new tool is a new Adapter,
  not a change anywhere else.
- **Preparation (Intelligence)**: takes both sides' latest turns and produces a
  proposed relay `{ from, to, context, confidence, tags }`, where `tags` mark
  the consequential signals (`shell`, `write`, `deploy`, `spend`, ...). This is
  an AI Capability and is model-agnostic (Intelligence Routing, BYOK).
- **Policy engine**: pure, testable. Given `{ relay, policy }` it returns
  `auto` | `checkpoint`. Rules are human-authored data, never code; a Policy is
  a named set of Rules. Default Policy = checkpoint everything.
- **Automation**: performs a `send` only when the Policy returns `auto`, and
  only through an Adapter's guarded `send`. Never sends on tags in the hard
  never-auto set, regardless of Rules.
- **Checkpoint / Handoff**: the quiet notification (reusing the Waiting for You
  MVP path) plus a one-click send / edit / skip surface.
- **Journal**: every prepared relay, decision, and send is recorded, so the
  Timeline and Automation Trust are derived from real history.

Loop control: a relay may only be auto-sent if it advances the exchange (dedupe
on content hash), a per-episode auto-send budget bounds runaway exchanges, and
any Checkpoint hands the wheel back to the human.

Privacy: only the minimal Context needed crosses, subject to the developer's
Rules; message bodies are never sent to a Provider beyond what Preparation
needs, and the never-auto guards cover credentials.

## Drawbacks

- It doubles the live-DOM surface: each tool needs a verified Adapter, the same
  M1 selector-verification problem as the Waiting for You MVP, per tool.
- Even gated, an auto-`send` is a form of browser automation, which the product
  otherwise avoids. Mitigations: default off, hard never-auto guards, and the
  send always runs inside a human-authored Policy that the developer can revoke.
- It is materially more complex than the single-surface MVP and should not be
  built before that wedge proves the "call you only when needed" value.

## Alternatives

- **Full-auto relay (spectator model).** Rejected: it removes Human in Control,
  the axiom the product is built on, and invites drift and wrong consequential
  sends.
- **Import model** (pull both transcripts into a third app). Rejected: it adds a
  place to babysit and does not reduce the in-flow shuttling.
- **Status quo** (manual copy-paste). This is the pain being removed; it stays
  the fallback whenever no Rule applies.

## Unresolved questions

- The shape of the Rule format the developer authors (a small form, presets, or
  a light DSL) and how far v1 goes.
- How "a human decision is needed" is detected beyond tags and Confidence.
- Which second Surface to verify first (Codex vs another), and its Adapter.
- How Confidence is calibrated so the auto path stays trustworthy.
