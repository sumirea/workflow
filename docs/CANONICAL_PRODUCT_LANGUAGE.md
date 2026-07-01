# Canonical Product Language

**Status:** Living specification
**Applies to:** All Sumirea documentation, RFCs, ADRs, issues, product
discussions, and implementation work.

This document is the **official language specification** for Sumirea. It is not
a glossary. A glossary records how words happen to be used; this specification
_defines_ how words must be used. When any other artifact — a README, an RFC, an
ADR, an issue, a commit message, a UI string, or a line of code — names a
product concept, the name and meaning defined here are authoritative.

Where existing documents disagree with this specification, this specification
wins, and the other document is the one that needs updating.

---

## 1. Language Principles

The principles below govern how the canonical language is chosen, written, and
maintained. They apply to every term entry in this document.

1. **One concept, one name.** Each concept has exactly one canonical term.
   Synonyms are not "also fine"; they are wrong. If two words are circulating,
   this document picks one and retires the other.
2. **One name, one concept.** A canonical term names exactly one concept. A word
   is never overloaded to mean two things in two contexts.
3. **Language is directional.** Names encode the product's stance. We say
   "Workflow Layer," not "OS," because the former is honest about what Sumirea
   is and the latter over-claims.
4. **Human-centred over machine-centred.** When a concept can be framed around
   the human outcome or the machine mechanism, prefer the human framing.
   "Protected Focus" over "notification suppression."
5. **Capability, not identity.** Intelligence is something the product _does_,
   never something the product _is_. Language must never personify the system.
6. **Restraint over reach.** Prefer the narrower, more accurate word. Avoid
   borrowed hype ("Agent," "OS," "copilot") unless a term is genuinely required
   and defined here.
7. **Definitions are testable.** Every term carries anti-examples so that misuse
   is detectable, not merely discouraged.
8. **Stability is earned.** A term is marked `Stable` only when its meaning has
   settled. New language enters as `Experimental` and is promoted deliberately.

---

## 2. Product Axioms

Axioms are the fixed truths the language must always preserve. Terms may be
added, refined, or deprecated, but no term may be defined in a way that
contradicts an axiom. Axioms change only through the Language Evolution Rules in
§6, and only with the highest bar.

- **A1 — Sumirea is a workflow layer.** It is an open-source workflow layer for
  AI-assisted software development. It is not a browser extension, not another AI
  chat, and not another AI IDE. Those may be _surfaces_; they are never the
  product.
- **A2 — Workflow is the primary unit of value.** Everything else exists to
  define, run, improve, or deliver workflows.
- **A3 — Humans always remain in control.** The system may suggest, recommend,
  and automate, but a human holds authority over consequential decisions and can
  always intervene, override, and inspect.
- **A4 — Sumirea automates repetitive decisions, not creativity.** The target of
  automation is the recurring, low-value, fatiguing decision — never the human's
  creative or judgment work.
- **A5 — Intelligence is a capability, not an identity.** The product uses
  intelligence; it is not "an AI." It is never personified as an agent, an
  assistant persona, or a colleague.
- **A6 — Restraint is a feature.** Quiet Intelligence: the system's value is
  measured partly by how little it interrupts. Silence is a legitimate output.

---

## 3. Language Domains

The canonical language is organised into six domains. Each domain groups terms
that share a subject and a level of abstraction. A term lives in exactly one
domain.

| #   | Domain                    | Concern                                                       |
| --- | ------------------------- | ------------------------------------------------------------- |
| 1   | **Product Language**      | What Sumirea is, who it serves, and why it exists.            |
| 2   | **Workflow Language**     | The structure and lifecycle of workflows — the unit of value. |
| 3   | **Intelligence Language** | How the system suggests, learns, and automates.               |
| 4   | **Platform Language**     | How abilities are structured, extended, and delivered.        |
| 5   | **AI Language**           | Models, providers, and the mechanics of AI usage.             |
| 6   | **Analytics Language**    | How value and trust are observed and measured.                |

---

## 4. Canonical Term Entries

Every entry uses the same structure:

- **Definition** — what the term means.
- **Purpose** — why the concept exists in the product.
- **Principles** — rules that constrain how the term is used.
- **Not to be confused with** — the nearest wrong neighbours.
- **Related terms** — canonical terms this one connects to.
- **Canonical examples** — correct usage.
- **Anti-examples** — usage that violates the definition.
- **Canonical status** — `Stable`, `Experimental`, or `Deprecated`.

---

### 4.1 Product Language

#### Sumirea

- **Definition:** The open-source workflow layer for AI-assisted software
  development. Sumirea is the project, the brand, and the product as a whole.
- **Purpose:** Names the thing itself, so every surface and package can refer to
  one product identity.
- **Principles:** Always capitalised as "Sumirea." Never described as an
  application, an extension, a chat, or an IDE. Sumirea _is delivered through_
  surfaces; it is not any one of them.
- **Not to be confused with:** the `workflow` repository (the monorepo that
  houses Sumirea), the `sumirea` CLI binary, or the Workflow Layer concept
  (which is what Sumirea _is_, not a synonym for its name).
- **Related terms:** Workflow Layer, Surface, Capability.
- **Canonical examples:** "Sumirea runs the same workflow across every surface."
- **Anti-examples:** "Install the Sumirea app." · "Sumirea is an AI chat for
  developers." · "the Sumirea agent."
- **Canonical status:** Stable

#### Workflow Layer

- **Definition:** The architectural position Sumirea occupies — a
  surface-agnostic layer that defines, runs, and coordinates the repeatable steps
  of AI-assisted software development, independent of any editor, model provider,
  or delivery surface.
- **Purpose:** Explains _what kind of thing_ Sumirea is without over-claiming.
- **Principles:** Prefer "Workflow Layer" over "OS," "platform," or "operating
  system for X." The layer sits between surfaces and providers; it does not
  replace either.
- **Not to be confused with:** an "OS" (over-claims scope and ownership of the
  environment); a single application or surface.
- **Related terms:** Sumirea, Surface, Adapter, Workflow.
- **Canonical examples:** "Sumirea is a workflow layer, not an application."
- **Anti-examples:** "Sumirea is an OS for AI development." · "the Sumirea
  platform layer replaces your IDE."
