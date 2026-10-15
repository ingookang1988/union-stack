# verification/ — arrow (verification) guide
> **Layer:** not a cell, but a dynamic verification plane connecting cell to cell.
> **Definition:** *take in* external reality (input), re-examine cross-cell consistency (process),
>   record only the divergences (output). It *does not generate or persist* reality.

## raw/ (input) — Permission: Append-only, written by the system (CI/CD) only, agent read-only
- A temporary inbox for external signals. Test logs · CI results. The agent cannot forge them.
- `raw/receipts.md` — execution receipts (PRO-22): one line per check run, written only by the runner (`ci.js`):
  sha · dirty · scope harness/product · name · exit · outcome · targets · passed/failed/skipped · reason · env · dur · gen · cmd.
  **targets = 0 is a failure, not a pass** (2-bis). `health` reads the age per blocking check; `work-close` matches `rcpt:` citations in WO evidence against these lines.

## derived/ (output) — Permission: Wiki, written by the agent
- gap.md: drift between norms (architecture) ↔ reality.
- state.md: the observed current code structure.

## Three verification arrows
- norms↔reality (Drift) → gap | contract↔reality (Contract) → FLOW self-correction | promise↔result (Promotion) → evidence
## Principle: never put input (raw) and output (derived) in the same folder.
