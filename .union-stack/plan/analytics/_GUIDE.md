# plan/analytics/ — evidence-based analysis that backs a plan (append-only)

> **Position:** the *raw input* of `plan`, parallel to `meetings/`. analysis : plan = raw : derived.
>   meeting (who-argued-what) ∥ analytics (what the data/root-cause says) — two **parallel** raw inputs.
>   Analysis often backs a plan with no meeting at all; that is why it is a sibling, not a child, of meetings.
> **Permission:** **append-only** — never rewrite a past analysis record (human OR agent may add new ones).
>   Grouping under plan does NOT make analytics Schema (same carve-out as meetings).

## What goes in
- Evidence-based examination that informs a decision: data analysis, feasibility, benchmarks,
  root-cause (근인) findings, cost/impact estimates — the *findings* that back a plan.
- The measurable/observable basis for the "why", so the evidence survives after the plan settles.

## What stays out
- The settled decision → `plan/PLAN-*` (the analysis *backs* a plan; it is not the plan).
- Deliberation / who-argued-what → `plan/meetings/MTG-*` (that is the other raw input).
- Ad-hoc analysis voiced inside a meeting → keep it in the `MTG-*` body; promote to `ANL-*` only
  when the analysis is independently reusable/referenced.
- Proposed harness-rule changes → `.union-stack/proposals/`. Strategic pivots → `project/HISTORY.md`.

## ZFS lineage sharing (the payoff)
Name an analysis with the **same lineage** as the plan it backs: `ANL-01a_*.md` ↔ `PLAN-01a`.
Upward Fetching on `01a` then surfaces the plan, the meeting that birthed it, *and* the analysis
that backs it — the full rationale (deliberation + evidence) travels with the work automatically.

## Files
- `ANL-*` (ZFS, lineage shared with the target PLAN-*). e.g. `ANL-01a_example_provider_usage.md`
- `ANL-00<x>_retro_<yyyymmdd>.md` — **retro round record** (PRO-25 ④): meta lineage `00` (like ARCH-00 · PHASE-00 · CON-00),
  `parent: PRO-25` (adopters: `up:PRO-25`), append-only — a new round is a new file, never a rewrite.

## Retro round (PRO-25 — the "consolidation machine")
The trigger is observed (`health` → `retro due`, `node scripts/retro.js`); the round itself is a **human-opened PO judgement session**.
The agent's only move when the trigger fires is one line in HANDOFF §4: `회고 제안 — <reason>`. Entry point of the session is the
*previous* round record, not HANDOFF. `node scripts/retro.js --record --write` drafts the record with the indicator snapshot; a human
fills the 수행/보류 columns of the checklist:

| # | item | who |
|---|---|---|
| 1 | archive: Closed WO still in `sprint/` → `sprint/archived/`, `work-close --table --write` | agent (config on/off) |
| 2 | **PO judgement batch**: every Verifying WO → Closed / Active with a one-line reason | human |
| 3 | upper-axis traces: a Closed WO whose `closed_by` axis has no real row → fix the row (field alias map applies) | agent proposes, human confirms |
| 4 | PLAN GC: PLANs whose children are all terminal → Crystallized, **one batch 2a approval** (one ledger line or a GRANTS row) | human |
| 5 | lesson candidates: the same failure shape 2–3 times (evidence `none` reasons, rework WOs) → LSN candidate list | agent lists, human promotes |
| 6 | strategy candidates: superseded PLANs, dependency changes → HISTORY candidates | agent lists, human decides |
| 7 | hygiene: ledger rotation when > 30 KB (PRO-18) · PROs left Proposed too long | agent (config on/off) / human |
| 8 | record: this file (append-only) | agent drafts, human completes |