- **Canonical status:** Stable

#### Cognitive Bandwidth

- **Definition:** The finite mental capacity a developer has available for
  meaningful work at a given time.
- **Purpose:** Names the scarce resource Sumirea is designed to protect. It is
  the "why" behind automation and restraint.
- **Principles:** Treated as finite and precious. Every interruption spends it.
  The product's job is to spend less of it, not more.
- **Not to be confused with:** compute capacity, model context window, or
  throughput. This is a human resource, not a machine one.
- **Related terms:** Decision Fatigue, Protected Focus, Micro Decision, Quiet
  Intelligence.
- **Canonical examples:** "Batching approvals preserves cognitive bandwidth."
- **Anti-examples:** "Increase cognitive bandwidth by adding more model
  context." (conflates human and machine capacity)
- **Canonical status:** Stable

#### Decision Fatigue

- **Definition:** The degradation in a developer's judgment and energy caused by
  making too many decisions, especially repetitive low-value ones.
- **Purpose:** Names the problem Sumirea exists to reduce.
- **Principles:** Fatigue accrues from _volume_ and _repetition_ of decisions,
  not their difficulty alone. Reducing it is the point of automating Micro
  Decisions.
- **Not to be confused with:** general tiredness, burnout, or slow performance.
  It specifically concerns the cost of deciding.
- **Related terms:** Micro Decision, Cognitive Bandwidth, Automation,
  Decision Interruptions Eliminated.
- **Canonical examples:** "Auto-resolving safe formatting choices cuts decision
  fatigue."
- **Anti-examples:** "Decision fatigue means the model is slow."
- **Canonical status:** Stable

#### Micro Decision

- **Definition:** A small, recurring, low-value decision that must be made to
  keep a workflow moving but rarely benefits from deliberate human attention.
- **Purpose:** Names the precise unit of work Sumirea automates.
- **Principles:** A Micro Decision is a candidate for automation _only_ when it
  is repetitive and low-stakes. Creative or consequential decisions are never
  Micro Decisions, per Axiom A4.
- **Not to be confused with:** creative decisions, design decisions, or
  irreversible/high-stakes decisions.
- **Related terms:** Decision Fatigue, Automation, Rule, Policy, Suggestion.
- **Canonical examples:** "Choosing which lint auto-fix to apply is a micro
  decision Sumirea can handle."
- **Anti-examples:** "Which architecture to adopt is a micro decision." (this is
  a creative/consequential decision)
- **Canonical status:** Stable

#### Protected Focus

- **Definition:** A state in which a developer works without unnecessary
  interruption, because the system defers, batches, or handles interruptions on
  their behalf.
- **Purpose:** Names the human outcome Sumirea aims to produce.
- **Principles:** Protection is active, not incidental. The system earns the
  right to interrupt only when the value clearly justifies the cost to Cognitive
  Bandwidth.
- **Not to be confused with:** "Do Not Disturb," notification muting, or focus
  timers. Those hide interruptions; Protected Focus removes their cause.
- **Related terms:** Human in Control, Quiet Intelligence, Protected Focus Time,
  Cognitive Bandwidth.
- **Canonical examples:** "Sumirea preserved protected focus by batching four
  approvals into one."
- **Anti-examples:** "Enable protected focus to snooze notifications for 30
  minutes."
- **Canonical status:** Stable

#### Human in Control

- **Definition:** The invariant that a human holds authority over consequential
  decisions and can always intervene, override, and inspect what the system does.
- **Purpose:** Encodes Axiom A3 as language, so control is a named, defendable
  property.
- **Principles:** Control is non-negotiable and always available. Automation acts
  within human-set boundaries (Rules and Policies) and never beyond them.
- **Not to be confused with:** "human in the loop" as a mere approval gate.
  Control is broader: authority, visibility, and reversibility, not just a
  click-to-approve step.
- **Related terms:** Automation, Checkpoint, Handoff, Policy, Confidence.
- **Canonical examples:** "Even fully automated, the workflow keeps the human in
  control through inspectable checkpoints."
- **Anti-examples:** "The agent takes over and handles everything for you."
- **Canonical status:** Stable

#### Quiet Intelligence

- **Definition:** The design stance that the system should be as unobtrusive as
  possible — intervening rarely, speaking briefly, and treating silence as a
  valid and often preferable output.
- **Purpose:** Names Sumirea's temperament (Axiom A6) and distinguishes it from
  chatty, attention-seeking tools.
- **Principles:** Less is the goal. Value is measured partly by _restraint_. The
  system should never interrupt to demonstrate its own usefulness.
- **Not to be confused with:** a "quiet mode" setting, or minimalism as a visual
  style. It is a behavioural stance, not a toggle or a theme.
- **Related terms:** Protected Focus, Cognitive Bandwidth, Suggestion,
  Confidence.
- **Canonical examples:** "Quiet intelligence: it stayed silent because nothing
  needed the developer's attention."
- **Anti-examples:** "Turn on quiet intelligence to reduce font sizes."
- **Canonical status:** Stable

---

### 4.2 Workflow Language

#### Workflow

- **Definition:** A defined, repeatable sequence of Steps that accomplishes a
  unit of AI-assisted software development work, independent of any surface or
  provider. Workflow is the primary unit of value (Axiom A2).
- **Purpose:** Names the central product concept everything else serves.
- **Principles:** A Workflow is a definition, not a running thing (that is a
  Workflow Instance). Workflows are portable: the same Workflow behaves
  identically across surfaces.
- **Not to be confused with:** a Workflow Instance (a single run), a Recipe (a
  shareable template), or a Step (one unit inside it).
- **Related terms:** Recipe, Workflow Instance, Step, Workflow Version,
  Workflow State.
- **Canonical examples:** "The review workflow runs the same in the CLI and the
  extension."
- **Anti-examples:** "Start a workflow" to mean a single run. (that is a Workflow
  Instance)
- **Canonical status:** Stable

#### Recipe

- **Definition:** A shareable, reusable template of a Workflow — a published
  starting point others can adopt and adapt.
