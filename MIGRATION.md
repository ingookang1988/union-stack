<!--
  Onboarding methodology doc (public). How to move an existing project onto union-stack.
  Not an agent-control file — agents read AGENTS.md. This is for the human doing the migration.
-->
# Migrating an existing project onto union-stack

## Two paths
- **Fresh / mostly empty repo** → run `node scripts/init.js --name "My Project" --apply` (seeds identity, strips dummies, resets manifests). Then fill in.
- **Existing doc-stack (6/7-doc, ad-hoc docs, wiki)** → map your files onto the plane using the table below, then validate with `node scripts/zfs-linter.js`.

## Mapping table (old → new home)
Copy this, fill the right column, then move files.

| Your existing artifact | union-stack home | Tier |
|---|---|---|
| project README / vision / scope / glossary | `.union-stack/project/IDENTITY*.md` | Schema |
| roadmap / milestones | `.union-stack/project/roadmap/PHASE-*` | Schema |
| strategic pivots / "why we changed direction" | `.union-stack/project/HISTORY.md` | Schema/Raw |
| architecture rules / layering / dependency norms | `.union-stack/architecture/ARCH-*` | Schema |
| deploy / DB / infra **decisions** | `.union-stack/architecture/infra/INF-*` | Schema |
| feature plans / requirements / intent | `.union-stack/plan/PLAN-*` | Schema |
| pre-plan discussion / meeting notes | `.union-stack/plan/meetings/MTG-*` | append-only |
| shared types / interfaces / test-tooling catalog | `.union-stack/reference/contracts/CON-*` | Schema |
| repeated-failure log / postmortems | `.union-stack/reference/lessons/LSN-*` | Wiki |
| domain models / formulas / theory | `.union-stack/reference/domain/DOM-*` | Schema |
| living feature map / what's shipped | `.union-stack/feature/` (live.md, flow/FLOW-*) | Wiki |
| current sprint / work orders | `.union-stack/sprint/` (next.md, WO-*/WF-*) | Wiki |
| session log / handoff | `.union-stack/sprint/HANDOFF.md` (latest), git = archive | Wiki |
| tactical decisions (ADRs) | `.union-stack/archive_ledger.md` | Raw (append) |
| CI logs / test output / drift notes | `.union-stack/mechanism/` (raw/ in, derived/ out) | Raw / Wiki |
| harness-rule change proposals | `.union-stack/proposals/PRO-*` | Proposal |
| throwaway experiments | `.union-stack/spike/` (no ZFS, ephemeral) | Wiki |

## Common patterns
- **flat → hierarchical**: a single big PLAN.md becomes `PLAN-01`, `PLAN-01a`, `PLAN-01a1` (ZFS lineage). Reference by bracket ID `[PLAN-01a]`, never by path.
- **monolith → decomposed**: split a 40KB+ doc by ZFS lineage; keep an index file and child nodes. See the rotation note below.
- **rename to ZFS**: `[DOMAIN]-[LUHMANN_ID]_[slug].md`; run `node scripts/zfs-linter.js` until clean.

## Compatibility notes (what carries over for free)
- **ZFS Luhmann IDs ↔ existing PLAN/ID lineage**: if you already number plans hierarchically, the IDs map 1:1 — no conversion needed. Existing Zettelkasten/Folgezettel users inherit lineage directly.
- **Drift/gap docs map directly**: an existing `gap.md` / drift log → `.union-stack/mechanism/derived/gap.md` with no reshaping.
- **3-tier permission as a role clarifier**: deciding "is this Schema or Wiki?" for each file is, in practice, a fast and clarifying way to assign each doc its role during migration.

## Large docs
union-stack files are small skeletons; real docs grow. When a doc exceeds ~30KB (`node scripts/health.js` warns), split it along its ZFS lineage and/or rotate older entries — see `DESIGN_RATIONALE.md` (§7, rotation protocol).

## Validate
```bash
node scripts/zfs-linter.js      # naming
node scripts/health.js          # gates + structural metrics (size, refs, domain use)
node scripts/ref-linter.js      # bracket-ID reference integrity (advisory)
```
