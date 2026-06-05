<!--
  This file is the [Schema] layer of a public template.
  It contains methodology only — never real project content.
  All examples are synthetic dummies (example) — replace them after cloning.
-->

# union-stack

**🌐 English · [한국어](./README.ko.md)**

> A document-based **control plane** template for running **plan-first, high-volume development** safely alongside AI agents.
> It treats *knowledge* — not code — as a first-class citizen. Works without a graph DB, using only Markdown + a naming convention + permission boundaries.

> Origin of the name: a document **stack** that **unions** scattered concerns (architecture, planning, work, verification, learning) into a single coordinate system. It continues the evolution from 6-doc-stack to 7-doc-stack.

This repo is an **empty skeleton**. Clone it, replace the dummy examples with your own project content, and you're ready to go. The filled-in content (real ID lineage, test cases, lessons) is *your* asset and need not be public — what is shared here is only the *structure and methodology*.

---

## 0. Why this exists (30 seconds)

As LLM agents gain larger context windows and stronger reasoning, their *capability* grows but *direction* does not arise on its own. The more capable an agent is, the easier it becomes to produce large, plausibly-wrong changes. So structure is not a *crutch* for weak models — it is a *steering wheel* for strong ones.

This harness does one thing every day: **it forces a human's vague intent onto a coordinate system.** The moment "fix the login" acquires the coordinate `[PLAN-01a1]`, the agent's attention gets something to anchor to. Since every current agent is transformer-based, a project well-tokenized with unique identifiers makes attention bind sharply.

---

## 1. Three-tier permission model (understand this first)

Knowledge is split into three tiers by *rate of change*, and permissions are granted **asymmetrically**.

| Tier | What | Human | Agent |
|---|---|---|---|
| **Schema** (near-immutable) | norms, identity, plans, contracts | edits | **read-only** |
| **Wiki** (changes often) | live state, work status | curates goals | **atomic row-level writes** |
| **Raw** (append-only) | verified facts, evidence, decision ledger | read-only | append-only (system-driven) |

To these, v5 adds a **fourth tier**:

| **Proposal** | proposed changes to harness rules | approve / reject | **writes, but zero effect until approved** |

The core principle is **Fail-close**. On a norm violation, contract mismatch, or ambiguity, the agent does not proceed on its own — it stops and waits for a human. Even if a human says "bypass the norm," it refuses.

---

## 2. Document map — read it in three layers

The pillars are not flat. They operate at three distinct layers.

```
[ FRAME / boundary ]   defines "what this project is"
  .monocron/         identity & domain vocabulary (tech whitepaper). Injected once at session start.
  README.md          (this file) usage

[ CELLS / pillars ]    where knowledge actually lives. Placed on an abstraction x state/action grid.
                   state (exists)          action (changes)
  ought(immutable) .topology/              .roadmap/
  contract(agreed) .contracts/  *          .plan/
  actual(observed) .feature/               .sprint/  (+ HANDOFF.md session relay)
  time-axis(repeat).lessons/    *          (the time-axis counterpart of mechanism)

[ ARROWS / verification ] dynamic planes measuring whether cells diverge — not pillars.
  .mechanism/raw/      inbound signals (CI/compiler-generated, agent read-only)
  .mechanism/derived/  verification output: gap(norm<->reality), state(structure observed)

[ META / self-evolution ]
  .proposals/        proposed harness-rule changes -> human approve/reject -> reasons preserved (= retrospective)
```

`*` = two planes commonly missing from an ordinary doc-stack. They are this template's differentiator.
- `.contracts/` — shared static specs (types/interfaces) and a **test-tooling catalog**. "Things the agent should find and reuse, not recreate."
- `.lessons/` — accumulated repeated failures (a mistake log). Injected as a *pre-warning* when entering work.

Each directory's `_GUIDE.md` states "what to put in, what to keep out."

---

## 3. ZFS naming — graph-free lineage inference

Parent/child/sibling relations are inferred from filenames alone, borrowing Niklas Luhmann's Folgezettel numbering.

```
[DOMAIN]-[LUHMANN_ID]_[slug].md      e.g. PLAN-01a1_example_oauth.md
```

- **DOMAIN**: 2–6 uppercase letters. `PLAN FLOW ARCH WO WF EVD ADR CON LSN`, etc.
- **LUHMANN_ID**: starts with a digit; digits and letters alternate. Letters **exclude `l`/`o`** (confusable with digits 1/0). Terminal tasks end with `-N`.
  - `01` -> `01a` -> `01a1` -> `WO-01a1-1`
- **slug**: lowercase snake_case. No spaces, hyphens, or uppercase.

> The verified regex and child/sibling logic live in `scripts/` and are guaranteed by tests. Full convention: `.topology/ARCH-00_zfs_naming.md`.

### Work-entry ritual (Upward Fetching)

When an agent receives `WO-01a1-2`, **before writing any code**:
1. Parse the ID -> derive ancestors (`01a1` -> `01a` -> `01`)
2. Globally scan `PLAN-*`, `FLOW-*`, `CON-*` sharing those IDs -> load into working memory
3. **Check `LSN-*` of the same lineage (past repeated failures)** <- time axis
4. Begin only after grasping both space (parent context) and time (past pitfalls)

### Session bootstrap (the relay)

The order an agent reads when a new session starts:
1. `.monocron/` — what this project is (identity)
2. `.sprint/HANDOFF.md` — where the previous session stopped and what to pick up (the relay)
3. Upward-fetch from the changed-location IDs in HANDOFF -> restore the severed context

When a session **ends**, the agent updates `HANDOFF.md` (5 required parts: summary, changed locations, next task, open issues, verification status). Detailed discipline in `.sprint/_GUIDE.md`.

---

## 4. Quick start

```bash
# 1. Clone the template
git clone <this-repo> my-project && cd my-project

# 2. Fill in identity — replace dummies with your project
#    .monocron/IDENTITY_example.md -> real content

# 3. Define architecture norms
#    edit the dummy norms in .topology/ to fit your stack

# 4. Write your first plan
#    copy .plan/PLAN-01_example_feature.md and write a real feature plan

# 5. Validate with the naming linter
node scripts/zfs-linter.js
```

See each directory's `_GUIDE.md` for details.

---

## 5. Public / private boundary (for you, the user of this template)

This repo publishes only the **frame**. The **content** you fill in after cloning is your asset.

- Publishable (the frame): directory structure, naming convention, guides, scripts, synthetic examples.
- Keep private (the content): real ID lineage, real test cases, real lesson logs, real data lineage.

**Leakage caution:** if you make a public fork with examples rewritten too specifically to your domain, your domain leaks. Always keep `example` dummies in public versions.

---

## 6. License · Contributing

Published as a methodology template. Propose structural improvements via issues/PRs — this *is* the externalized proposal tier of this harness. Never include your private project content in a PR.

> The full design rationale is in `DESIGN_RATIONALE.md`.
