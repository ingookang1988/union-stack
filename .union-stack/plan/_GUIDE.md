# plan/ — contract × action (tactical planning) guide
> **Grid:** contract (agreed) × action. **Permission:** Schema (human-owned, planning isolated).
> **Change velocity:** frequently created/destroyed — hence split from immutable norms (entropy isolation).

## Goes in: "what we agreed to do." Feature-level requirements & intent.
## Stays out: immutable norms (→ .union-stack/architecture), work tracking (→ .union-stack/sprint).
## Lifecycle: Draft → Active → Verifying → Crystallized (deletion candidate).
##   Crystallized is not immediate deletion. Only after every successor node in the same
##   lineage is terminal and a grace period passes does GC crystallize it into the
##   archive_ledger and remove it (GC guard).
## Files: PLAN-* (ZFS). Layer planning via parent-child relations.
