# Bug Agents

The **Bug Agents** Team turns defect handling into a repository-native **causal defect memory**. Every bug is a self-contained folder with a YAML front matter record, traceable to the specifications the Discovery Team extracted (`SPEC ↔ CODE ↔ TEST ↔ BUG`), and followed from intake to proven recovery of the system.

The founding rule: **documenting a bug and fixing a bug are strictly separate acts.**

Always installed, as a single fixed group alongside the Reversa Agents Core.

---

## When to use

Something is wrong in the system and you want more than a quick patch: a registered, classified, traceable record; an evidence-based root cause; a regression test; and a verdict on whether the original spec must be versioned. Or a feature "keeps breaking" and you want a deep sweep instead of one more hotfix.

The Team works best on top of an extraction (`_reversa_sdd/`), but degrades gracefully: without specs, bugs carry the `spec-gap` label until `/reversa` runs.

---

## The 5 commands

```
/reversa-debugger ──registers──► _reversa_bugs/bugs/BUG-.../   ◄──registers findings── /reversa-depth-inspection
      │
      ▼
/reversa-debugger-fix ──opt-in──► /reversa-debugger-debate (diagnosis | repair | spec)
      │
      ▼ closes per closure policy
/reversa-debugger-graph ──regenerates──► generated/* + _reversa_sdd/traceability/bugs.md
```

| Agent | Role |
|-------|------|
| **Bug** | Intake, triage, dedupe, classification (`taxonomy.yaml`), initial traceability and security suspicion. Never fixes. `/reversa-debugger` |
| **Bug Fix** | Lifecycle orchestrator: optional mitigation, reproduction capsule, evidence-based root cause (with `git bisect` for regressions), two approval gates (failing tests first, then the correction change set), spec verdict, closure policy. `/reversa-debugger-fix` |
| **Bug Debate** | Fixed-epoch multi-agent debate with an isolated judge, in three modes: `diagnosis` (competing causal hypotheses), `repair` (competing strategies), `spec` (code vs spec divergence; ends in a recommendation, the decision is human). Always opt-in with cost shown upfront. External harnesses (Codex, Gemini CLI, OpenCode) may join as debaters only with explicit consent. `/reversa-debugger-debate` |
| **Depth Inspection** | Deep sweep of a problematic feature through specialized lenses: spec conformance, data flow, contracts, error states, test coverage, concurrency. Diagnosis only; confirmed findings become registered bugs. `/reversa-depth-inspection` |
| **Bug Graph** | Regenerates all derived views: index, compact catalog (`catalog.jsonl`), sparse relation matrix, mermaid graph with clusters and impact score, and the BUG ↔ SPEC traceability matrix on both ends. Validates invariants and stops with an explicit error on inconsistency. `/reversa-debugger-graph` |

---

## Anatomy of a bug

One folder per bug, with an **immutable address**: the folder never moves or gets renamed. Status lives in the front matter, never in the path.

Bugs are grouped by **context**: the feature, module or use case the user is talking about ("the credit system broke", "the cart is miscalculating"). The context folder does not exist until someone reports a problem in that area, but it is created **immediately** when the user says where the problem is, so it can receive screenshots and documents right away. TODO of that area lives inside it; nothing is ever created empty at the root.

```
_reversa_bugs/
├── README.md                 the project contract (lifecycle, closure policy, rules)
├── taxonomy.yaml             controlled vocabulary for area/module/feature
└── <context>/                e.g. credit-system/ (created the moment the first problem is reported)
    ├── intake/               annotated reports + screenshots received BEFORE any bug record exists
    ├── bugs/
    │   └── BUG-20260715-A7K3-duplicated-discount/
    │       ├── bug.md        canonical record (source of truth)
    │       ├── DONE.md       closure lock: once present, the folder is read-only for every agent
    │       ├── evidence/     logs, screenshots, reproduction capsule
    │       ├── debate/       if opened: rounds, convergence, final answer
    │       └── fix/          plan.html (visual fix plan, approved BEFORE any change) + change set diffs
    ├── inspections/<sweep>/  depth-inspection reports for this context
    └── generated/            per-context views incl. graph.html (never hand-edited)
```

Key schema concepts:

- **Merge-safe IDs**: `BUG-<date>-<suffix>` never collides, even with two harnesses registering bugs in parallel worktrees. A human `display_number` ("BUG-007") is kept for conversation.
- **3 statuses + phase**: `open`, `active`, `resolved`, with a separate `phase` (mitigating, reproducing, diagnosing, observing...). Blocking is a condition, never a status.
- **Epistemic states**: root cause and bug-to-bug relations carry `hypothesized / supported / confirmed / rejected` with evidence. A hypothesis never enters the graph as a fact.
- **Correction Change Set**: a fix is a typed set of changes (code, test, configuration, migration, data repair, specification...), because healed code is not a healed system.
- **Closure policy**: what `resolved` requires depends on the project profile: local software closes on passing regression tests; a production service only after delivery and an observation window with no recurrence.
- **Annotation first, visual outputs always**: `/reversa-debugger` starts as a scribe (reports and screenshots land in `intake/` before any record), and the views, including the self-contained `graph.html` (clickable nodes, stats, relation edges), are generated automatically as part of documenting. `/reversa-debugger-fix` produces a visual fix plan (`fix/plan.html`, with linked relation matrix and the proposed change set) that the user approves before any file is touched, and writes the `DONE.md` lock when the closure policy is satisfied.

---

## Spec verdict

Every fix answers: *was the code wrong, or the spec?* Three outcomes: `spec-correta` (code diverged, spec stands), `spec-desatualizada` (a versioned addendum is generated under `_reversa_sdd/addenda/`, the original spec is never edited) or `spec-gap` (the behavior was never specified; an additive addendum is created). The agent recommends with evidence; **the decision is human**. Code diff and spec diff are recorded **together** in the bug's Resolution.

The reverse link lives on the spec side too: `_reversa_sdd/traceability/bugs.md` is a generated mirror listing, per spec section, the bugs that hit it.

---

## Non-destructive

Bug Agents write only inside `_reversa_bugs/`, plus spec addenda in `_reversa_sdd/addenda/` and the generated mirror in `_reversa_sdd/traceability/`. Project code changes only through the two approval gates, with explicit diffs. Bugs marked `visibility: restricted` (security) stay out of public views and never reach external harnesses.
