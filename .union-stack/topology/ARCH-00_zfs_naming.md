<!-- [Schema/ought] The ZFS naming norm. This file is methodology, so it is fine to publish/use as-is. -->
---
id: ARCH-00
title: ZFS naming convention
status: Active
version: 1.0
---

# [ARCH-00] ZFS (Zettelkasten File System) naming convention

## Filename formula
`[DOMAIN]-[LUHMANN_ID]_[slug].md`  — e.g. `PLAN-01a1_example_oauth.md`

## Rules
1. **DOMAIN**: 2–6 uppercase letters. A **closed whitelist** (enforced by `VALID_DOMAINS` in `scripts/zfs_util.js`):
   `ARCH PHASE CON PLAN FLOW WO WF LSN EVD ADR PRO`. New domains are added to both code and docs only after `.union-stack/proposals` approval.
2. **LUHMANN_ID**: starts with a digit. Digit blocks and letter blocks alternate as it grows.
   Letters exclude **`l`/`o`** → `[a-km-np-z]` (blocks confusion with digits 1/0).
   A terminal task ends with `-[0-9]+`.
3. **slug**: snake_case starting with a lowercase letter. No spaces, hyphens, or uppercase.

## Deep linking
No relative paths. Reference only via bracket IDs like `[PLAN-01a1]` in body text → a global regex index.

## Lineage inference
- **Upward Fetching**: trim from the terminal to reverse-derive parents. `01a1-2`→`01a1`→`01a`→`01`.
  Automated: `node scripts/upward-fetch.js <ID>` — gathers parent PLAN/FLOW/CON/ARCH (space)
  and same-lineage LSN (time-axis pitfalls).
- **Blast Radius**: on edit/delete, index the descendants of the same lineage; if a Verifying/Live
  node exists, Fail-close. (the alternation rule keeps `01a1` from mistaking `01a10` for a child)
  Automated: `node scripts/blast-radius.js <ID>` — exits 1 if a locked node exists.

> The verified regex & decision logic live in `scripts/zfs_util.js`, tests in `scripts/zfs_util.test.js`.
> The index layer is `scripts/zfs_index.js`.
