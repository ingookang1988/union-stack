# reference/ — consult-before-act knowledge (grouping plane)

> **What it is:** not a single pillar, but a **grouping** of two pillars that share one identity —
> *accumulated knowledge you consult **before** producing something, to prevent redundant or repeated work.*
> Parallels `mechanism/` (which groups `raw/` + `derived/`); here we group `contracts/` + `lessons/`.

## Why these two are grouped (the Reference axis)
Both answer "what already exists / already happened that I must check first?" — they are the
*settled, justified knowledge* of the plane (as opposed to norms = ought, plan = intent, feature/sprint = state/process).

| Member | Holds | Prevents | Epistemic kind |
|---|---|---|---|
| `contracts/` | agreed types · interfaces · enums · test-tooling catalog (SSOT) | **recreation** ("don't rebuild what exists → reuse") | settled *agreed* truth |
| `lessons/` | repeated failures · domain pitfalls (mistake log) | **repetition** ("don't redo a past mistake → pre-warning") | *justified-by-experience* truth |
| `domain/` | domain models · formulas · theory the product encodes (DOM-*) | **re-derivation** ("don't re-figure-out the model → consult it") | *settled domain* truth |

> Note on naming: the whole control plane already treats *knowledge* as a first-class citizen, so this
> narrower sub-axis is called **Reference** (consult-before-act), not "knowledge."

## ⚠️ Permission tiers are kept per-member (grouping does NOT unify them)
- `contracts/` = **Schema** (human edits, agent read-only) — contracts are pinned hard.
- `lessons/` = **Wiki** (agent atomic writes; list/retire via proposals).
Do not infer a shared tier from the shared folder. See each member's `_GUIDE.md`.

## Members
- `contracts/` — shared static specs + test-tooling catalog. See `contracts/_GUIDE.md`.
- `lessons/` — the product mistake log (time-axis pre-warning). See `lessons/_GUIDE.md`.
- `domain/` — domain knowledge & models (DOM-*). See `domain/_GUIDE.md`.

## Extending reference/ (when to add a member)
A new `reference/` subdir qualifies **only if** it holds *settled, consult-before-act knowledge*
(like the three above). Route non-reference content elsewhere — governance → `AGENTS.md`,
architecture norms → `architecture/`, current state → `mechanism/`, work → `sprint/`.
Don't add a subdir for mutable/process content. Each member declares its own permission tier.
