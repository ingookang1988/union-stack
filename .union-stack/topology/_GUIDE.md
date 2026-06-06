# topology/ — ought × state (architecture norms) guide

> **Grid position:** ought × state. **Permission:** Schema (human only). **Change velocity:** near-immutable.

## What goes in
- Architecture rules: layer definitions, dependency direction, DDD/FSD boundaries.
- **Test strategy (tier 1):** the norms of "why & how we test." (concrete tools go to `.union-stack/contracts/`)
- Cross-cutting norms: *principles* of security/observability (concrete impl goes to code/contracts).
- The ZFS naming convention itself.

## What stays out
- Concrete types/signatures → `.union-stack/contracts/` (contract).
- The actual current code structure → `.union-stack/mechanism/derived/state`.
- Anything that is "this is how it is" rather than "this is how it ought to be" belongs elsewhere.

## Core distinction
- topology = *norms* ("the domain must not import infrastructure").
- A norm violation yields "bad code"; a contract violation yields "code that doesn't run." Don't mix them.

## Files
- `ARCH-00_zfs_naming.md` — the ZFS naming convention (this template's core norm)
- `ARCH-01_example_layers.md` — dummy layer rules