- **Purpose:** Enables Workflows to be distributed and reused across teams and
  the community.
- **Principles:** A Recipe is a template, not a run. Adopting a Recipe produces a
  Workflow (and, when run, Workflow Instances) owned by the adopter.
- **Not to be confused with:** a Workflow (a concrete definition in use) or a
  Workflow Instance (a run).
- **Related terms:** Workflow, Workflow Version, Extension.
- **Canonical examples:** "We published our PR-review recipe for others to
  adopt."
- **Anti-examples:** "The recipe is currently running on step 3." (a running
  thing is an Instance)
- **Canonical status:** Stable

#### Workflow Instance

- **Definition:** A single, concrete execution of a Workflow, carrying its own
  Workflow State from start to finish.
- **Purpose:** Distinguishes the act of running from the definition being run.
- **Principles:** An Instance is created from a Workflow (at a specific Workflow
  Version). Many Instances can exist for one Workflow.
- **Not to be confused with:** the Workflow (the definition) or Workflow State
  (the data an Instance carries).
- **Related terms:** Workflow, Workflow State, Workflow Version, Checkpoint.
- **Canonical examples:** "This workflow instance paused at the checkpoint for
  human approval."
- **Anti-examples:** "Edit the workflow instance's steps." (steps belong to the
  Workflow definition/Version)
- **Canonical status:** Stable

#### Workflow State

- **Definition:** The current condition and accumulated data of a Workflow
  Instance at a point in time — where it is, what it has produced, and what it is
  waiting on.
- **Purpose:** Makes the progress and context of a run inspectable and
  resumable.
- **Principles:** State belongs to an Instance, never to a Workflow definition.
  It is always inspectable, supporting Human in Control.
- **Not to be confused with:** Workflow Version (which definition is running) or
  Journal (the historical record).
- **Related terms:** Workflow Instance, Checkpoint, Handoff, Journal.
- **Canonical examples:** "The workflow state shows it's blocked on a failing
  test."
- **Anti-examples:** "Bump the workflow state to v2." (versions, not state)
- **Canonical status:** Stable

#### Workflow Version

- **Definition:** An identified, immutable revision of a Workflow definition.
- **Purpose:** Lets Workflows evolve while keeping runs reproducible and
  auditable.
- **Principles:** A Version is immutable once created; changes produce a new
  Version. Instances record the Version they ran.
- **Not to be confused with:** Workflow State (runtime data) or Evolution (the
  broader improvement process).
- **Related terms:** Workflow, Workflow Instance, Evolution, Workflow Evolution
  Score.
- **Canonical examples:** "Instance #42 ran workflow version 3."
- **Anti-examples:** "The workflow version paused for approval." (instances
  pause, versions do not)
- **Canonical status:** Stable

#### Step

- **Definition:** A single, named unit of work within a Workflow, composed of one
  or more Actions and governed by Conditions.
- **Purpose:** The building block from which Workflows are composed.
- **Principles:** A Step is part of a Workflow definition. It describes _what_
  should happen; an Action is _how_ it happens.
- **Not to be confused with:** an Action (the concrete operation) or a Checkpoint
  (a deliberate pause).
- **Related terms:** Action, Condition, Trigger, Checkpoint, Workflow.
- **Canonical examples:** "The 'run tests' step contains a test-execution
  action."
- **Anti-examples:** "Trigger the step by calling the API." (triggers start
  Workflows; steps are executed within them)
- **Canonical status:** Stable

#### Action

- **Definition:** A concrete operation performed as part of a Step — the actual
  effect, such as running a command, calling a Provider, or writing a file.
- **Purpose:** Names the smallest executable unit of behaviour.
- **Principles:** An Action does one thing. Actions are the level at which
  Adapters and Providers are invoked.
- **Not to be confused with:** a Step (which may contain several Actions) or an
  Automation (a policy about which Actions run without human input).
- **Related terms:** Step, Adapter, Provider, Automation, Trigger.
- **Canonical examples:** "The format action calls the formatter adapter."
- **Anti-examples:** "Define a new action workflow." (Actions are not Workflows)
- **Canonical status:** Stable

#### Trigger

- **Definition:** A defined event or condition that starts a Workflow Instance.
- **Purpose:** Specifies _when_ a Workflow begins.
- **Principles:** A Trigger initiates; it does not decide flow mid-run (that is a
  Condition). Triggers start Instances from Workflows.
- **Not to be confused with:** a Condition (branching within a run) or an Action
  (work performed during a run).
- **Related terms:** Condition, Workflow Instance, Rule, Step.
- **Canonical examples:** "A push to main triggers the review workflow."
- **Anti-examples:** "The trigger runs the tests." (that is an Action)
- **Canonical status:** Stable

#### Condition

- **Definition:** A rule that determines whether a Step or path within a running
  Workflow is taken.
- **Purpose:** Enables branching and gating inside a Workflow.
- **Principles:** Conditions govern flow _within_ a run. They are declarative:
  they decide, they do not act.
- **Not to be confused with:** a Trigger (starts a run) or a Rule/Policy
  (persistent constraints, often about automation and control).
- **Related terms:** Trigger, Step, Rule, Policy.
- **Canonical examples:** "The deploy step runs only on the condition that tests
  passed."
- **Anti-examples:** "The condition triggers the workflow." (conditions branch;
  triggers start)
- **Canonical status:** Stable

#### Checkpoint

- **Definition:** A deliberate, defined pause in a Workflow where progress is
  captured and, typically, human review or approval is invited.
- **Purpose:** A primary mechanism for keeping the Human in Control within
  otherwise automated flows.
- **Principles:** Checkpoints are intentional and inspectable. They make
  Workflow State visible and give humans a decision point.
- **Not to be confused with:** a Handoff (transfer of responsibility) or a
  failure/error stop (unintended).
- **Related terms:** Handoff, Human in Control, Workflow State, Workflow
  Instance.
- **Canonical examples:** "The workflow reaches a checkpoint before opening the
  PR."
- **Anti-examples:** "The checkpoint crashed the run." (a checkpoint is planned,
  not an error)
- **Canonical status:** Stable

#### Handoff

