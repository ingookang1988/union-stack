<!--
  Version history for union-stack adopters. Public.
  Source of truth = git log; this file is the human-readable digest.
  Format: Keep a Changelog (https://keepachangelog.com). Newest first.
  ⚠ = migration action required (see MIGRATION.md §"Upgrading from an older union-stack").
-->
# Changelog

All notable changes to union-stack per version. For *how* to apply an upgrade, see
[`MIGRATION.md`](./MIGRATION.md) (§"Upgrading from an older union-stack"). For the *why* behind a
design, see [`DESIGN_RATIONALE.md`](./DESIGN_RATIONALE.md). Entries marked **⚠** require a migration
action in already-adopted projects.

## [Unreleased]
- **PRO-06** — agent-team resource + lineage-partitioning orchestration. Proposal-stage; not yet a
  released harness rule.

## [6.0.0] — 2026-06-15
**The Empirical Harness.** Efficacy moved from claim to measurement.
- Controlled A/B (harness-on vs off, same model/tasks) establishes the core law: efficacy is
  proportional to the *non-locality* of required knowledge and independent of model strength
  (held equally for Haiku, Sonnet, Opus). See [`eval/RESULTS.md`](./eval/RESULTS.md).
- New eval surfaces: [`eval/PROTOCOL.md`](./eval/PROTOCOL.md),
  [`eval/CALIBRATION.md`](./eval/CALIBRATION.md), [`eval/RESULTS.md`](./eval/RESULTS.md),
  reference instance under `eval/reference-instance/`.
- Discovery shown exact at scale (precision = recall = 1.00 on a 100-node plane; injection bounded
  by lineage depth); injected context ~208 tokens vs ~82× that in avoided rework.
- README (EN + KO) synced with runtime hooks + eval surfaces.

## [5.15] — 2026-06-14
- Runtime enforcement hardening + efficacy-eval groundwork (code-review follow-ups).

## [5.14] — 2026-06-10
- **New profile pillar: the actor axis** (`.union-stack/profile/` — human + agent). Captures *who*
  is involved (user/team/org, agent/agent-team). See [`PRO-03`](.union-stack/proposals/PRO-03_profile_pillar.md).

## [5.13] — 2026-06-09
- **New `ANL` (analytics) domain** under `.union-stack/plan/analytics/` — the plan's second raw input
  alongside meetings. See [`PRO-02`](.union-stack/proposals/PRO-02_analytics_domain.md).

## [5.12] — 2026-06-08 ⚠
**Bundle B — folder renames + plan lifecycle.** Two directories renamed so the folder name matches
its meaning:
| Old (pre-5.12) | Current | Why |
|---|---|---|
| `mechanism/` | `verification/` | "mechanism" collided with "architectural mechanism"; this plane verifies |
| `topology/`  | `architecture/` | matches the `ARCH` domain; "architecture norms" is clearer |

**Action:** move the folders and update any bracket-ID/text references; IDs themselves are unchanged.
See [`MIGRATION.md`](./MIGRATION.md) §"Upgrading from an older union-stack".

## [5.11] — 2026-06-08
- Adopter-feedback bundle A: **domain plane** (`reference/domain/DOM-*`), [`MIGRATION.md`](./MIGRATION.md)
  added, and size/ref structural checks in `scripts/health.js`.

## [5.10] — 2026-06-08
- **Self-evaluation**: `scripts/health.js` is a runnable scorecard (gates + structural metrics).

## [5.9] — 2026-06-07
- **Runtime query surface**: zero-dependency MCP server + slash commands
  (`upward-fetch`, `blast-radius`, `where-to-record`, `zfs-lint`, `list-docs`).

## [5.8] — 2026-06-07
- **Onboarding**: `scripts/init.js` scaffolding (seed identity, strip dummies, reset manifests)
  + `spike/` lane for throwaway experiments.

## [5.7] — 2026-06-07
- P1: past-store routing (where-to-record) + permission enforcement.

## [5.6] — 2026-06-07
- Added `plan/meetings/` (raw deliberation, append-only) + `architecture/infra/` (infra norms).

## [5.4] — 2026-06-06
- Enforce HISTORY fact-with-reason discipline (`history-linter`).

## [5.3] — 2026-06-06
- Enforce declarations + lineage CLIs + leakage guard + English guides.

## [5.2] — 2026-06-06
- Integrate roadmap + history into `project/` (the time 3-axis).

## [5.1] — 2026-06-05
- Initial public template: document-based control plane for AI-agent system coding.

<!-- Note: v5.5 was skipped (no release). -->
