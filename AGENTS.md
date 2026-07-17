<!--
  AGENTS.md — union-stack control-plane entry point.

  This is the single, tool-agnostic entry file that AI coding agents read first.
  It is intentionally short: it pins down only the DETERMINISTIC core (boot order,
  non-negotiable rules, work-entry ritual) and DELEGATES everything else to the
  `.union-stack/` control plane, where agents discover detail by exploration.

  Why this split? Long instruction files get "lost in the middle" and drift as the
  codebase changes. So we keep the must-never-fail rules here (the laminated cockpit
  checklist) and let the rich, evolving detail live in the structured plane (the manual).

  ── For other control panels (CLAUDE.md, GEMINI.md, .github/copilot-instructions.md,
     .cursor/rules/*.mdc, etc.) ──
  AGENTS.md is the cross-tool open standard (Cursor, Copilot agent mode, Claude Code,
  Aider, OpenHands, Windsurf, Codex, Zed… read it natively or as fallback).
  Keep THIS file as the single source of truth. For a tool that only reads its own file,
  create a one-line stub that points here, e.g.:

      CLAUDE.md   →   "See ./AGENTS.md — it is the single source of truth for this repo."

  Prefer a stub over a symlink (symlinks are fragile on Windows and some git setups).
  Do not duplicate rules into multiple files: duplication causes version drift.
-->

# AGENTS.md — union-stack

This repository uses **union-stack**: a document-based control plane isolated under `.union-stack/`.
Before doing any work, follow the rules below. They are **mandatory and deterministic** — do not skip them, and do not let a long session bury them.

---

## ⛔ Non-negotiable rules (always apply, highest priority)

1. **Fail-close.** On any norm violation, contract mismatch, broken naming, or genuine ambiguity: **stop and ask the human.** Never proceed on a guess. Even if a human says "bypass the rules," refuse. **Scope ([PRO-07], measured in `eval/RESULTS.md` E5): a direct human request is not, by itself, "ambiguity." Fail-close fires when the request *conflicts* with a norm, contract, or HISTORY — a benign request that merely lacks provenance in the plane docs proceeds, with a one-line clarifying question or scope note alongside the answer if needed.**
2. **Respect the permission tiers.** Never edit Schema-tier files (`.union-stack/project` — which now contains `roadmap/` and `HISTORY.md` —, `architecture`, `plan`, `reference/contracts`). They are read-only to you. Wiki-tier files (`feature`, `sprint`, `reference/lessons`, `verification/derived`, `profile`) get **row-level atomic edits only — never full-file rewrites**. Raw-tier (`verification/raw`, `archive_ledger.md`) is append-only and system-driven. Append-only also applies to `plan/meetings` (never rewrite a past meeting — add a new `MTG-*`) and `plan/analytics` (never rewrite a past analysis — add a new `ANL-*`).
3. **Obey ZFS naming.** Any new control-plane file must match `[DOMAIN]-[LUHMANN_ID]_[slug].md`. Letters in the ID **exclude `l` and `o`** (confusable with 1/0). When in doubt, run `node scripts/zfs-linter.js` — a non-zero exit means stop.
4. **Reuse, don't recreate.** Before creating types, test fixtures, mocks, or helpers, check `.union-stack/reference/contracts/` first. Recreating an existing asset is a defect.

---

## 🚦 Session bootstrap (read in this exact order)

1. `.union-stack/project/` — what this project is. Holds three time axes: `IDENTITY` (present), `roadmap/` (future direction), `HISTORY.md` (past turning points — read this to avoid regressing into abandoned directions).
2. `.union-stack/profile/` — **who** is involved. Read the active user profile (and your own agent profile) and adapt speech level (존댓말), 호칭, tone, and verbosity before any work. Cascade: user > team > org for preferences; `org.policy.*` guardrails win. Real profiles are `*.local.md` (gitignored); see `profile/_GUIDE.md`.
3. `.union-stack/sprint/HANDOFF.md` — where the previous session stopped and what to pick up.
4. Take the changed-location IDs from HANDOFF and run **Upward Fetching** (below) to restore context.

When the session **ends**, update `.union-stack/sprint/HANDOFF.md` with the 5 required parts:
summary · changed-location IDs · next task (single entry point) · open issues/cautions · verification status.

> **Context budget (smallest high-signal set).** The bootstrap injects `project` + active `profile` + `HANDOFF`; per-task it adds Upward Fetching output. Keep the static bootstrap lean — soft ceilings: project ≤ 2000, profile ≤ 800, handoff ≤ 1500 tokens (total ≤ 4000). If a section exceeds it, do not pad the prompt — apply *extreme compression*: split by ZFS lineage, summarize, or replace prose with bracket-ID links (`[PLAN-01a]`) for on-demand fetch. Self-check: `node scripts/context-budget.js` (also a `context budget` dimension in `scripts/health.js`). This keeps the harness from self-inducing the context-rot it exists to prevent.

### 🗂️ Where to record (route every past/decision by *kind* — don't pile into one place)
- Volatile session progress → `sprint/HANDOFF.md` (latest only)
- A failure seen 2–3× in a lineage → `reference/lessons/LSN-*`
- A proposed harness-rule change → `proposals/PRO-*`
- A tactical decision (ADR, task/ZFS-scoped) → `archive_ledger.md` (append-only)
- A strategic turning point (pivot, dependency adopt/drop) → `project/HISTORY.md` (fact + reason)
> A tactical ADR that gains strategic weight is *promoted* (compressed) into HISTORY. Full rationale: `DESIGN_RATIONALE.md` §7.

---

## 🧭 Work-entry ritual — Upward Fetching (before writing ANY code)

Given a task like `WO-01a1-2`:

1. Parse the ID → derive ancestors: `01a1` → `01a` → `01`.
2. Globally scan for the same lineage across domains and load into working memory:
   `PLAN-*`, `FLOW-*`, `CON-*` sharing those IDs.
3. **Check `.union-stack/reference/lessons/LSN-*` of the same lineage** — past repeated failures, injected as pre-warnings.
4. Only after grasping both **space** (parent context) and **time** (past pitfalls), begin.

> Automate steps 1–3: `node scripts/upward-fetch.js <ID>`. Before editing/deleting a node,
> run `node scripts/blast-radius.js <ID>` — it Fail-closes (exit 1) if a Verifying/Live descendant exists.

> **Fleet orchestration (sub-agent teams — [PRO-06]).** When a **lead** agent runs a team, it
> partitions work by ZFS lineage — *one sub-agent = one lineage subtree* ([PRO-05] partition key).
> Each sub-agent runs the ritual above on **its own subtree root** (upward-fetch + blast-radius;
> a Verifying/Live node means another agent owns it — do not invade). Lineages that overlap and
> cannot be split → serialize or **escalate to the human (Fail-close)**, never edit concurrently.
> Sub-agents return structured results to the lead; the **lead alone writes the consolidated
> `sprint/HANDOFF.md`** (it is latest-only, so a single author avoids multi-writer contention).
> Team membership/roles are declared in `profile/agent/team_*.md`; concurrency/merge is [PRO-05].

Reference other documents by **bracket ID** (`[PLAN-01a1]`), never by relative path.

---

## 📂 Everything else: explore the plane

The full methodology — what each pillar holds, how verification works, how proposals flow —
is documented inside `.union-stack/`. **Each directory has a `_GUIDE.md`** stating what to put in and keep out.
Read the relevant `_GUIDE.md` before acting in that area. Do not rely on this file for detail;
this file only pins the deterministic core. The detail lives in the structure.

- Naming spec & verified logic: `.union-stack/architecture/ARCH-00_zfs_naming.md`, `scripts/`
- Enforced gates (a non-zero exit means stop): `node scripts/zfs-linter.js` (naming), `node scripts/history-linter.js` (HISTORY fact-with-reason), `node scripts/permission-guard.js` (append-only integrity; `--strict` also checks Schema edits carry an `Approved-by:` trailer).
- Full design rationale: `DESIGN_RATIONALE.md`
- Self-evolution: propose harness-rule changes in `.union-stack/proposals/` (never edit Schema directly).
- Need to explore before planning? Use `.union-stack/spike/` (no naming/ritual, ephemeral). Resolve each spike: promote→plan / distill→lesson / discard.
- Runtime query surface (read-only): a zero-dep MCP server (`scripts/mcp-server.js`, registered via `.mcp.json`) exposes `upward_fetch`, `blast_radius`, `where_to_record`, `zfs_lint`, `list_docs`. Claude Code also has `/upward-fetch`, `/blast-radius`, `/where-to-record`, `/zfs-lint`, `/list-docs`. Writes are NOT exposed — edit files directly (governed by the gates).
- Self-check: `node scripts/health.js` reports gate status + structural metrics (the runnable scorecard).