- **Definition:** A defined transfer of responsibility for a Workflow Instance —
  between the system and a human, or between people — with context carried
  across.
- **Purpose:** Makes transitions of ownership explicit and lossless.
- **Principles:** A Handoff carries enough Workflow State and Context for the
  receiver to continue. It names _who_ is responsible next.
- **Not to be confused with:** a Checkpoint (a pause for review, not necessarily
  a change of ownership).
- **Related terms:** Checkpoint, Workflow State, Context, Human in Control.
- **Canonical examples:** "At the security review, the workflow hands off to a
  human reviewer."
- **Anti-examples:** "The handoff pauses for a quick approval, then the same
  actor continues." (that is a Checkpoint)
- **Canonical status:** Stable

#### Rule

- **Definition:** A single, human-authored constraint that governs how a Workflow
  or its Automation behaves (e.g., "never auto-merge without passing tests").
- **Purpose:** Gives humans a granular way to bound the system's behaviour.
- **Principles:** Rules are authored and owned by humans. A Rule is atomic; a
  named collection of Rules governing a domain is a Policy.
- **Not to be confused with:** a Condition (in-flow branching logic) or a Policy
  (a coherent set of Rules).
- **Related terms:** Policy, Condition, Automation, Human in Control.
- **Canonical examples:** "A rule forbids auto-applying changes to
  infrastructure files."
- **Anti-examples:** "The rule triggers the workflow on push." (that is a
  Trigger)
- **Canonical status:** Stable

#### Policy

- **Definition:** A coherent, named set of Rules that governs a domain of
  behaviour — for example, an automation policy or an approval policy.
- **Purpose:** Bundles related Rules into a governable, reusable unit.
- **Principles:** Policies are composed of Rules and are the level at which
  automation boundaries and control are typically configured.
- **Not to be confused with:** a single Rule, or a Recipe (a Workflow template,
  not a governance set).
- **Related terms:** Rule, Automation, Human in Control, Automation Trust.
- **Canonical examples:** "Our automation policy allows auto-fixing lint but not
  logic changes."
- **Anti-examples:** "Add a policy that runs on every push." (that describes a
  Trigger)
- **Canonical status:** Stable

---

### 4.3 Intelligence Language

#### Intelligence

- **Definition:** The system's capability to reason over Context in order to
  suggest, recommend, learn, and automate. Intelligence is a capability, never an
  identity (Axiom A5).
- **Purpose:** Names what the system can _do_ without personifying it.
- **Principles:** Never write "the intelligence" as an actor or persona.
  Intelligence is applied _by_ Sumirea _to_ Workflows.
- **Not to be confused with:** "an AI," an "assistant," or an "agent." Those name
  identities; Intelligence names an ability.
- **Related terms:** Suggestion, Recommendation, Automation, Learning,
  Confidence, Intelligence Routing.
- **Canonical examples:** "Sumirea applies intelligence to rank the safest
  auto-fix."
- **Anti-examples:** "The Intelligence decided to merge." · "Ask the intelligence
  a question."
- **Canonical status:** Stable

#### Suggestion

- **Definition:** A low-commitment proposal offered to the human for
  consideration, which the human may take or ignore with no consequence for
  ignoring it.
- **Purpose:** The lightest form of intelligence output, consistent with Quiet
  Intelligence.
- **Principles:** A Suggestion never acts on its own. Ignoring it is free and
  expected. It carries Confidence but demands nothing.
- **Not to be confused with:** a Recommendation (stronger, reasoned guidance) or
  an Automation (action taken without asking).
- **Related terms:** Recommendation, Confidence, Quiet Intelligence, Micro
  Decision.
- **Canonical examples:** "Sumirea suggests grouping these two commits."
- **Anti-examples:** "The suggestion auto-applied the change." (then it was an
  Automation)
- **Canonical status:** Stable

#### Recommendation

- **Definition:** A reasoned, higher-commitment piece of guidance that argues for
  a specific course of action, still leaving the decision to the human.
- **Purpose:** For moments where the system has enough Confidence to advocate,
  not merely mention.
- **Principles:** A Recommendation carries a rationale and a Confidence level. It
  advocates; it does not act. The human remains in control.
- **Not to be confused with:** a Suggestion (lighter, no advocacy) or an
  Automation (action taken).
- **Related terms:** Suggestion, Confidence, Human in Control, Automation.
- **Canonical examples:** "Sumirea recommends reverting; here's why."
- **Anti-examples:** "The recommendation merged the branch." (that is Automation)
- **Canonical status:** Stable

#### Automation

- **Definition:** The system taking a defined Action without asking, within
  human-set Rules and Policies, for a Micro Decision that does not warrant human
  attention.
- **Purpose:** The mechanism by which Sumirea reduces Decision Fatigue.
- **Principles:** Automation acts only inside boundaries humans set, only on
  repetitive low-value decisions (Axiom A4), and always inspectably (Axiom A3).
  Automation never targets creativity.
- **Not to be confused with:** autonomy or an "agent acting on its own."
  Automation is bounded and human-governed.
- **Related terms:** Policy, Rule, Micro Decision, Automation Trust, Human in
  Control.
- **Canonical examples:** "Automation applies the formatter without prompting."
- **Anti-examples:** "Automation redesigned the module architecture." (violates
  A4)
- **Canonical status:** Stable

#### Learning

- **Definition:** The process by which the system improves its Suggestions,
  Recommendations, and Automations from observed outcomes and human decisions.
- **Purpose:** Lets the product get quietly better at serving each user and team
  over time.
- **Principles:** Learning informs; it does not seize new authority. What is
  learned is subject to the same Rules, Policies, and human control.
- **Not to be confused with:** Evolution (improvement of Workflows themselves) or
  model training performed by an AI Provider.
- **Related terms:** Evolution, Confidence, Suggestion, Automation Trust.
- **Canonical examples:** "From repeated overrides, Sumirea learns to stop
  suggesting that fix."
- **Anti-examples:** "Learning changed the automation policy on its own."
  (violates Human in Control)
- **Canonical status:** Experimental

#### Evolution

- **Definition:** The deliberate improvement of Workflows over time — refining
  Steps, Conditions, and Policies as evidence accumulates about what works.
