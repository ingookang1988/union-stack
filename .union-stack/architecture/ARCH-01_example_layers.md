<!-- [Schema/ought] Dummy example. Replace with your own architecture. -->
---
id: ARCH-01
title: (example) Layer dependency rules
status: Active
version: 1.0
---

# [ARCH-01] (example) Clean-architecture layer rules

## Dependency direction (example)
`UI → App → Domain ← Infra` — the inner layer (Domain) does not import the outer ones.

## Test strategy (tier 1: why & how)
- Domain logic is unit-tested without infrastructure.
- All external dependencies are abstracted behind ports; adapters are mocked.
- E2E runs only at this boundary.
- (Concrete runner/fixture/mock calling conventions = tier 2, cataloged in `.union-stack/reference/contracts/`.)

> Everything above is a synthetic example. Replace it with your real stack's rules.
