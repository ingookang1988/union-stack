# contracts/ — contract × state (shared contracts · reusable assets) guide  ★new plane
> **Grid:** contract (agreed) × state. **Permission:** Schema (contracts are pinned hard).
> **Change velocity:** near-immutable. **Reason for existence: enforce reuse — "find and use, don't recreate."**

## What goes in (two kinds, both "state-side contracts")
1. Shared static specs: global types · interfaces · enums · core signatures (SSOT).
2. Test-tooling catalog (tier 2): the *calling conventions* of runners · fixtures · mocks.

## The catalog's 3 mandatory elements (missing any one and it doesn't work)
- What exists (existence) · where it is (path/ID) · **how to use it (call example)**.

## Sync: auto-extract from code where possible (code = truth, catalog = projection).
##   For unstructured cases, agent proposes (→ .union-stack/proposals), then human approves.
## Visibility: coordinates + bootstrap, not a forced gate — the problem is visibility, not willpower.
## Publishing caution: structure is fine to publish, but sanitize real call examples to dummies (block leakage).