- **Purpose:** Frames Workflows as living definitions that get better, not static
  scripts.
- **Principles:** Evolution operates on Workflow definitions and produces new
  Workflow Versions. It is guided by evidence and remains human-governed.
- **Not to be confused with:** Learning (improving intelligence outputs) or
  Workflow Version (a single revision, an artifact of Evolution).
- **Related terms:** Learning, Workflow Version, Workflow Evolution Score,
  Recipe.
- **Canonical examples:** "The review workflow evolved to skip a redundant
  step."
- **Anti-examples:** "Evolution rewrote the model's weights." (that is provider
  training, not Evolution)
- **Canonical status:** Experimental

#### Confidence

- **Definition:** The system's calibrated estimate of how likely a Suggestion,
  Recommendation, or Automation is to be correct or appropriate.
- **Purpose:** Lets the system decide when to stay quiet, when to suggest, and
  when it is safe to automate.
- **Principles:** Confidence must be calibrated and honest. Low Confidence
  favours silence or Suggestion; high Confidence may justify Automation within
  Policy.
- **Not to be confused with:** a raw model probability score, or Automation Trust
  (the human's trust in the system).
- **Related terms:** Suggestion, Recommendation, Automation, Automation Trust,
  Intelligence Routing.
- **Canonical examples:** "Below the confidence threshold, Sumirea only
  suggests."
- **Anti-examples:** "Confidence is the softmax value returned by the model."
  (that is a provider signal, not the product concept)
- **Canonical status:** Stable

#### Intelligence Routing

- **Definition:** The system's decision about which intelligence resource — which
  Model, AI Provider, or Local Model — should handle a given task, based on the
  task, Context, cost, privacy, and Confidence needs.
- **Purpose:** Directs work to the right intelligence without exposing that
  complexity to the user.
- **Principles:** Prefer "Intelligence Routing" over "AI Routing." Routing is a
  product capability, model-agnostic, and respects BYOK and privacy choices.
- **Not to be confused with:** load balancing, or "AI Routing" (deprecated
  phrasing).
- **Related terms:** Model, AI Provider, Local Model, BYOK, Confidence,
  Capability.
- **Canonical examples:** "Intelligence routing sends the sensitive step to the
  local model."
- **Anti-examples:** "AI routing picks the endpoint." (use "Intelligence
  Routing")
- **Canonical status:** Stable

---

### 4.4 Platform Language

#### Capability

- **Definition:** A platform-level ability Sumirea provides — a coherent thing
  the product can do, described at the level of value rather than
  implementation.
- **Purpose:** The preferred way to describe what the platform offers.
- **Principles:** Prefer "Capability" over "Feature" when describing
  platform-level abilities. A Capability may be realised by several Features
  across Surfaces.
- **Not to be confused with:** a Feature (a concrete, surface-level realisation)
  or an AI Capability (a capability specifically powered by AI).
- **Related terms:** Feature, Surface, AI Capability, Extension.
- **Canonical examples:** "Workflow evolution is a core capability."
- **Anti-examples:** "The auto-fix button is a capability." (that is a Feature)
- **Canonical status:** Stable

#### Feature

- **Definition:** A concrete, user-visible realisation of a Capability on a
  particular Surface.
- **Purpose:** Names the tangible thing a user interacts with.
- **Principles:** Features realise Capabilities. When describing platform-level
  ability, prefer Capability; reserve Feature for the concrete, surface-bound
  thing.
- **Not to be confused with:** a Capability (the underlying ability) or a Surface
  (where the Feature appears).
- **Related terms:** Capability, Surface, Extension, Plugin.
- **Canonical examples:** "The extension's inline-approval feature realises the
  checkpoint capability."
- **Anti-examples:** "Intelligence routing is a feature of Sumirea." (it is a
  Capability)
- **Canonical status:** Stable

#### Surface

- **Definition:** A delivery channel through which Sumirea is presented to
  users — for example, the CLI, the browser extension, or the docs site. Surfaces
  are deliberately thin.
- **Purpose:** Distinguishes _where_ the product appears from the product itself.
- **Principles:** Prefer "Surface" over "Client" when describing delivery
  surfaces. Surfaces hold no business logic; the product lives in shared
  packages, so a Workflow behaves identically everywhere.
- **Not to be confused with:** the product (Sumirea), a Client, or an
  Integration (a connection to an external system).
- **Related terms:** Sumirea, Workflow Layer, Feature, Adapter, Integration.
- **Canonical examples:** "The same workflow runs across every surface."
- **Anti-examples:** "Open the Sumirea client." (say "surface")
- **Canonical status:** Stable

#### Adapter

- **Definition:** An implementation that connects Sumirea's internal ports to an
  external system — an editor, a version-control system, or an AI Provider —
  behind a stable interface.
- **Purpose:** Keeps the core surface- and provider-agnostic by isolating
  external specifics.
- **Principles:** Adapters implement ports; the core depends on the port, not the
  Adapter. Swapping an Adapter must not change Workflow behaviour.
- **Not to be confused with:** a Provider (the external system itself) or an
  Integration (the resulting end-to-end connection).
- **Related terms:** Provider, Integration, Action, Workflow Layer.
- **Canonical examples:** "The Git adapter implements the version-control port."
- **Anti-examples:** "Install the OpenAI adapter to chat." (Adapters serve
  Workflows, not chat)
- **Canonical status:** Stable

#### Provider

- **Definition:** An external system that supplies a service Sumirea consumes
  through an Adapter — for example a version-control host or an AI service.
- **Purpose:** Names the outside party behind a capability.
- **Principles:** A Provider is external and is reached via an Adapter. "AI
  Provider" is the Provider subtype for AI services.
- **Not to be confused with:** an Adapter (Sumirea's connector to the Provider)
  or a Model (a specific offering from an AI Provider).
- **Related terms:** Adapter, AI Provider, Model, Integration.
- **Canonical examples:** "GitHub is a provider reached through the VCS
  adapter."
- **Anti-examples:** "The provider is the code that calls the API." (that is the
  Adapter)
- **Canonical status:** Stable

#### Integration

- **Definition:** The end-to-end connection between Sumirea and an external
  system, realised through one or more Adapters and Providers, that lets
  Workflows act on that system.
- **Purpose:** Names the user-meaningful "we work with X" relationship.
- **Principles:** An Integration is the whole connection, not a single Adapter.
  Users adopt Integrations; engineers build Adapters.
- **Not to be confused with:** an Adapter (a component) or an Extension (added
  functionality, not a connection to a system).
- **Related terms:** Adapter, Provider, Extension, Surface.
- **Canonical examples:** "The GitHub integration lets workflows open PRs."
- **Anti-examples:** "Write a new integration class behind the port." (that is an
  Adapter)
- **Canonical status:** Stable

#### Extension

- **Definition:** Added functionality that expands what Sumirea can do, built on
  its extension points, without modifying the core.
- **Purpose:** Names first-class, supported ways to grow the product's
  Capabilities.
- **Principles:** Extensions build on defined extension points. "Extension" as
  this concept is distinct from "the browser extension," which is a Surface.
- **Not to be confused with:** the browser extension Surface, a Plugin (a
  narrower, packaged extension unit), or an Integration.
- **Related terms:** Plugin, Capability, Integration, Surface.
- **Canonical examples:** "An extension adds a new step type to workflows."
- **Anti-examples:** "Open the extension to approve." (there you mean the
  browser-extension Surface)
- **Canonical status:** Experimental

#### Plugin

- **Definition:** A packaged, distributable unit of extension — a self-contained
  bundle that adds specific functionality and can be installed or removed.
- **Purpose:** The concrete distribution form of an Extension.
- **Principles:** A Plugin is a unit; Extension is the broader concept. Plugins
  install into extension points and must respect Rules, Policies, and Human in
  Control.
- **Not to be confused with:** an Extension (the concept) or an Adapter (an
  internal connector).
- **Related terms:** Extension, Capability, Adapter.
- **Canonical examples:** "Install the changelog plugin to add that step type."
- **Anti-examples:** "The Git plugin implements the VCS port." (that is an
  Adapter)
- **Canonical status:** Experimental

---

### 4.5 AI Language

#### Model

- **Definition:** A specific AI model offering — for example a particular
  large-language model — that can perform inference for an Action.
- **Purpose:** Names the concrete unit intelligence is executed on.
- **Principles:** A Model is provided by an AI Provider (or runs as a Local
  Model). The product is model-agnostic; Models are selected by Intelligence
  Routing.
- **Not to be confused with:** an AI Provider (the supplier), an AI Capability (a
  product ability powered by AI), or Intelligence (the product-level capability).
- **Related terms:** AI Provider, Local Model, Intelligence Routing, Context,
  BYOK.
- **Canonical examples:** "Intelligence routing selected a smaller model for this
  step."
- **Anti-examples:** "The model is in control of the merge." (violates Human in
  Control; Models do not hold authority)
- **Canonical status:** Stable

#### AI Provider

- **Definition:** A Provider that supplies AI Models and inference — for example
  a hosted model service.
- **Purpose:** Names the external supplier of AI, as a subtype of Provider.
- **Principles:** Reached through an Adapter, like any Provider. Supports BYOK so
  users bring their own accounts and keys.
- **Not to be confused with:** a Model (a specific offering) or an Adapter
  (Sumirea's connector to the Provider).
- **Related terms:** Provider, Model, BYOK, Local Model, Adapter.
- **Canonical examples:** "Configure your AI provider with your own key."
- **Anti-examples:** "The AI provider is the routing code." (that is Intelligence
  Routing plus an Adapter)
- **Canonical status:** Stable

#### AI Capability

- **Definition:** A product Capability whose value is delivered by AI — for
  example, generating a summary or ranking suggested fixes.
- **Purpose:** Distinguishes AI-powered abilities as a subset of Capabilities.
- **Principles:** An AI Capability is still a Capability first: described by
  value, model-agnostic, and realised by Features. The AI is the means, not the
  identity.
- **Not to be confused with:** a Model (the execution unit) or Intelligence (the
  general capability to reason).
- **Related terms:** Capability, Intelligence, Model, Feature.
- **Canonical examples:** "Summarising a diff is an AI capability."
- **Anti-examples:** "The AI capability is GPT-class model X." (a Model is not a
  Capability)
- **Canonical status:** Stable

#### BYOK

- **Definition:** "Bring Your Own Key" — the model in which users supply their
  own AI Provider credentials so inference runs under their own accounts and
  terms.
- **Purpose:** Preserves user ownership, cost control, and privacy, consistent
  with Human in Control.
- **Principles:** BYOK is a first-class expectation, not an edge case. The
  product never requires surrendering keys to a Sumirea-operated intermediary.
- **Not to be confused with:** a hosted/managed key service, or a Local Model
  (which needs no external key at all).
- **Related terms:** AI Provider, Model, Local Model, Human in Control.
- **Canonical examples:** "With BYOK, your requests go straight to your provider
  account."
- **Anti-examples:** "BYOK means Sumirea stores a shared key for everyone."
- **Canonical status:** Stable

#### Context

- **Definition:** The relevant information assembled for a Model or intelligence
  operation — code, Workflow State, history, and constraints — so it can reason
  well about the task.
- **Purpose:** Names the material intelligence works from.
- **Principles:** Context is assembled deliberately and minimally. What enters
  Context is subject to privacy Rules and Policies.
- **Not to be confused with:** a model's raw "context window" (a capacity limit)
  or Cognitive Bandwidth (a human resource).
- **Related terms:** Model, Intelligence, Workflow State, Handoff, BYOK.
- **Canonical examples:** "Only the failing test's file is added to context."
- **Anti-examples:** "Context is the number of tokens the model accepts." (that
  is the context window)
- **Canonical status:** Stable

#### Local Model

- **Definition:** A Model that runs on the user's own hardware, with no external
  AI Provider call, keeping inference and data on-device.
- **Purpose:** Enables privacy-preserving and offline intelligence.
- **Principles:** A Local Model is a routing target like any Model, chosen by
  Intelligence Routing when privacy, cost, or availability call for it. It needs
  no BYOK.
- **Not to be confused with:** a self-hosted AI Provider (still an external
  service) or BYOK (still uses a remote Provider).
- **Related terms:** Model, AI Provider, BYOK, Intelligence Routing, Context.
- **Canonical examples:** "Intelligence routing keeps this sensitive step on a
  local model."
- **Anti-examples:** "The local model is our hosted endpoint." (hosted is not
  local)
- **Canonical status:** Experimental

---

### 4.6 Analytics Language

#### Journal

- **Definition:** The durable, inspectable record of what Workflows did and why —
  the Actions taken, decisions made, and Handoffs performed over time.
- **Purpose:** Provides accountability and supports Human in Control through
  after-the-fact visibility.
- **Principles:** The Journal is a record, not live state. It is the source
  behind Timelines and Metrics.
- **Not to be confused with:** Workflow State (current, live) or Timeline (an
  ordered view derived from the Journal).
- **Related terms:** Timeline, Metrics, Workflow State, Handoff.
- **Canonical examples:** "The journal shows every automated fix applied last
  week."
- **Anti-examples:** "Read the journal to see the current step." (use Workflow
  State)
- **Canonical status:** Stable

#### Timeline

- **Definition:** A chronological, human-readable view of events derived from the
  Journal for a Workflow, Instance, or user.
- **Purpose:** Makes history legible at a glance.
- **Principles:** A Timeline is a presentation of the Journal, not a separate
  source of truth.
- **Not to be confused with:** the Journal (the underlying record) or Metrics
  (aggregate measures).
- **Related terms:** Journal, Metrics, Workflow Instance.
- **Canonical examples:** "The timeline shows the run pausing at each
  checkpoint."
- **Anti-examples:** "Write the event to the timeline." (events are written to
  the Journal)
- **Canonical status:** Stable

#### Metrics

- **Definition:** Quantitative measures computed from the Journal that describe
  the product's value and behaviour over time.
- **Purpose:** Turns activity into evidence of value and trust.
- **Principles:** Metrics are derived, defined, and honest. Canonical product
  metrics are named individually below and are the preferred vocabulary.
- **Not to be confused with:** raw logs or vanity counts. Metrics are chosen to
  reflect real value (e.g., focus preserved, fatigue reduced).
- **Related terms:** Journal, Protected Focus Time, Decision Interruptions
  Eliminated, Workflow Confidence, Automation Trust, Workflow Evolution Score.
- **Canonical examples:** "The metrics show automation trust rising this
  quarter."
- **Anti-examples:** "Metrics are the server request counts." (those are logs,
  not product metrics)
- **Canonical status:** Stable

#### Protected Focus Time

- **Definition:** A Metric quantifying the amount of Protected Focus a developer
  gained — time spent working uninterrupted because the system deferred, batched,
  or handled interruptions.
- **Purpose:** Measures the core human outcome (Protected Focus) in concrete
  terms.
- **Principles:** Measures uninterrupted time _attributable_ to the system's
  restraint, not merely time with notifications off.
- **Not to be confused with:** Protected Focus (the state) or generic
  "time-on-task" analytics.
- **Related terms:** Protected Focus, Decision Interruptions Eliminated,
  Cognitive Bandwidth, Metrics.
- **Canonical examples:** "Protected focus time rose by two hours per day."
- **Anti-examples:** "Protected focus time counts minutes with Do Not Disturb
  on."
- **Canonical status:** Experimental

#### Decision Interruptions Eliminated

- **Definition:** A Metric counting the Micro Decisions the system handled so the
  human never had to be interrupted by them.
- **Purpose:** Quantifies reduction of Decision Fatigue directly.
- **Principles:** Counts interruptions genuinely _avoided_ (via Automation or
  batching), not merely decisions that existed.
- **Not to be confused with:** total Actions taken, or Protected Focus Time
  (duration, not count).
- **Related terms:** Micro Decision, Decision Fatigue, Automation, Metrics.
- **Canonical examples:** "It eliminated 40 decision interruptions today."
- **Anti-examples:** "Every action taken counts as a decision interruption
  eliminated." (only avoided interruptions count)
- **Canonical status:** Experimental

#### Workflow Confidence

- **Definition:** A Metric expressing how reliably a given Workflow produces good
  outcomes, aggregated from its runs.
- **Purpose:** Tells users which Workflows are dependable and where to focus
  Evolution.
- **Principles:** Aggregated from outcomes over Instances. Distinct from the
  per-decision Confidence signal.
- **Not to be confused with:** Confidence (a single intelligence estimate) or
  Automation Trust (the human's willingness to let the system act).
- **Related terms:** Confidence, Workflow, Workflow Evolution Score, Metrics.
- **Canonical examples:** "The release workflow has high workflow confidence."
- **Anti-examples:** "Workflow confidence is the model's softmax on one step."
- **Canonical status:** Experimental

#### Automation Trust

- **Definition:** A Metric reflecting how much the human trusts the system to act
  on their behalf — inferred from how often Automations are accepted, overridden,
  or tightened.
- **Purpose:** Keeps automation honest by measuring earned trust rather than
  assuming it.
- **Principles:** Trust is earned and revocable. Falling Automation Trust is a
  signal to narrow Policies, not to push harder.
- **Not to be confused with:** Confidence (the system's own estimate) or Workflow
  Confidence (per-workflow reliability).
- **Related terms:** Automation, Policy, Confidence, Human in Control, Metrics.
- **Canonical examples:** "Frequent overrides lowered automation trust for that
  policy."
- **Anti-examples:** "Automation trust is how confident the model is." (that is
  Confidence)
- **Canonical status:** Experimental

#### Workflow Evolution Score

- **Definition:** A Metric capturing how much a Workflow has improved through
  Evolution over time — the trajectory of its Versions and outcomes.
- **Purpose:** Rewards and surfaces genuine improvement, treating Workflows as
  living definitions.
- **Principles:** Measures improvement trend, not raw activity or churn. Tied to
  Evolution and Workflow Versions.
- **Not to be confused with:** Workflow Confidence (current reliability) or a
  simple change count.
- **Related terms:** Evolution, Workflow Version, Workflow Confidence, Metrics.
- **Canonical examples:** "Its workflow evolution score climbed after two
  rounds of refinement."
- **Anti-examples:** "The evolution score just counts edits." (churn is not
  improvement)
- **Canonical status:** Experimental

---

## 5. Canonical Relationships

These are the load-bearing relationships between canonical terms. They must hold
across all documentation and implementation.

### 5.1 Product framing

- **Sumirea** _is a_ **Workflow Layer**, delivered through **Surfaces**.
- A **Surface** _presents_ Sumirea but _holds no_ product logic.
- **Cognitive Bandwidth** _is depleted by_ **Decision Fatigue**, which _is caused
  by_ **Micro Decisions**.
- **Protected Focus** _preserves_ **Cognitive Bandwidth**; **Quiet Intelligence**
  _is the stance that produces_ Protected Focus.
- **Human in Control** _bounds_ everything the system does.

### 5.2 Workflow structure and lifecycle

- A **Recipe** _is a template for_ a **Workflow**.
- A **Workflow** _is composed of_ **Steps**; a **Step** _is composed of_
  **Actions**.
- A **Workflow** _is versioned as_ **Workflow Versions** (immutable).
- A **Trigger** _starts_ a **Workflow Instance** from a **Workflow** (at a
  **Workflow Version**).
- A **Workflow Instance** _carries_ **Workflow State**.
- **Conditions** _branch_ flow within an Instance; **Triggers** only _start_ it.
- **Checkpoints** _pause_ an Instance for review; **Handoffs** _transfer
  responsibility_ for it.
- **Rules** _compose into_ **Policies**; both _are authored by_ humans.

### 5.3 Intelligence gradient

- **Intelligence** _is a Capability_, never an identity.
- Escalating commitment: **Suggestion** → **Recommendation** → **Automation**.
- **Confidence** _gates_ that gradient; low Confidence favours silence.
- **Automation** _acts on_ **Micro Decisions**, _within_ **Policies**, _reducing_
  **Decision Fatigue** — never on creativity (Axiom A4).
- **Learning** _improves intelligence outputs_; **Evolution** _improves
  Workflows_.

### 5.4 Platform composition

- A **Capability** _is realised by_ **Features** on **Surfaces**.
- An **Adapter** _connects_ Sumirea to a **Provider**; an **Integration** _is_ the
  resulting end-to-end connection.
- **Extensions** _add_ Capabilities; a **Plugin** _is_ a packaged Extension.

### 5.5 AI and routing

- An **AI Provider** _is a_ **Provider** that _supplies_ **Models**.
- A **Local Model** _is a_ **Model** that _runs on-device_.
- **BYOK** _lets users own_ the **AI Provider** relationship.
- **Intelligence Routing** _selects among_ **Models** (including **Local
  Models**) using **Context**, **Confidence**, cost, and privacy.

### 5.6 Analytics derivation

- The **Journal** _is the record_; **Timeline** and **Metrics** _are derived from
  it_.
- Canonical **Metrics** — **Protected Focus Time**, **Decision Interruptions
  Eliminated**, **Workflow Confidence**, **Automation Trust**, **Workflow
  Evolution Score** — _measure_ the axioms in practice.

---

## 6. Language Evolution Rules

The canonical language is a living specification. It changes deliberately.

### 6.1 What may change, and how

| Change                            | Mechanism                           | Bar      |
| --------------------------------- | ----------------------------------- | -------- |
| Add a new term                    | RFC → ADR                           | Normal   |
| Refine a Definition / examples    | RFC → ADR                           | Normal   |
| Promote `Experimental` → `Stable` | ADR, with evidence of settled usage | Moderate |
| Deprecate a term                  | ADR, with migration guidance        | Moderate |
| Rename a canonical term           | RFC → ADR, with migration plan      | High     |
| Add, remove, or change a Domain   | RFC → ADR                           | High     |
| Change a **Product Axiom** (§2)   | RFC → ADR, explicit and unambiguous | Highest  |

Axioms are the most protected. A change that would contradict an existing Axiom
is not a language change — it is a product change, and must be argued as one.

### 6.2 Status lifecycle

- **Experimental** — the term is in use but its meaning may still shift. Use it,
  but expect refinement. All new terms enter here.
- **Stable** — the meaning has settled. Changes require the bars above. This is
  the default expectation for mature terms.
- **Deprecated** — the term is retired. It must not be used in new work; existing
  uses should migrate. A Deprecated entry must name its replacement (or state
  that the concept is dropped) and link the ADR that retired it.

### 6.3 Rules of good standing

1. **No silent synonyms.** Introducing an alternative word for an existing
   concept is a language change, not a stylistic choice. Route it through §6.1.
2. **No silent overloading.** Reusing a canonical term for a second meaning is
   prohibited; define a new term instead.
3. **Deprecate, don't delete.** Retired terms stay in this document as
   `Deprecated` entries so old references remain interpretable.
4. **Every change is recorded.** Each accepted change references the RFC and/or
   ADR that made it, so the language has a traceable history.
5. **Documentation follows the spec.** When this specification changes, dependent
   documents are updated to match. Where they conflict in the meantime, this
   specification is authoritative.

### 6.4 Currently discouraged phrasings

The following are non-canonical and should be replaced on sight:

| Discouraged                              | Use instead                                                 | Why                                                                                                                                           |
| ---------------------------------------- | ----------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------- |
| "AI Routing"                             | **Intelligence Routing**                                    | Routing is a product capability, not "the AI."                                                                                                |
| "OS" / "operating system"                | **Workflow Layer**                                          | Avoids over-claiming scope.                                                                                                                   |
| "Client"                                 | **Surface**                                                 | Surfaces are thin delivery channels.                                                                                                          |
| "Feature" (for platform ability)         | **Capability**                                              | Capabilities describe value; Features realise them.                                                                                           |
| "Agent" (as core term)                   | Name the capability (e.g. **Automation**, **Intelligence**) | The system is not an identity (Axiom A5). Use "Agent" only where an established external meaning makes it unavoidable, and define it locally. |
| "the AI" / "the assistant" (as an actor) | **Intelligence** (a capability)                             | The product is not personified.                                                                                                               |
